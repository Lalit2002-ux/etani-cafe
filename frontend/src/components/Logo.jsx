export const LOGO_URL = "https://customer-assets.emergentagent.com/job_food-order-hub-217/artifacts/87652qui_image.png";

export function Logo({ className = "h-8 w-8", showText = true, textClassName = "font-display text-2xl font-semibold" }) {
  return (
    <span className="inline-flex items-center gap-2 text-etani-terracotta">
      <img
        src={LOGO_URL}
        alt="Etani Cafe"
        className={`${className} rounded-full object-cover`}
        data-testid="etani-logo"
      />
      {showText && <span className={textClassName}>Etani Cafe</span>}
    </span>
  );
}
