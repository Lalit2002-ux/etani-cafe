import { Button } from "@/components/ui/button";

export default function Hero({ userName, onOrderClick }) {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 pt-12 md:pt-20 pb-16 md:pb-24" data-testid="hero-section">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="animate-fade-up">
          <p className="text-sm uppercase tracking-[0.25em] text-etani-terracotta font-medium">
            Welcome back, {userName?.split(" ")[0] || "friend"}
          </p>
          <h1 className="mt-5 font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-etani-ink leading-[0.95]">
            Slow mornings,<br />
            <span className="italic font-medium">honest food</span>,<br />
            an open table.
          </h1>
          <p className="mt-6 text-etani-muted text-lg max-w-md leading-relaxed">
            A small neighbourhood cafe pouring specialty coffee, hand-tossed pizza, fiery Indian street food and slow-cooked pasta. Order in, eat in.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              onClick={onOrderClick}
              className="rounded-full bg-etani-terracotta hover:bg-etani-terracottaDark text-white h-12 px-8 text-base"
              data-testid="hero-order-button"
            >
              Browse the Menu
            </Button>
            <Button
              variant="outline"
              onClick={() => document.getElementById("why-us")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-full bg-transparent border-etani-ink/15 hover:bg-etani-paper text-etani-ink h-12 px-8 text-base"
              data-testid="hero-why-us-button"
            >
              Why Etani
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
            <div>
              <div className="font-display text-4xl text-etani-ink">14</div>
              <div className="text-xs uppercase tracking-widest text-etani-muted mt-1">Signature dishes</div>
            </div>
            <div>
              <div className="font-display text-4xl text-etani-ink">6</div>
              <div className="text-xs uppercase tracking-widest text-etani-muted mt-1">Cuisines on tap</div>
            </div>
            <div>
              <div className="font-display text-4xl text-etani-ink">4.9</div>
              <div className="text-xs uppercase tracking-widest text-etani-muted mt-1">Guest rating</div>
            </div>
          </div>
        </div>

        <div className="relative animate-fade-up">
          <img
            src="https://images.unsplash.com/photo-1728761390316-935ffeb3fbcc?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80"
            alt="Warm cafe interior"
            className="w-full h-[60vh] md:h-[78vh] object-cover rounded-t-[8rem] rounded-b-xl shadow-xl"
          />
          <div className="hidden md:block absolute -bottom-6 -left-6 bg-white px-6 py-4 rounded-2xl shadow-lg border border-etani-line">
            <div className="text-xs uppercase tracking-widest text-etani-muted">Open today</div>
            <div className="font-display text-2xl text-etani-ink">7:30 — 22:00</div>
          </div>
        </div>
      </div>
    </section>
  );
}
