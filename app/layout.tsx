import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { StoreChrome } from "@/components/store/store-chrome";
import { getSettings } from "@/lib/repositories/catalog";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://minibookcottage.com"),
  title: {
    default: "Mini Book Cottage — Books worth keeping",
    template: "%s | Mini Book Cottage"
  },
  description:
    "A thoughtful online bookstore for readers across Bangladesh.",
  openGraph: {
    title: "Mini Book Cottage",
    description: "Books worth keeping, delivered across Bangladesh.",
    type: "website",
    locale: "en_BD"
  }
};

export default async function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <StoreChrome settings={settings}>{children}</StoreChrome>
        </Providers>
      </body>
    </html>
  );
}
