import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/repositories/catalog";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured) {
    return new NextResponse("Preview PDF requires Supabase Storage.", {
      status: 404
    });
  }
  const { id } = await params;
  const supabase = await createClient();
  const { data: preview, error } = await supabase
    .from("book_previews")
    .select("storage_path,type")
    .eq("id", id)
    .eq("type", "pdf")
    .single();
  if (error || !preview) return new NextResponse("Not found", { status: 404 });

  const { data, error: signedError } = await supabase.storage
    .from("book-preview")
    .createSignedUrl(preview.storage_path, 300, { download: false });
  if (signedError) return new NextResponse("Not found", { status: 404 });
  return NextResponse.redirect(data.signedUrl, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": "inline"
    }
  });
}
