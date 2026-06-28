import { useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Contact({ defaultName, defaultEmail }) {
  const [name, setName] = useState(defaultName || "");
  const [email, setEmail] = useState(defaultEmail || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/contact", { name, email, subject, message });
      toast.success(data.message || "Message sent");
      setSubject(""); setMessage("");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-28" data-testid="contact-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2">
          <p className="text-sm uppercase tracking-[0.25em] text-etani-terracotta font-medium">Visit us</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-etani-ink">
            Come by,<br/><span className="italic">stay a while.</span>
          </h2>

          <div className="mt-8 space-y-5">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-etani-terracotta mt-1" />
              <div>
                <div className="font-medium text-etani-ink">42, Linden Lane</div>
                <div className="text-etani-muted text-sm">Bandra West, Mumbai 400050</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-etani-terracotta mt-1" />
              <div>
                <div className="font-medium text-etani-ink">Open daily</div>
                <div className="text-etani-muted text-sm">7:30 AM — 10:00 PM</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-etani-terracotta mt-1" />
              <div className="text-etani-ink">+91 98765 43210</div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-etani-terracotta mt-1" />
              <div className="text-etani-ink">hello@etanicafe.com</div>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="lg:col-span-3 bg-etani-paper rounded-2xl p-6 md:p-10 border border-etani-line">
          <h3 className="font-display text-2xl text-etani-ink mb-6">Drop us a line</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-name">Name</Label>
              <Input id="c-name" required value={name} onChange={(e) => setName(e.target.value)}
                className="bg-white border-etani-line h-11 rounded-xl"
                data-testid="contact-name-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-etani-line h-11 rounded-xl"
                data-testid="contact-email-input" />
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="c-subject">Subject</Label>
            <Input id="c-subject" required value={subject} onChange={(e) => setSubject(e.target.value)}
              className="bg-white border-etani-line h-11 rounded-xl"
              data-testid="contact-subject-input" />
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="c-message">Message</Label>
            <Textarea id="c-message" required value={message} onChange={(e) => setMessage(e.target.value)}
              className="bg-white border-etani-line rounded-xl min-h-[140px]"
              data-testid="contact-message-input" />
          </div>
          <Button type="submit" disabled={busy}
            className="mt-6 rounded-full bg-etani-terracotta hover:bg-etani-terracottaDark text-white h-11 px-7"
            data-testid="contact-submit-button">
            {busy ? "Sending…" : "Send Message"}
          </Button>
        </form>
      </div>
    </section>
  );
}
