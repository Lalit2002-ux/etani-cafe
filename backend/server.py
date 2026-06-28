from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Annotated

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# ---------- DB ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


# ---------- Helpers ----------
JWT_ALGORITHM = "HS256"
JWT_EXP_HOURS = 24 * 7  # 7 days

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXP_HOURS),
        "type": "access",
    }
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)


# ---------- Models ----------
class UserPublic(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str

class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    token: str
    user: UserPublic

class FoodItem(BaseModel):
    id: str
    name: str
    description: str
    price: float
    category: str
    image: str
    available: bool = True

class FoodItemCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image: str
    available: bool = True

class FoodItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image: Optional[str] = None
    available: Optional[bool] = None

class OrderItemIn(BaseModel):
    food_id: str
    quantity: int = Field(ge=1)

class OrderCreate(BaseModel):
    items: List[OrderItemIn]
    notes: Optional[str] = ""

class OrderLine(BaseModel):
    food_id: str
    name: str
    price: float
    quantity: int
    image: str

class Order(BaseModel):
    id: str
    user_id: str
    user_email: str
    user_name: str
    items: List[OrderLine]
    total: float
    notes: str = ""
    status: str = "placed"
    created_at: str

class FeedbackIn(BaseModel):
    rating: int = Field(ge=1, le=5)
    message: str = Field(min_length=1, max_length=1000)

class FeedbackOut(BaseModel):
    id: str
    user_id: str
    user_name: str
    rating: int
    message: str
    created_at: str

class ContactIn(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


# ---------- Auth dependency ----------
security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(security)],
) -> dict:
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "role": user.get("role", "user"),
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ---------- App ----------
app = FastAPI(title="Etani Cafe API")
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "Etani Cafe API"}


# ----- Auth routes -----
@api_router.post("/auth/register", response_model=AuthResponse)
async def register(data: RegisterIn):
    email = data.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "email": email,
        "name": data.name.strip(),
        "password_hash": hash_password(data.password),
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    res = await db.users.insert_one(doc)
    uid = str(res.inserted_id)
    token = create_access_token(uid, email, "user")
    return AuthResponse(
        token=token,
        user=UserPublic(id=uid, email=email, name=doc["name"], role="user"),
    )

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(data: LoginIn):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    uid = str(user["_id"])
    role = user.get("role", "user")
    token = create_access_token(uid, email, role)
    return AuthResponse(
        token=token,
        user=UserPublic(id=uid, email=email, name=user["name"], role=role),
    )

@api_router.get("/auth/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)):
    return UserPublic(**user)


# ----- Food routes -----
@api_router.get("/foods", response_model=List[FoodItem])
async def list_foods(category: Optional[str] = None):
    q = {} if not category or category == "All" else {"category": category}
    docs = await db.foods.find(q).to_list(500)
    return [FoodItem(**{**d, "id": str(d["_id"])}, ) if False else FoodItem(
        id=str(d["_id"]),
        name=d["name"],
        description=d["description"],
        price=d["price"],
        category=d["category"],
        image=d["image"],
        available=d.get("available", True),
    ) for d in docs]

@api_router.get("/foods/categories", response_model=List[str])
async def list_categories():
    cats = await db.foods.distinct("category")
    return sorted(cats)

@api_router.get("/foods/{food_id}", response_model=FoodItem)
async def get_food(food_id: str):
    try:
        d = await db.foods.find_one({"_id": ObjectId(food_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    if not d:
        raise HTTPException(status_code=404, detail="Food not found")
    return FoodItem(
        id=str(d["_id"]),
        name=d["name"], description=d["description"], price=d["price"],
        category=d["category"], image=d["image"], available=d.get("available", True),
    )

@api_router.post("/foods", response_model=FoodItem)
async def create_food(data: FoodItemCreate, _admin: dict = Depends(require_admin)):
    doc = data.model_dump()
    res = await db.foods.insert_one(doc)
    return FoodItem(id=str(res.inserted_id), **doc)

@api_router.put("/foods/{food_id}", response_model=FoodItem)
async def update_food(food_id: str, data: FoodItemUpdate, _admin: dict = Depends(require_admin)):
    upd = {k: v for k, v in data.model_dump().items() if v is not None}
    if not upd:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = await db.foods.find_one_and_update(
        {"_id": ObjectId(food_id)}, {"$set": upd}, return_document=True
    )
    if not res:
        raise HTTPException(status_code=404, detail="Food not found")
    d = await db.foods.find_one({"_id": ObjectId(food_id)})
    return FoodItem(
        id=str(d["_id"]),
        name=d["name"], description=d["description"], price=d["price"],
        category=d["category"], image=d["image"], available=d.get("available", True),
    )

@api_router.delete("/foods/{food_id}")
async def delete_food(food_id: str, _admin: dict = Depends(require_admin)):
    res = await db.foods.delete_one({"_id": ObjectId(food_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Food not found")
    return {"ok": True}


# ----- Orders -----
@api_router.post("/orders", response_model=Order)
async def create_order(data: OrderCreate, user: dict = Depends(get_current_user)):
    if not data.items:
        raise HTTPException(status_code=400, detail="Order must contain at least 1 item")
    lines: List[dict] = []
    total = 0.0
    for it in data.items:
        try:
            food = await db.foods.find_one({"_id": ObjectId(it.food_id)})
        except Exception:
            raise HTTPException(status_code=400, detail=f"Invalid food id: {it.food_id}")
        if not food:
            raise HTTPException(status_code=404, detail=f"Food {it.food_id} not found")
        line_total = food["price"] * it.quantity
        total += line_total
        lines.append({
            "food_id": str(food["_id"]),
            "name": food["name"],
            "price": food["price"],
            "quantity": it.quantity,
            "image": food["image"],
        })
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "user_id": user["id"],
        "user_email": user["email"],
        "user_name": user["name"],
        "items": lines,
        "total": round(total, 2),
        "notes": data.notes or "",
        "status": "placed",
        "created_at": now,
    }
    res = await db.orders.insert_one(doc)
    return Order(id=str(res.inserted_id), **{k: v for k, v in doc.items()})

@api_router.get("/orders/mine", response_model=List[Order])
async def my_orders(user: dict = Depends(get_current_user)):
    docs = await db.orders.find({"user_id": user["id"]}).sort("created_at", -1).to_list(200)
    return [Order(id=str(d["_id"]), user_id=d["user_id"], user_email=d["user_email"],
                  user_name=d["user_name"], items=d["items"], total=d["total"],
                  notes=d.get("notes", ""), status=d.get("status", "placed"),
                  created_at=d["created_at"]) for d in docs]

@api_router.get("/orders", response_model=List[Order])
async def all_orders(_admin: dict = Depends(require_admin)):
    docs = await db.orders.find({}).sort("created_at", -1).to_list(500)
    return [Order(id=str(d["_id"]), user_id=d["user_id"], user_email=d["user_email"],
                  user_name=d["user_name"], items=d["items"], total=d["total"],
                  notes=d.get("notes", ""), status=d.get("status", "placed"),
                  created_at=d["created_at"]) for d in docs]


# ----- Feedback -----
@api_router.post("/feedback", response_model=FeedbackOut)
async def submit_feedback(data: FeedbackIn, user: dict = Depends(get_current_user)):
    doc = {
        "user_id": user["id"],
        "user_name": user["name"],
        "rating": data.rating,
        "message": data.message.strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    res = await db.feedback.insert_one(doc)
    return FeedbackOut(id=str(res.inserted_id), **doc)

@api_router.get("/feedback", response_model=List[FeedbackOut])
async def list_feedback():
    docs = await db.feedback.find({}).sort("created_at", -1).to_list(100)
    return [FeedbackOut(id=str(d["_id"]), user_id=d["user_id"], user_name=d["user_name"],
                        rating=d["rating"], message=d["message"],
                        created_at=d["created_at"]) for d in docs]


# ----- Contact -----
@api_router.post("/contact")
async def submit_contact(data: ContactIn):
    doc = data.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contacts.insert_one(doc)
    return {"ok": True, "message": "Thank you! We'll get back to you soon."}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


SEED_FOODS = [
    # Coffee
    {"name": "Etani Signature Latte", "description": "Velvety espresso with steamed milk and a delicate cocoa dust finish.", "price": 4.5, "category": "Coffee", "image": "https://images.unsplash.com/photo-1684429739445-33c981ee8e92?crop=entropy&cs=srgb&fm=jpg&w=900&q=80"},
    {"name": "Cold Brew Concentrate", "description": "18-hour slow steeped, smooth and full bodied, served over ice.", "price": 4.0, "category": "Coffee", "image": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=900&q=80"},
    {"name": "Masala Chai", "description": "House-spiced Indian chai with cardamom, ginger and clove.", "price": 3.5, "category": "Coffee", "image": "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=900&q=80"},
    # Indian Street Food
    {"name": "Crispy Samosas (3 pc)", "description": "Golden flaky pastry stuffed with spiced potatoes and peas, served with tamarind chutney.", "price": 6.0, "category": "Indian Street Food", "image": "https://images.pexels.com/photos/14477873/pexels-photo-14477873.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
    {"name": "Pav Bhaji", "description": "Buttery mashed vegetable curry with toasted pav buns, onions and lime.", "price": 9.0, "category": "Indian Street Food", "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=900&q=80"},
    {"name": "Vada Pav", "description": "Mumbai's iconic spiced potato fritter in a soft bun with garlic chutney.", "price": 5.5, "category": "Indian Street Food", "image": "https://images.unsplash.com/photo-1606491048802-8342506d6471?w=900&q=80"},
    # Burgers
    {"name": "Etani Smash Burger", "description": "Two thin smashed patties, melted cheddar, caramelised onions, house sauce.", "price": 11.5, "category": "Burgers", "image": "https://images.pexels.com/photos/20321807/pexels-photo-20321807.jpeg"},
    {"name": "Paneer Tikka Burger", "description": "Charred tandoori paneer, mint slaw, pickled onions in a brioche bun.", "price": 10.5, "category": "Burgers", "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=80"},
    # Pizza
    {"name": "Wood-Fired Margherita", "description": "San Marzano tomato, fresh mozzarella, basil, extra virgin olive oil.", "price": 13.0, "category": "Pizza", "image": "https://images.unsplash.com/photo-1777333033347-6757045adc9c?w=900&q=80"},
    {"name": "Tandoori Chicken Pizza", "description": "Tandoori chicken, red onion, coriander on a chili-tomato base.", "price": 14.5, "category": "Pizza", "image": "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=900&q=80"},
    # Pasta
    {"name": "Truffle Mushroom Pasta", "description": "Tagliatelle tossed in cream, wild mushrooms and shaved truffle.", "price": 15.0, "category": "Pasta", "image": "https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=900&q=80"},
    {"name": "Arrabbiata Penne", "description": "Spicy tomato sugo, chili, garlic, fresh basil, pecorino.", "price": 12.5, "category": "Pasta", "image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=900&q=80"},
    # Desserts
    {"name": "Gulab Jamun Cheesecake", "description": "Indo-fusion: silky cheesecake with rose-syrup soaked gulab jamun.", "price": 7.5, "category": "Desserts", "image": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=900&q=80"},
    {"name": "Tiramisu Cup", "description": "Espresso-soaked ladyfingers, mascarpone cream, cocoa dust.", "price": 6.5, "category": "Desserts", "image": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=900&q=80"},
]


@app.on_event("startup")
async def startup():
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@etanicafe.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email,
            "name": "Etani Admin",
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin user {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password), "role": "admin"}},
        )
        logger.info(f"Updated admin password for {admin_email}")

    # Indexes
    await db.users.create_index("email", unique=True)
    await db.orders.create_index("user_id")
    await db.foods.create_index("category")

    # Seed foods if none
    count = await db.foods.count_documents({})
    if count == 0:
        await db.foods.insert_many([{**f, "available": True} for f in SEED_FOODS])
        logger.info(f"Seeded {len(SEED_FOODS)} food items")


@app.on_event("shutdown")
async def shutdown():
    client.close()
