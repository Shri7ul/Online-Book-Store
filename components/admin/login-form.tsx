"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) {
      toast.error("Admin authentication is not configured.");
      return;
    }
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;

      const { data: admin, error: adminError } = await supabase
        .from("admins")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();
      if (adminError || !admin) {
        await supabase.auth.signOut();
        throw new Error("This account is not an administrator.");
      }

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
      <label className="block text-xs font-bold">
        <span className="mb-2 block">Email</span>
        <Input name="email" type="email" autoComplete="email" required />
      </label>
      <label className="block text-xs font-bold">
        <span className="mb-2 block">Password</span>
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
