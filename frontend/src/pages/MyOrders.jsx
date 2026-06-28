import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, ReceiptText, CreditCard } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/orders/mine");
        setOrders(data);
      } catch (err) {
        toast.error(formatApiError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const payNow = async (orderId) => {
    setPayingId(orderId);
    try {
      const { data: sess } = await api.post("/checkout/session", {
        order_id: orderId,
        origin_url: window.location.origin,
      });
      window.location.href = sess.url;
    } catch (err) {
      toast.error(formatApiError(err));
      setPayingId(null);
    }
  };

  const totalSpent = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="min-h-screen bg-etani-bg">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-etani-bg/80 border-b border-etani-line">
        <div className="max-w-5xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center" data-testid="myorders-brand">
            <Logo className="h-9 w-9" />
          </Link>
          <Button asChild variant="ghost" className="text-etani-ink hover:bg-etani-paper" data-testid="myorders-back-button">
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" />Back to menu</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-12 py-12">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-etani-terracotta font-medium">Your history</p>
            <h1 className="mt-3 font-display text-5xl font-semibold text-etani-ink">My Orders</h1>
            <p className="mt-2 text-etani-muted">Every plate you&apos;ve had with us — receipts kept warm.</p>
          </div>
          <div className="bg-white border border-etani-line rounded-2xl px-6 py-4 text-right">
            <div className="text-xs uppercase tracking-widest text-etani-muted">Lifetime spend</div>
            <div className="font-display text-3xl text-etani-terracotta" data-testid="myorders-total-spent">
              ${totalSpent.toFixed(2)}
            </div>
            <div className="text-xs text-etani-muted">{orders.length} order{orders.length === 1 ? "" : "s"}</div>
          </div>
        </div>

        {loading && <div className="text-etani-muted">Loading…</div>}

        {!loading && orders.length === 0 && (
          <div className="bg-white border border-etani-line rounded-2xl p-12 text-center" data-testid="myorders-empty">
            <ReceiptText className="h-10 w-10 text-etani-line mx-auto" />
            <p className="mt-4 text-etani-ink font-medium">No orders yet</p>
            <p className="mt-1 text-sm text-etani-muted">
              Your first plate is one tap away.
            </p>
            <Button asChild className="mt-6 rounded-full bg-etani-terracotta hover:bg-etani-terracottaDark text-white">
              <Link to="/">Browse the menu</Link>
            </Button>
          </div>
        )}

        <div className="space-y-4" data-testid="myorders-list">
          {orders.map((o) => {
            const paid = o.payment_status === "paid";
            return (
              <article
                key={o.id}
                className="bg-white border border-etani-line rounded-2xl p-6"
                data-testid={`myorders-row-${o.id}`}
              >
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="font-display text-2xl text-etani-ink">
                      Order #{o.id.slice(-6).toUpperCase()}
                    </div>
                    <div className="text-xs text-etani-muted mt-1">
                      {new Date(o.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-3xl text-etani-terracotta">
                      ${o.total.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-2 mt-1 justify-end">
                      <span className={
                        "text-[10px] uppercase tracking-widest px-2 py-1 rounded-full " +
                        (paid
                          ? "bg-etani-sage/15 text-etani-sageDark"
                          : "bg-etani-paper text-etani-muted")
                      } data-testid={`myorders-status-${o.id}`}>
                        {paid ? "Paid" : "Unpaid"}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-etani-paper text-etani-muted">
                        {o.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid sm:grid-cols-2 gap-3">
                  {o.items.map((i, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img src={i.image} alt={i.name} className="h-12 w-12 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <div className="font-medium text-etani-ink truncate">{i.name}</div>
                        <div className="text-xs text-etani-muted">
                          {i.quantity} × ${i.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {o.notes && (
                  <div className="mt-4 text-sm italic text-etani-muted border-t border-etani-line/60 pt-3">
                    Note: {o.notes}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-3 border-t border-etani-line/60 pt-4">
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-etani-line text-etani-ink hover:bg-etani-paper"
                    data-testid={`view-receipt-${o.id}`}
                  >
                    <Link to={`/orders/${o.id}`}>
                      <ReceiptText className="h-4 w-4 mr-2" />View receipt
                    </Link>
                  </Button>
                  {!paid && (
                    <Button
                      onClick={() => payNow(o.id)}
                      disabled={payingId === o.id}
                      className="rounded-full bg-etani-terracotta hover:bg-etani-terracottaDark text-white"
                      data-testid={`pay-now-${o.id}`}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {payingId === o.id ? "Redirecting…" : "Pay now"}
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
