import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return <PolicyPage title="Privacy policy" sections={[
    ["Information we collect", "We collect the information needed to process orders, provide support, improve the store, and prevent misuse. This may include your name, contact details, delivery address, order history, and basic usage events."],
    ["How we use it", "Your information is used to fulfil orders, communicate order updates, respond to requests, improve the shopping experience, and meet legal or accounting obligations."],
    ["Payments and storage", "Payment providers process payment credentials under their own policies. Store data and uploaded assets are protected through Supabase access controls and secure transport."],
    ["Your choices", "You may ask us to correct or remove eligible personal information, or unsubscribe from marketing communication at any time."],
    ["Contact", "Questions about privacy can be sent through the contact page or support email listed in the footer."]
  ]} />;
}

function PolicyPage({ title, sections }: { title: string; sections: string[][] }) {
  return (
    <div className="container max-w-4xl py-14 sm:py-20">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-accent-foreground">
        Mini Book Cottage
      </p>
      <h1 className="font-display mt-3 text-5xl font-semibold sm:text-7xl">{title}</h1>
      <p className="mt-4 text-sm text-muted-foreground">Last updated July 27, 2026</p>
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
