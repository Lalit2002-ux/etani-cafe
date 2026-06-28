# Etani Cafe — PRD

## Original Problem Statement
Build a fully responsive restaurant ordering website named **Etani Cafe**.
- Login & Signup pages
- Dashboard with navbar: Food, Why Us, Contact Us, Feedback
- Food section: list of foods; click a food → image, quantity selector, place order
- Clean UI, warm color palette

## User Choices (from clarification)
- Auth: JWT (custom email/password)
- Checkout: Mock (order saved in DB)
- Menu vibe: Multi-cuisine + coffee + Indian street food
- Admin panel: Yes + pre-seeded sample menu
- Design: Warm & cozy + modern minimal

## Architecture
- **Backend**: FastAPI + Motor (MongoDB). JWT auth (PyJWT, bcrypt). All routes prefixed `/api`.
- **Frontend**: React + Tailwind + shadcn/ui. Axios for API. Token stored in localStorage.
- **DB**: MongoDB collections — `users`, `foods`, `orders`, `feedback`, `contacts`.

## Personas
- **Guest**: Browse hero + menu, must login to order.
- **Customer (user)**: Browse, add to cart, place order, leave feedback, contact.
- **Admin**: All customer actions + manage menu + view all orders.

## Completed (Feb 2026)
- JWT auth (register, login, /me) with bcrypt
- Admin seed on startup
- Food CRUD (admin) + public list/detail + categories
- Order placement + my-orders + all-orders (admin)
- **Stripe Checkout (TEST MODE)** — `/api/checkout/session`, `/api/checkout/status/{id}`, `/api/webhook/stripe`. Uses `sk_test_emergent`. No real charges.
- Payment-status polling on Dashboard return, idempotent order-paid flip
- Feedback (auth) + Contact (public)
- Pre-seeded 14 food items across 6 categories
- Login & Signup pages
- Dashboard SPA: Hero, Menu grid, Food detail modal with qty, Cart sheet,
  Why Us, Feedback form, Contact form, Navbar with smooth scroll
- Admin panel: list/add/edit/delete foods, view orders with paid/unpaid badge
- Warm "Organic & Earthy" theme (Cormorant Garamond + Outfit)

## Backlog
- P1: Search/filter on menu
- P1: Order history page (user side polished list)
- P2: Image upload for admin (object storage)
- P2: Real Stripe payments
- P2: Email confirmation on order
