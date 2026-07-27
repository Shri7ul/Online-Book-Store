import Link from "next/link";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone
} from "lucide-react";
import { Logo } from "@/components/store/logo";
import type { StoreSettings } from "@/lib/types";

const groups = [
  {
    title: "Discover",
    links: [
      ["New arrivals", "/shop?new=true"],
      ["Best sellers", "/shop?best=true"],
      ["Current offers", "/shop?discount=true"],
      ["All writers", "/writers"]
    ]
  },
  {
    title: "Help",
    links: [
      ["Contact us", "/contact"],
      ["Delivery & payment", "/checkout"],
      ["Privacy policy", "/privacy"],
      ["Terms & conditions", "/terms"]
    ]
  },
  {
    title: "Company",
    links: [
      ["Our story", "/about"],
      ["Admin", "/admin"],
      ["Facebook", "https://facebook.com"],
      ["Instagram", "https://instagram.com"]
    ]
  }
];

export function StoreFooter({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="mt-24 border-t bg-card">
      <div className="container grid gap-12 py-16 lg:grid-cols-[1.25fr_2fr]">
        <div>
          <Logo imageUrl={settings.logo_url} />
          <p className="mt-6 max-w-sm text-sm leading-7 text-muted-foreground">
            {settings.footer_text}
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <p className="flex items-center gap-3">
              <MapPin className="size-4 text-accent" /> {settings.address}
            </p>
            <p className="flex items-center gap-3">
              <Phone className="size-4 text-accent" /> {settings.support_phone}
            </p>
            <p className="flex items-center gap-3">
              <Mail className="size-4 text-accent" /> {settings.support_email}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-black uppercase tracking-[0.15em]">
                {group.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {group.links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground transition hover:text-foreground"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t">
        <div className="container flex flex-col gap-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{settings.copyright}</p>
          <div className="flex items-center gap-2">
            <Link
              href={settings.facebook_url ?? "#"}
              className="grid size-9 place-items-center rounded-full border hover:text-foreground"
              aria-label="Facebook"
            >
              <Facebook className="size-4" />
            </Link>
            <Link
              href={settings.instagram_url ?? "#"}
              className="grid size-9 place-items-center rounded-full border hover:text-foreground"
              aria-label="Instagram"
            >
              <Instagram className="size-4" />
            </Link>
            <Link
              href={
                settings.whatsapp
                  ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`
                  : "#"
              }
              className="grid size-9 place-items-center rounded-full border hover:text-foreground"
              aria-label="WhatsApp"
            >
              <MessageCircle className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
