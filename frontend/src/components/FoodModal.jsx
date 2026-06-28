import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

export default function FoodModal({ food, open, onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  useEffect(() => { if (open) setQty(1); }, [open, food?.id]);

  if (!food) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-3xl p-0 overflow-hidden rounded-2xl border-etani-line bg-white"
        data-testid="food-modal"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="h-64 md:h-full">
            <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-8 md:p-10 flex flex-col">
            <DialogTitle asChild>
              <span className="text-xs uppercase tracking-[0.25em] text-etani-terracotta font-medium">
                {food.category}
              </span>
            </DialogTitle>
            <h3 className="mt-2 font-display text-3xl md:text-4xl font-semibold text-etani-ink leading-tight">
              {food.name}
            </h3>
            <DialogDescription asChild>
              <p className="mt-4 text-etani-muted leading-relaxed">{food.description}</p>
            </DialogDescription>

            <div className="mt-6 text-etani-terracotta font-display text-3xl font-semibold">
              ${food.price.toFixed(2)}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <span className="text-sm uppercase tracking-widest text-etani-muted">Quantity</span>
              <div className="flex items-center gap-2 bg-etani-paper rounded-full p-1">
                <Button
                  variant="ghost"
                  className="h-9 w-9 rounded-full p-0 hover:bg-white"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  data-testid="qty-minus-btn"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium" data-testid="qty-value">{qty}</span>
                <Button
                  variant="ghost"
                  className="h-9 w-9 rounded-full p-0 hover:bg-white"
                  onClick={() => setQty((q) => q + 1)}
                  data-testid="qty-plus-btn"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-auto pt-8 flex gap-3">
              <Button
                onClick={() => { onAdd(food, qty); onClose(); }}
                className="rounded-full bg-etani-terracotta hover:bg-etani-terracottaDark text-white h-12 px-8 flex-1"
                data-testid="add-to-order-button"
              >
                Add to Order · ${(food.price * qty).toFixed(2)}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-full h-12 px-6 border-etani-line text-etani-ink hover:bg-etani-paper"
                data-testid="close-modal-button"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
