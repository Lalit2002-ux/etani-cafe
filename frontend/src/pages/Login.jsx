import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useState } from "react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const res = await login(email, password);
    setBusy(false);
    if (res.ok) {
      toast.success("Welcome back to Etani Cafe");
      navigate("/");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:block relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1728761390316-935ffeb3fbcc?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80"
          alt="Cafe interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-etani-ink/30" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <h1 className="font-display text-5xl lg:text-6xl font-semibold leading-tight">
            A quiet corner.<br/>A warm cup.<br/>Always Etani.
          </h1>
          <p className="mt-4 text-white/80 text-sm uppercase tracking-[0.25em]">Established with love</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-etani-bg">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center mb-10" data-testid="brand-link">
            <Logo className="h-10 w-10" />
          </Link>
          <h2 className="font-display text-4xl font-semibold text-etani-ink">Welcome back</h2>
          <p className="mt-2 text-etani-muted">Sign in to place your order.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-etani-ink">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-etani-line h-12 rounded-xl"
                data-testid="login-email-input"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-etani-ink">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-etani-line h-12 rounded-xl"
                data-testid="login-password-input"
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full h-12 rounded-full bg-etani-terracotta hover:bg-etani-terracottaDark text-white font-medium"
              data-testid="login-submit-button"
            >
              {busy ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-etani-muted">
            New to Etani?{" "}
            <Link to="/signup" className="text-etani-terracotta hover:text-etani-terracottaDark font-medium" data-testid="goto-signup-link">
              Create an account
            </Link>
          </p>
          <p className="mt-2 text-xs text-etani-muted/80">
            Admin demo: <span className="font-mono">admin@etanicafe.com / Admin@123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
