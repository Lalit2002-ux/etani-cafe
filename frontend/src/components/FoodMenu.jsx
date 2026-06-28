import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function FoodMenu({ onSelect }) {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [foodsRes, catsRes] = await Promise.all([
          api.get("/foods"),
          api.get("/foods/categories"),
        ]);
        if (!mounted) return;
        setFoods(foodsRes.data);
        setCategories(["All", ...catsRes.data]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = active === "All" ? foods : foods.filter((f) => f.category === active);

  return (
    <section id="food" className="bg-etani-bg py-20 md:py-28" data-testid="food-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-etani-terracotta font-medium">The menu</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-etani-ink">
              Today on the counter
            </h2>
            <p className="mt-3 text-etani-muted max-w-xl">
              Tap any plate to see the full story and place an order.
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-10" data-testid="category-filter">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={
                "px-5 py-2 rounded-full text-sm font-medium transition-colors " +
                (active === c
                  ? "bg-etani-ink text-etani-bg"
                  : "bg-etani-paper text-etani-ink hover:bg-etani-line")
              }
              data-testid={`category-${c.toLowerCase().replace(/\s+/g, "-")}-btn`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-etani-muted">Loading menu…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="food-grid">
            {filtered.map((f) => (
              <button
                key={f.id}
                onClick={() => onSelect(f)}
                className="group text-left bg-white rounded-2xl overflow-hidden border border-etani-line/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                data-testid={`food-card-${f.id}`}
              >
                <div className="relative w-full h-64 overflow-hidden">
                  <img
                    src={f.image}
                    alt={f.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 bg-etani-bg/90 backdrop-blur px-3 py-1 rounded-full text-[11px] uppercase tracking-widest text-etani-ink">
                    {f.category}
                  </span>
                </div>
                <div className="p-6 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-2xl font-semibold text-etani-ink leading-tight">{f.name}</h3>
                    <div className="text-etani-terracotta font-semibold text-lg whitespace-nowrap">${f.price.toFixed(2)}</div>
                  </div>
                  <p className="text-sm text-etani-muted line-clamp-2">{f.description}</p>
                  <div className="mt-3">
                    <Button asChild={false}
                      className="rounded-full bg-etani-ink hover:bg-etani-terracotta text-white px-5 h-10 text-sm">
                      View & Order
                    </Button>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
