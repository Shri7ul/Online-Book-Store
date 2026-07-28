import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/repositories/catalog";

export async function requireAdmin() {
  if (!isSupabaseConfigured) redirect("/admin/login");

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase
    .from("admins")
    .select("display_name,role")
    .eq("id", user.id)
    .maybeSingle();
  if (!admin) redirect("/admin/login?error=not-authorized");

  return {
    id: user.id,
    email: user.email ?? "",
    displayName: admin.display_name ?? user.email ?? "Administrator",
    role: admin.role
  };
}
