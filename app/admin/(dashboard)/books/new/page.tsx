import { AdminPageHeader } from "@/components/admin/admin-ui";
import { BookForm } from "@/components/admin/book-form";
import {
  getAdminCategories,
  getAdminWriters
} from "@/lib/repositories/admin";

export default async function NewBookPage() {
  const [categories, writers] = await Promise.all([
    getAdminCategories(),
    getAdminWriters()
  ]);
  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Add a new book"
        description="Create the product record, pricing, media, preview, and storefront placement."
      />
      <BookForm categories={categories} writers={writers} />
    </>
  );
}
