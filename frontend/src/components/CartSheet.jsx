import { useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

export default function CartSheet({ open, onOpenChange, cart, setCart }) {
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const updateQty = (id, delta) => {
    setCart((c) =>
      c.map((i) => (i.food_id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
    );
  };
  const remove = (id) => setCart((c) => c.filter((i) => i.food_id !== id));

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setBusy(true);
    try {
      const payload = {
        items: cart.map((i) => ({ food_id: i.food_id, quantity: i.quantity })),
        notes,
      };
      const { data } = await api.post("/orders", payload);
      toast.success(`Order placed! #${data.id.slice(-6).toUpperCase()} · $${data.total.toFixed(2)}`);
      setCart([]);
      setNotes("");
      onOpenChange(false);
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="bg-etani-bg border-etani-line w-full sm:max-w-md flex flex-col"
        data-testid="cart-sheet"
      >
        <SheetHeader>
          <SheetTitle className="font-display text-3xl text-etani-ink">Your Order</SheetTitle>
          <SheetDescription className="text-etani-muted">
            Review your plates before placing the order.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-6 -mx-6 px-6 space-y-3">
          {cart.length === 0 && (
            <div className="text-center py-16">
              <ShoppingBag className="h-10 w-10 text-etani-line mx-auto" />
              <p className="mt-3 text-etani-muted text-sm">Your cart is empty. Pick a plate from the menu.</p>
            </div>
          )}
          {cart.map((i) => (
            <div key={i.food_id} className="flex gap-3 bg-white rounded-xl p-3 border border-etani-line" data-testid={`cart-item-${i.food_id}`}>
              <img src={i.image} alt={i.name} className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-etani-ink truncate">{i.name}</div>
                <div className="text-sm text-etani-terracotta">${i.price.toFixed(2)}</div>
                <div className="mt-1 flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => updateQty(i.food_id, -1)} data-testid={`cart-minus-${i.food_id}`}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm">{i.quantity}</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => updateQty(i.food_id, 1)} data-testid={`cart-plus-${i.food_id}`}>
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 ml-auto text-etani-terracotta" onClick={() => remove(i.food_id)} data-testid={`cart-remove-${i.food_id}`}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-etani-line pt-4 space-y-3 mt-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note for the kitchen (optional)"
              className="bg-white border-etani-line rounded-xl min-h-[60px]"
              data-testid="cart-notes-input"
            />
            <div className="flex items-center justify-between">
              <span className="text-etani-muted text-sm uppercase tracking-widest">Total</span>
              <span className="font-display text-3xl text-etani-ink" data-testid="cart-total">${total.toFixed(2)}</span>
            </div>
            <Button
              onClick={placeOrder}
              disabled={busy}
              className="w-full h-12 rounded-full bg-etani-terracotta hover:bg-etani-terracottaDark text-white"
              data-testid="place-order-button"
            >
              {busy ? "Placing…" : "Place Order"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
