import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  AdminPageHeader,
  AdminTable
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { deleteBookAction } from "@/lib/actions/admin";
import { getAdminBooks } from "@/lib/repositories/admin";
import { formatPrice } from "@/lib/utils";

export default async function AdminBooksPage() {
  const books = await getAdminBooks();
  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Books"
        description={`${books.length} titles shown. Use search and pagination as the catalog grows.`}
        action={
          <Button asChild>
            <Link href="/admin/books/new">
              <Plus className="size-4" /> Add book
            </Link>
          </Button>
        }
      />
      <AdminTable>
        <thead className="border-b bg-muted/60 text-xs text-muted-foreground">
          <tr>
            <th className="px-5 py-4 font-semibold">Book</th>
            <th className="px-5 py-4 font-semibold">Category</th>
            <th className="px-5 py-4 font-semibold">Price</th>
            <th className="px-5 py-4 font-semibold">Stock</th>
            <th className="px-5 py-4 font-semibold">Visibility</th>
            <th className="px-5 py-4 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {books.map((book) => (
            <tr key={book.id} className="hover:bg-muted/35">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-10 overflow-hidden rounded bg-muted">
                    {book.cover_url && (
                      <Image
                        src={book.cover_url}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="max-w-xs">
                    <p className="truncate font-semibold">{book.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {book.writer?.name}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 text-muted-foreground">
                {book.category?.name ?? "Uncategorized"}
              </td>
              <td className="px-5 py-3 font-semibold">
                {formatPrice(book.discount_price ?? book.regular_price)}
              </td>
              <td className="px-5 py-3">{book.stock}</td>
              <td className="px-5 py-3">
                <span className={book.is_active ? "text-primary" : "text-muted-foreground"}>
                  {book.is_active ? "Live" : "Hidden"}
                </span>
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-1">
                  <Button asChild size="icon" variant="ghost">
                    <Link href={`/admin/books/${book.id}/edit`} aria-label="Edit book">
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <form action={deleteBookAction}>
                    <input type="hidden" name="id" value={book.id} />
                    <Button
                      type="submit"
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Delete book"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </>
  );
}
