import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiError } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FoodMenu from "@/components/FoodMenu";
import FoodModal from "@/components/FoodModal";
import WhyUs from "@/components/WhyUs";
import Feedback from "@/components/Feedback";
import Contact from "@/components/Contact";
import CartSheet from "@/components/CartSheet";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);

  // Handle return from Stripe Checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const cancelled = params.get("payment");

    if (cancelled === "cancelled") {
      toast.error("Payment cancelled. Your order is still pending.");
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    if (!sessionId) return;

    let attempts = 0;
    const maxAttempts = 8;
    const poll = async () => {
      attempts += 1;
      try {
        const { data } = await api.get(`/checkout/status/${sessionId}`);
        if (data.payment_status === "paid") {
          toast.success(`Payment successful! Order #${data.order_id.slice(-6).toUpperCase()} · $${data.amount_total.toFixed(2)}`);
          sessionStorage.removeItem("etani_pending_session");
          window.history.replaceState({}, "", window.location.pathname);
          return;
        }
        if (data.status === "expired") {
          toast.error("Payment session expired. Please try again.");
          window.history.replaceState({}, "", window.location.pathname);
          return;
        }
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          toast("Still processing — refresh to recheck your payment.", { duration: 5000 });
          window.history.replaceState({}, "", window.location.pathname);
        }
      } catch (err) {
        toast.error(formatApiError(err));
        window.history.replaceState({}, "", window.location.pathname);
      }
    };
    toast("Confirming your payment…");
    poll();
  }, []);

  const openFood = (f) => { setSelected(f); setModalOpen(true); };

  const addToCart = (food, qty) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.food_id === food.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, {
        food_id: food.id, name: food.name, price: food.price,
        image: food.image, quantity: qty,
      }];
    });
    toast.success(`${qty} × ${food.name} added`);
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-etani-bg">
      <Navbar cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />

      <Hero
        userName={user?.name}
        onOrderClick={() => document.getElementById("food")?.scrollIntoView({ behavior: "smooth" })}
      />
      <FoodMenu onSelect={openFood} />
      <WhyUs />
      <Feedback />
      <Contact defaultName={user?.name} defaultEmail={user?.email} />

      <footer className="border-t border-etani-line py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display text-2xl text-etani-ink">Etani Cafe</div>
          <div className="text-sm text-etani-muted">© {new Date().getFullYear()} Etani Cafe · Made warm.</div>
        </div>
      </footer>

      <FoodModal
        food={selected}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addToCart}
      />
      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        cart={cart}
        setCart={setCart}
      />
    </div>
  );
}
