import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms and conditions" };

export default function TermsPage() {
  const sections = [
    ["Orders", "An order is accepted after our team confirms availability, delivery details, and any required delivery-charge payment. We may cancel or adjust an order when stock or pricing information is materially incorrect."],
    ["Pricing and coupons", "Prices are shown in Bangladeshi Taka. Coupons apply only when their minimum purchase, expiry, status, and usage conditions are met."],
    ["Delivery", "Delivery estimates depend on destination and courier operations. Customers are responsible for providing a complete and reachable address and phone number."],
    ["Returns", "Return eligibility depends on the condition of the delivered item and the reason for return. Report damaged, incorrect, or materially defective books promptly with supporting photos."],
    ["Book previews", "Samples are provided only to evaluate a book before purchase. Preview content may not be downloaded, redistributed, or reproduced."],
    ["Contact", "Questions about these terms can be sent through our contact page."]
  ];
  return (
    <div className="container max-w-4xl py-14 sm:py-20">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-accent-foreground">
        Mini Book Cottage
      </p>
      <h1 className="font-display mt-3 text-5xl font-semibold sm:text-7xl">
        Terms and conditions
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Last updated July 27, 2026
      </p>
      <div className="mt-12 space-y-10">
        {sections.map(([heading, copy]) => (
          <section key={heading}>
            <h2 className="font-display text-2xl font-semibold">{heading}</h2>
            <p className="mt-3 text-sm leading-8 text-muted-foreground">{copy}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
