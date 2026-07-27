import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import {
  AdminFormCard,
  AdminPageHeader,
  AdminTable
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createWriterAction,
  deleteResourceAction
} from "@/lib/actions/admin";
import { getAdminWriters } from "@/lib/repositories/admin";

export default async function AdminWritersPage() {
  const writers = await getAdminWriters();
  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog structure"
        title="Writers"
        description="Removing a writer leaves their books intact and unassigned."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[360px_1fr]">
        <AdminFormCard title="Add writer">
          <form action={createWriterAction} className="space-y-4">
            <Label text="Writer name">
              <Input name="name" required />
            </Label>
            <Label text="Slug">
              <Input name="slug" placeholder="Generated automatically" />
            </Label>
            <Label text="Biography">
              <Textarea name="biography" className="min-h-32" />
            </Label>
            <Label text="Portrait">
              <Input
                name="photo"
                type="file"
                accept="image/*"
                className="h-auto py-2"
              />
            </Label>
            <Button type="submit" className="w-full">
              <Plus className="size-4" /> Add writer
            </Button>
          </form>
        </AdminFormCard>
        <AdminTable>
          <thead className="border-b bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-5 py-4 font-semibold">Writer</th>
              <th className="px-5 py-4 font-semibold">Slug</th>
              <th className="px-5 py-4 font-semibold">Books</th>
              <th className="px-5 py-4 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {writers.map((writer) => (
              <tr key={writer.id}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 overflow-hidden rounded-full bg-muted">
                      {writer.photo_url && (
                        <Image
                          src={writer.photo_url}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <span className="font-semibold">{writer.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {writer.slug}
                </td>
                <td className="px-5 py-3">
                  {writer.book_count ?? writer.books?.[0]?.count ?? 0}
                </td>
                <td className="px-5 py-3 text-right">
                  <form action={deleteResourceAction}>
                    <input type="hidden" name="id" value={writer.id} />
                    <input type="hidden" name="resource" value="writers" />
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
