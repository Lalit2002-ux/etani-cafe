import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useState } from "react";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setBusy(true);
    const res = await register(name, email, password);
    setBusy(false);
    if (res.ok) {
      toast.success("Welcome to Etani Cafe!");
      navigate("/");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex items-center justify-center p-8 bg-etani-bg order-2 md:order-1">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center mb-10" data-testid="brand-link">
            <Logo className="h-10 w-10" />
          </Link>
          <h2 className="font-display text-4xl font-semibold text-etani-ink">Join the table</h2>
          <p className="mt-2 text-etani-muted">Create your account to start ordering.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-etani-ink">Full name</Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white border-etani-line h-12 rounded-xl"
                data-testid="signup-name-input"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-etani-ink">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-etani-line h-12 rounded-xl"
                data-testid="signup-email-input"
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
                data-testid="signup-password-input"
                placeholder="At least 6 characters"
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full h-12 rounded-full bg-etani-terracotta hover:bg-etani-terracottaDark text-white font-medium"
              data-testid="signup-submit-button"
            >
              {busy ? "Creating…" : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-etani-muted">
            Already a regular?{" "}
            <Link to="/login" className="text-etani-terracotta hover:text-etani-terracottaDark font-medium" data-testid="goto-login-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden md:block relative overflow-hidden order-1 md:order-2">
        <img
          src="https://images.unsplash.com/photo-1684429739445-33c981ee8e92?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80"
          alt="Latte art"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-etani-ink/30" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <h1 className="font-display text-5xl lg:text-6xl font-semibold leading-tight">
            Brewed slow.<br/>Served warm.<br/>Made for you.
          </h1>
        </div>
      </div>
    </div>
  );
}
