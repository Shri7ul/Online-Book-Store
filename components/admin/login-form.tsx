"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, LockKeyhole, Mail, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [setup, setSetup] = useState(false);
  const [loading, setLoading] = useState(false);
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) {
      router.push("/admin");
      return;
    }
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const fullName = String(form.get("full_name") ?? "");
    const supabase = createClient();

    try {
      if (setup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session && setup) {
        toast.success("Check your email to confirm the administrator account.");
        return;
      }

      const { data: claimed, error: claimError } = await supabase.rpc(
        "claim_initial_admin"
      );
      if (claimError) throw claimError;
      if (!claimed) throw new Error("This account is not an administrator.");

      router.push(searchParams.get("next") ?? "/admin");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Authentication failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      {setup && (
        <label className="block text-xs font-bold">
          <span className="mb-2 block">Display name</span>
          <Input name="full_name" autoComplete="name" required />
        </label>
      )}
      <label className="block text-xs font-bold">
        <span className="mb-2 block">Email address</span>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="email"
            type="email"
            autoComplete="email"
            className="pl-11"
            defaultValue={configured ? "" : "preview@minibookcottage.com"}
            required
          />
        </div>
      </label>
      <label className="block text-xs font-bold">
        <span className="mb-2 block">Password</span>
        <div className="relative">
          <LockKeyhole className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="password"
            type="password"
            autoComplete={setup ? "new-password" : "current-password"}
            className="pl-11"
            defaultValue={configured ? "" : "preview-only"}
            minLength={8}
            required
          />
        </div>
      </label>
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <LoaderCircle className="size-5 animate-spin" />
        ) : setup ? (
          <UserRoundPlus className="size-4" />
        ) : (
          <LockKeyhole className="size-4" />
        )}
        {loading
          ? "Please wait..."
          : configured
            ? setup
              ? "Create first administrator"
              : "Sign in to dashboard"
            : "Open dashboard preview"}
      </Button>
      {configured && (
        <button
          type="button"
          onClick={() => setSetup((value) => !value)}
          className="w-full py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          {setup
            ? "Already have an administrator account? Sign in"
            : "First-time store setup? Create the owner account"}
        </button>
      )}
    </form>
  );
}
