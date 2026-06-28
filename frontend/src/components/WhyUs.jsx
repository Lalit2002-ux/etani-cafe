import { Coffee, Leaf, Sparkles, HandHeart } from "lucide-react";

const ITEMS = [
  { icon: Coffee, title: "Single-origin coffee", text: "Roasted weekly in small batches. Brewed with patience, not pressure." },
  { icon: Leaf, title: "Local & seasonal", text: "Produce sourced from neighbourhood farms. Menu shifts with the seasons." },
  { icon: Sparkles, title: "Hand-made every day", text: "Doughs proofed overnight, chutneys ground fresh, nothing pre-packed." },
  { icon: HandHeart, title: "Made with care", text: "A team that cooks for you the way they&apos;d cook for family." },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="py-20 md:py-28" data-testid="why-us-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-12 items-end mb-14">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-etani-terracotta font-medium">Why Etani</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-etani-ink">
              Small kitchen.<br/><span className="italic">Big intentions.</span>
            </h2>
          </div>
          <p className="text-etani-muted text-lg leading-relaxed">
            Etani is built around the simple idea that a meal should feel like a small ritual — warm room, real ingredients, an honest plate, a cup that's worth the wait.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ITEMS.map((it) => (
            <div
              key={it.title}
              className="bg-white border border-etani-line/60 rounded-2xl p-6 hover:-translate-y-1 transition-transform"
              data-testid={`why-card-${it.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="h-12 w-12 rounded-full bg-etani-paper flex items-center justify-center text-etani-terracotta">
                <it.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold text-etani-ink">{it.title}</h3>
              <p className="mt-2 text-sm text-etani-muted leading-relaxed">{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
