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
  createCategoryAction,
  deleteResourceAction
} from "@/lib/actions/admin";
import { getAdminCategories } from "@/lib/repositories/admin";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog structure"
        title="Categories"
        description="Removing a category leaves its books intact and uncategorized."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[360px_1fr]">
        <AdminFormCard title="Add category">
          <form action={createCategoryAction} className="space-y-4">
            <Field label="Category name">
              <Input name="name" required />
            </Field>
            <Field label="Slug">
              <Input name="slug" placeholder="Generated automatically" />
            </Field>
            <Field label="Description">
              <Textarea name="description" />
            </Field>
            <Field label="Category image">
              <Input
                name="image"
                type="file"
                accept="image/*"
                className="h-auto py-2"
              />
            </Field>
            <Button type="submit" className="w-full">
              <Plus className="size-4" /> Add category
            </Button>
          </form>
        </AdminFormCard>
        <AdminTable>
          <thead className="border-b bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-5 py-4 font-semibold">Category</th>
              <th className="px-5 py-4 font-semibold">Slug</th>
              <th className="px-5 py-4 font-semibold">Books</th>
              <th className="px-5 py-4 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 overflow-hidden rounded-lg bg-muted">
                      {category.image_url && (
                        <Image
                          src={category.image_url}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <span className="font-semibold">{category.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {category.slug}
                </td>
                <td className="px-5 py-3">
                  {category.book_count ?? category.books?.[0]?.count ?? 0}
                </td>
                <td className="px-5 py-3 text-right">
                  <form action={deleteResourceAction}>
                    <input type="hidden" name="id" value={category.id} />
                    <input type="hidden" name="resource" value="categories" />
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
