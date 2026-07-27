import {
  AdminPageHeader,
  AdminTable
} from "@/components/admin/admin-ui";
import { getAdminUsers } from "@/lib/repositories/admin";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();
  return (
    <>
      <AdminPageHeader
        eyebrow="Audience"
        title="Users"
        description="Registered customer profiles and language preferences."
      />
      <AdminTable>
        <thead className="border-b bg-muted/60 text-xs text-muted-foreground">
          <tr>
            <th className="px-5 py-4 font-semibold">Name</th>
            <th className="px-5 py-4 font-semibold">Phone</th>
            <th className="px-5 py-4 font-semibold">Language</th>
            <th className="px-5 py-4 font-semibold">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-5 py-4 font-semibold">
                {user.full_name || "Unnamed user"}
              </td>
              <td className="px-5 py-4 text-muted-foreground">
                {user.phone || "—"}
              </td>
              <td className="px-5 py-4 uppercase">{user.preferred_language}</td>
              <td className="px-5 py-4 text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString("en-BD")}
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </>
  );
}
