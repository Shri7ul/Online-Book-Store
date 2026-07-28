import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/store/logo";

export default function AdminLoginPage() {
  return (
    <main className="paper-grid grid min-h-screen place-items-center bg-muted px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-background p-7 shadow-lift sm:p-9">
        <Logo />
        <p className="mt-9 text-xs font-black uppercase tracking-[0.16em] text-accent-foreground">
          Store management
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold">
          Welcome back.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Sign in to manage the catalog, orders, offers, and storefront.
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}