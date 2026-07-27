import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { BookForm } from "@/components/admin/book-form";
import {
  getAdminBook,
  getAdminCategories,
  getAdminWriters
} from "@/lib/repositories/admin";
import type { Book, Category, Writer } from "@/lib/types";

export default async function EditBookPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [book, categories, writers] = await Promise.all([
    getAdminBook(id),
    getAdminCategories(),
    getAdminWriters()
  ]);
  if (!book) notFound();
  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog"
        title={`Edit ${book.name}`}
        description="Update book data, merchandising, pricing, or add another preview file."
      />
      <BookForm
        book={book as Book}
        categories={categories as Category[]}
        writers={writers as Writer[]}
      />
    </>
  );
}
