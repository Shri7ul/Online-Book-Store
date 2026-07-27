import { Save } from "lucide-react";
import {
  AdminFormCard,
  AdminPageHeader
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateSettingsAction } from "@/lib/actions/admin";
import { getAdminSettings } from "@/lib/repositories/admin";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();
  return (
    <>
      <AdminPageHeader
        eyebrow="Store configuration"
        title="Settings"
        description="These values update the storefront, checkout, support, SEO, and tracking without code changes."
      />
      <form action={updateSettingsAction} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <AdminFormCard title="Store identity">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Store name">
                <Input name="store_name" defaultValue={settings.store_name} required />
              </Field>
              <Field label="Store phone">
                <Input name="phone" defaultValue={settings.phone} required />
              </Field>
              <Field label="Support email">
                <Input
                  name="support_email"
                  type="email"
                  defaultValue={settings.support_email}
                  required
                />
              </Field>
              <Field label="Support phone">
                <Input
                  name="support_phone"
                  defaultValue={settings.support_phone}
                  required
                />
              </Field>
              <Field label="Address" wide>
                <Textarea name="address" defaultValue={settings.address} />
              </Field>
            </div>
          </AdminFormCard>
          <AdminFormCard title="Social channels">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["whatsapp", "WhatsApp", settings.whatsapp],
                ["facebook_url", "Facebook URL", settings.facebook_url],
                ["messenger_url", "Messenger URL", settings.messenger_url],
                ["instagram_url", "Instagram URL", settings.instagram_url]
              ].map(([name, label, value]) => (
                <Field key={name} label={label}>
                  <Input name={name} defaultValue={value ?? ""} />
                </Field>
              ))}
            </div>
          </AdminFormCard>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <AdminFormCard title="Delivery & payment">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Inside Dhaka charge">
                <Input
                  name="delivery_inside_dhaka"
                  type="number"
                  min="0"
                  defaultValue={settings.delivery_inside_dhaka}
                  required
                />
              </Field>
              <Field label="Outside Dhaka charge">
                <Input
                  name="delivery_outside_dhaka"
                  type="number"
                  min="0"
                  defaultValue={settings.delivery_outside_dhaka}
                  required
                />
              </Field>
              <Field label="Payment number" wide>
                <Input
                  name="payment_number"
                  defaultValue={settings.payment_number}
                  required
                />
              </Field>
              <Field label="Payment instruction" wide>
                <Textarea
                  name="payment_instruction"
                  defaultValue={settings.payment_instruction}
                />
              </Field>
              <Field label="Order confirmation message" wide>
                <Textarea
                  name="confirmation_message"
                  defaultValue={settings.confirmation_message}
                  className="min-h-32"
                />
              </Field>
            </div>
          </AdminFormCard>
          <AdminFormCard title="Homepage & footer">
            <div className="space-y-4">
              <Field label="Homepage title">
                <Input name="homepage_title" defaultValue={settings.homepage_title} />
              </Field>
              <Field label="Homepage subtitle">
                <Textarea
                  name="homepage_subtitle"
                  defaultValue={settings.homepage_subtitle}
                />
              </Field>
              <Field label="Footer text">
                <Textarea name="footer_text" defaultValue={settings.footer_text} />
              </Field>
              <Field label="Copyright">
                <Input name="copyright" defaultValue={settings.copyright} />
              </Field>
            </div>
          </AdminFormCard>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <AdminFormCard title="SEO">
            <div className="space-y-4">
              <Field label="SEO title">
                <Input name="seo_title" defaultValue={settings.seo_title} />
              </Field>
              <Field label="SEO description">
                <Textarea
                  name="seo_description"
                  defaultValue={settings.seo_description}
                />
              </Field>
            </div>
          </AdminFormCard>
          <AdminFormCard title="Tracking">
            <div className="space-y-4">
              <Field label="Google Analytics ID">
                <Input
                  name="google_analytics_id"
                  defaultValue={settings.google_analytics_id ?? ""}
                />
              </Field>
              <Field label="Meta Pixel ID">
                <Input
                  name="meta_pixel_id"
                  defaultValue={settings.meta_pixel_id ?? ""}
                />
              </Field>
            </div>
          </AdminFormCard>
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="lg">
            <Save className="size-4" /> Save all settings
          </Button>
        </div>
      </form>
    </>
  );
}

function Field({
  label,
  children,
  wide
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "block sm:col-span-2" : "block"}>
      <span className="mb-2 block text-xs font-bold">{label}</span>
      {children}
    </label>
  );
}
