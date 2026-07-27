import { Plus, Trash2 } from "lucide-react";
import {
  AdminFormCard,
  AdminPageHeader,
  AdminTable
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createCouponAction,
  deleteResourceAction
} from "@/lib/actions/admin";
import { getAdminCoupons } from "@/lib/repositories/admin";
import { formatPrice } from "@/lib/utils";

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();
  return (
    <>
      <AdminPageHeader
        eyebrow="Promotions"
        title="Coupons"
        description="Control discount rules, minimum spend, expiry, and usage limits."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[380px_1fr]">
        <AdminFormCard title="Create coupon">
          <form action={createCouponAction} className="space-y-4">
            <Field label="Coupon code">
              <Input name="code" className="uppercase" required />
            </Field>
            <Field label="Discount type">
              <select
                name="discount_type"
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm"
              >
                <option value="fixed">Fixed amount</option>
                <option value="percentage">Percentage</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Discount value">
                <Input name="discount_value" type="number" min="1" required />
              </Field>
              <Field label="Minimum order">
                <Input
                  name="minimum_purchase"
                  type="number"
                  min="0"
                  defaultValue="0"
                  required
                />
              </Field>
            </div>
            <Field label="Expiry">
              <Input name="expires_at" type="datetime-local" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Maximum uses">
                <Input name="max_usage" type="number" min="1" />
              </Field>
              <Field label="Per user">
                <Input name="max_usage_per_user" type="number" min="1" />
              </Field>
            </div>
            <Button type="submit" className="w-full">
              <Plus className="size-4" /> Create coupon
            </Button>
          </form>
        </AdminFormCard>
        <AdminTable>
          <thead className="border-b bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-5 py-4 font-semibold">Code</th>
              <th className="px-5 py-4 font-semibold">Discount</th>
              <th className="px-5 py-4 font-semibold">Minimum</th>
              <th className="px-5 py-4 font-semibold">Usage</th>
              <th className="px-5 py-4 font-semibold">Expiry</th>
              <th className="px-5 py-4 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td className="px-5 py-4 font-black">{coupon.code}</td>
                <td className="px-5 py-4">
                  {coupon.discount_type === "percentage"
                    ? `${coupon.discount_value}%`
                    : formatPrice(coupon.discount_value)}
                </td>
                <td className="px-5 py-4">
                  {formatPrice(coupon.minimum_purchase)}
                </td>
                <td className="px-5 py-4">
                  {coupon.usage_count}/{coupon.max_usage ?? "∞"}
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {coupon.expires_at
                    ? new Date(coupon.expires_at).toLocaleDateString("en-BD")
                    : "No expiry"}
                </td>
                <td className="px-5 py-4 text-right">
                  <form action={deleteResourceAction}>
                    <input type="hidden" name="id" value={coupon.id} />
                    <input type="hidden" name="resource" value="coupons" />
                    <Button size="icon" variant="ghost" type="submit">
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </div>
    </>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold">{label}</span>
      {children}
    </label>
  );
}
