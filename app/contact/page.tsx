import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendContactMessageAction } from "@/lib/actions/public";
import { getSettings } from "@/lib/repositories/catalog";

export const metadata: Metadata = { title: "Contact" };
export const dynamic = "force-dynamic";

export default async function ContactPage({
  searchParams
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const [settings, params] = await Promise.all([getSettings(), searchParams]);
  return (
    <div className="container grid gap-12 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:py-20">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-accent-foreground">
          Contact
        </p>
        <h1 className="font-display mt-3 text-5xl font-semibold sm:text-7xl">
          We’re here to help.
        </h1>
        <p className="mt-5 max-w-md text-base leading-8 text-muted-foreground">
          Questions about a title, an order, or delivery? Send a note and our
          team will respond as soon as possible.
        </p>
        <div className="mt-9 space-y-5 text-sm">
          <p className="flex items-center gap-4">
            <Mail className="size-5 text-accent" /> {settings.support_email}
          </p>
          <p className="flex items-center gap-4">
            <Phone className="size-5 text-accent" /> {settings.support_phone}
          </p>
          <p className="flex items-center gap-4">
            <MapPin className="size-5 text-accent" /> {settings.address}
          </p>
          <p className="flex items-center gap-4">
            <MessageCircle className="size-5 text-accent" /> WhatsApp support
          </p>
        </div>
      </div>
      <div className="rounded-2xl border bg-card p-6 shadow-soft sm:p-9">
        {params.sent && (
          <p className="mb-6 rounded-xl bg-primary/10 p-4 text-sm font-semibold text-primary">
            Your message has been received. We’ll be in touch shortly.
          </p>
        )}
        <form action={sendContactMessageAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <Input name="name" required />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" required />
            </Field>
            <Field label="Phone (optional)">
              <Input name="phone" type="tel" />
            </Field>
            <Field label="Subject">
              <Input name="subject" />
            </Field>
          </div>
          <Field label="Message">
            <Textarea name="message" className="min-h-44" required />
          </Field>
          <Button type="submit" size="lg">Send message</Button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold">{label}</span>
      {children}
    </label>
  );
}
