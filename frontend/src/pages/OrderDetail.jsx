import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Printer, CreditCard } from "lucide-react";
import { Logo, LOGO_URL } from "@/components/Logo";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        toast.error(formatApiError(err));
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const payNow = async () => {
    setPaying(true);
    try {
      const { data: sess } = await api.post("/checkout/session", {
        order_id: id,
        origin_url: window.location.origin,
      });
      window.location.href = sess.url;
    } catch (err) {
      toast.error(formatApiError(err));
      setPaying(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-etani-muted">Loading…</div>;
  }
  if (!order) return null;

  const paid = order.payment_status === "paid";
  const shortId = order.id.slice(-6).toUpperCase();

  return (
    <div className="min-h-screen bg-etani-bg">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body, html { background: white !important; }
          .receipt-card { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <header className="sticky top-0 z-30 backdrop-blur-xl bg-etani-bg/80 border-b border-etani-line no-print">
        <div className="max-w-3xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center" data-testid="receipt-brand">
            <Logo className="h-9 w-9" />
          </Link>
          <Button asChild variant="ghost" className="text-etani-ink hover:bg-etani-paper" data-testid="receipt-back-button">
            <Link to="/orders"><ArrowLeft className="h-4 w-4 mr-1" />All orders</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 md:px-12 py-12">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6 no-print">
          <h1 className="font-display text-4xl font-semibold text-etani-ink">Receipt</h1>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="rounded-full border-etani-line text-etani-ink hover:bg-etani-paper"
              data-testid="print-receipt-button"
            >
              <Printer className="h-4 w-4 mr-2" />Print
            </Button>
            {!paid && (
              <Button
                onClick={payNow}
                disabled={paying}
                className="rounded-full bg-etani-terracotta hover:bg-etani-terracottaDark text-white"
                data-testid="receipt-pay-now-button"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {paying ? "Redirecting…" : "Pay now"}
              </Button>
            )}
          </div>
        </div>

        <article
          className="receipt-card bg-white border border-etani-line rounded-2xl p-8 md:p-12 shadow-sm"
          data-testid="receipt-card"
        >
          <div className="flex items-start justify-between flex-wrap gap-4 pb-6 border-b border-etani-line">
            <div>
              <div className="flex items-center gap-3 text-etani-terracotta">
                <img src={LOGO_URL} alt="Etani Cafe" className="h-12 w-12 rounded-full object-cover" />
                <span className="font-display text-3xl font-semibold">Etani Cafe</span>
              </div>
              <p className="mt-2 text-sm text-etani-muted">
                42, Linden Lane · Bandra West, Mumbai 400050<br/>
                hello@etanicafe.com · +91 98765 43210
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest text-etani-muted">Receipt</div>
              <div className="font-display text-3xl text-etani-ink" data-testid="receipt-order-id">
                #{shortId}
              </div>
              <div className="text-xs text-etani-muted mt-1">
                {new Date(order.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 py-6 border-b border-etani-line text-sm">
            <div>
              <div className="text-xs uppercase tracking-widest text-etani-muted">Customer</div>
              <div className="mt-1 text-etani-ink font-medium">{order.user_name}</div>
              <div className="text-etani-muted">{order.user_email}</div>
            </div>
            <div className="ml-auto flex gap-2">
              <span className={
                "text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full self-start " +
                (paid
                  ? "bg-etani-sage/15 text-etani-sageDark"
                  : "bg-etani-paper text-etani-muted")
              } data-testid="receipt-payment-status">
                {paid ? "Paid" : "Unpaid"}
              </span>
              <span className="text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full self-start bg-etani-paper text-etani-muted">
                {order.status}
              </span>
            </div>
          </div>

          <div className="py-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-etani-muted border-b border-etani-line">
                  <th className="pb-3">Item</th>
                  <th className="pb-3 text-center w-20">Qty</th>
                  <th className="pb-3 text-right w-24">Price</th>
                  <th className="pb-3 text-right w-24">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((i, idx) => (
                  <tr key={idx} className="border-b border-etani-line/40" data-testid={`receipt-line-${idx}`}>
                    <td className="py-3 text-etani-ink">{i.name}</td>
                    <td className="py-3 text-center text-etani-muted">{i.quantity}</td>
                    <td className="py-3 text-right text-etani-muted">${i.price.toFixed(2)}</td>
                    <td className="py-3 text-right text-etani-ink font-medium">
                      ${(i.price * i.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-72 space-y-2 text-sm">
              <div className="flex justify-between text-etani-muted">
                <span>Subtotal</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-etani-muted">
                <span>Tax</span>
                <span>Inclusive</span>
              </div>
              <div className="flex justify-between border-t border-etani-line pt-3">
                <span className="font-display text-2xl text-etani-ink">Total</span>
                <span className="font-display text-2xl text-etani-terracotta" data-testid="receipt-total">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="mt-8 pt-6 border-t border-etani-line text-sm italic text-etani-muted">
              Note for the kitchen: {order.notes}
            </div>
          )}

          <p className="mt-10 text-center text-xs uppercase tracking-[0.3em] text-etani-muted">
            Thank you · Come back soon
          </p>
        </article>
      </main>
    </div>
  );
}
