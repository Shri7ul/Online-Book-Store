"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/repositories/catalog";
import { createAdminClient } from "@/lib/supabase/admin";

export async function subscribeNewsletterAction(formData: FormData) {
  const email = z.string().email().max(180).parse(formData.get("email"));
  if (isSupabaseConfigured) {
    const { error } = await createAdminClient()
      .from("newsletter_subscribers")
      .upsert({ email, is_active: true, unsubscribed_at: null }, { onConflict: "email" });
    if (error) throw error;
  }
  redirect("/?subscribed=true#newsletter");
}

export async function sendContactMessageAction(formData: FormData) {
  const payload = z
    .object({
      name: z.string().trim().min(2).max(120),
      email: z.string().email().max(180),
      phone: z.string().trim().max(30).optional(),
      subject: z.string().trim().max(160).optional(),
      message: z.string().trim().min(10).max(3000)
    })
    .parse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || undefined,
      subject: formData.get("subject") || undefined,
      message: formData.get("message")
    });
  if (isSupabaseConfigured) {
    const { error } = await createAdminClient()
      .from("contact_messages")
      .insert(payload);
    if (error) throw error;
  }
  redirect("/contact?sent=true");
}
