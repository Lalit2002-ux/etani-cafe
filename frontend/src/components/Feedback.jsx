import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Star } from "lucide-react";

export default function Feedback() {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState([]);

  const load = async () => {
    try {
      const { data } = await api.get("/feedback");
      setItems(data);
    } catch { /* ignore */ }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return toast.error("Please share a few words");
    setBusy(true);
    try {
      await api.post("/feedback", { rating, message: msg.trim() });
      toast.success("Thanks for the kind note ");
      setMsg(""); setRating(5);
      load();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="feedback" className="bg-etani-paper py-20 md:py-28" data-testid="feedback-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-etani-terracotta font-medium">Your voice</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-etani-ink">
            Tell us how we did
          </h2>
          <p className="mt-3 text-etani-muted max-w-md">
            Every note is read by the team over the next morning&apos;s coffee.
          </p>

          <form onSubmit={submit} className="mt-8 bg-white rounded-2xl p-6 border border-etani-line">
            <div className="flex items-center gap-2 mb-4" data-testid="feedback-rating">
              {[1,2,3,4,5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  data-testid={`feedback-star-${n}`}
                  aria-label={`Rate ${n} stars`}
                >
                  <Star
                    className={
                      "h-7 w-7 " +
                      ((hover || rating) >= n ? "fill-etani-terracotta text-etani-terracotta" : "text-etani-line")
                    }
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-etani-muted">{rating}/5</span>
            </div>
            <Textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="What did you love? What can we do better?"
              className="bg-white border-etani-line rounded-xl min-h-[120px]"
              data-testid="feedback-message-input"
            />
            <Button
              type="submit"
              disabled={busy}
              className="mt-4 rounded-full bg-etani-terracotta hover:bg-etani-terracottaDark text-white h-11 px-7"
              data-testid="feedback-submit-button"
            >
              {busy ? "Sending…" : "Send Feedback"}
            </Button>
          </form>
        </div>

        <div className="space-y-4" data-testid="feedback-list">
          <h3 className="font-display text-2xl text-etani-ink">From the table</h3>
          {items.length === 0 && (
            <p className="text-etani-muted text-sm">Be the first to leave a note.</p>
          )}
          {items.slice(0, 6).map((f) => (
            <div key={f.id} className="bg-white border border-etani-line rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-etani-ink">{f.user_name}</span>
                <div className="flex">
                  {Array.from({ length: f.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-etani-terracotta text-etani-terracotta" />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm text-etani-muted leading-relaxed">{f.message}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
