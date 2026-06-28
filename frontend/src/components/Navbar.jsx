import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Coffee, ShoppingBag, User as UserIcon, Menu, X } from "lucide-react";

const LINKS = [
  { id: "food", label: "Food" },
  { id: "why-us", label: "Why Us" },
  { id: "contact", label: "Contact Us" },
  { id: "feedback", label: "Feedback" },
];

export default function Navbar({ cartCount, onOpenCart }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl bg-etani-bg/80 border-b border-etani-line/60"
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-2 text-etani-terracotta" data-testid="navbar-brand">
          <Coffee className="h-6 w-6" />
          <span className="font-display text-2xl font-semibold">Etani Cafe</span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className="text-sm uppercase tracking-[0.18em] font-medium text-etani-ink hover:text-etani-terracotta transition-colors"
              data-testid={`nav-${l.id}-link`}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="relative h-10 px-3 text-etani-ink hover:text-etani-terracotta hover:bg-etani-paper"
            onClick={onOpenCart}
            data-testid="open-cart-button"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 bg-etani-terracotta text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-semibold"
                data-testid="cart-count-badge"
              >
                {cartCount}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 px-3 text-etani-ink hover:text-etani-terracotta hover:bg-etani-paper"
                data-testid="user-menu-button"
              >
                <UserIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="font-medium text-etani-ink">{user?.name}</div>
                <div className="text-xs text-etani-muted">{user?.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild data-testid="goto-myorders-menu-item">
                <Link to="/orders">My Orders</Link>
              </DropdownMenuItem>
              {user?.role === "admin" && (
                <DropdownMenuItem asChild data-testid="goto-admin-menu-item">
                  <Link to="/admin">Admin panel</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={logout} data-testid="logout-menu-item">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            className="md:hidden h-10 px-3 text-etani-ink"
            onClick={() => setMobileOpen((v) => !v)}
            data-testid="mobile-menu-toggle"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-etani-line/60 bg-etani-bg" data-testid="mobile-nav">
          <div className="px-6 py-4 flex flex-col gap-3">
            {LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="text-left text-sm uppercase tracking-[0.18em] py-2 text-etani-ink hover:text-etani-terracotta"
                data-testid={`mobile-nav-${l.id}-link`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
