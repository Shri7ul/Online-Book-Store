import { ShieldCheck } from "lucide-react";
import { AdminFormCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { requireAdmin } from "@/lib/auth/admin";

export default async function ProfilePage() {
  const admin = await requireAdmin();
  return (
    <>
      <AdminPageHeader
        eyebrow="Account"
        title="Profile"
        description="Administrator identity and access level."
      />
      <div className="max-w-xl">
        <AdminFormCard title={admin.displayName}>
          <div className="space-y-5">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="mt-1 font-semibold">{admin.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="mt-1 flex items-center gap-2 font-semibold capitalize">
                <ShieldCheck className="size-4 text-primary" />
                {admin.role}
              </p>
            </div>
            <p className="border-t pt-5 text-xs leading-6 text-muted-foreground">
              Password, MFA, and session controls are managed by Supabase
              Authentication.
            </p>
          </div>
        </AdminFormCard>
      </div>
    </>
  );
}
