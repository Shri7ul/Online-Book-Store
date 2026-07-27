import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import {
  AdminFormCard,
  AdminPageHeader
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createBannerAction,
  deleteBannerAction
} from "@/lib/actions/admin";
import { getAdminBanners } from "@/lib/repositories/admin";

export default async function AdminBannersPage() {
  const banners = await getAdminBanners();
  return (
    <>
      <AdminPageHeader
        eyebrow="Homepage"
        title="Hero banners"
        description="Active banners appear in sort order and rotate automatically."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[380px_1fr]">
        <AdminFormCard title="Add banner">
          <form action={createBannerAction} className="space-y-4">
            <Label text="Title">
              <Input name="title" required />
            </Label>
            <Label text="Subtitle">
              <Textarea name="subtitle" className="min-h-24" />
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Label text="Button text">
                <Input name="button_text" />
              </Label>
              <Label text="Button URL">
                <Input name="button_url" placeholder="/shop" />
              </Label>
            </div>
            <Label text="Sort order">
              <Input name="sort_order" type="number" min="0" defaultValue="0" />
            </Label>
            <Label text="Banner image">
              <Input
                name="image"
                type="file"
                accept="image/*"
                className="h-auto py-2"
                required
              />
            </Label>
            <Button type="submit" className="w-full">
              <Plus className="size-4" /> Add banner
            </Button>
          </form>
        </AdminFormCard>

        <div className="grid gap-4 md:grid-cols-2">
          {banners.map((banner) => (
            <article
              key={banner.id}
              className="overflow-hidden rounded-xl border bg-card"
            >
              <div className="relative aspect-[16/8.5] bg-muted">
                <Image
                  src={banner.image_url}
                  alt=""
                  fill
                  sizes="500px"
                  className="object-cover"
                />
                <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-black uppercase backdrop-blur">
                  {banner.is_active ? "Active" : "Disabled"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 p-4">
                <div>
                  <h2 className="font-display text-lg font-semibold">
                    {banner.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {banner.subtitle}
                  </p>
                </div>
                <form action={deleteBannerAction}>
                  <input type="hidden" name="id" value={banner.id} />
                  <Button type="submit" size="icon" variant="ghost">
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

function Label({
  text,
  children
}: {
  text: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold">{text}</span>
      {children}
    </label>
  );
}
