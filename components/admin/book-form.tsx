import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createBookAction, updateBookAction } from "@/lib/actions/admin";
import type { Book, Category, Writer } from "@/lib/types";

export function BookForm({
  categories,
  writers,
  book
}: {
  categories: Category[];
  writers: Writer[];
  book?: Book;
}) {
  return (
    <form
      action={book ? updateBookAction : createBookAction}
      className="grid gap-6 xl:grid-cols-[1fr_340px]"
    >
      {book && <input type="hidden" name="id" value={book.id} />}
      <div className="space-y-6">
        <FormSection title="Book information">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Book name" wide>
              <Input name="name" defaultValue={book?.name} required />
            </Field>
            <Field label="Writer">
              <Select name="writer_id" defaultValue={book?.writer_id ?? ""}>
                <option value="">Select writer</option>
                {writers.map((writer) => (
                  <option key={writer.id} value={writer.id}>
                    {writer.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Category">
              <Select name="category_id" defaultValue={book?.category_id ?? ""}>
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Publisher">
              <Input name="publisher" defaultValue={book?.publisher ?? ""} />
            </Field>
            <Field label="ISBN">
              <Input name="isbn" defaultValue={book?.isbn ?? ""} />
            </Field>
            <Field label="Language">
              <Input
                name="language"
                defaultValue={book?.language ?? "English"}
                required
              />
            </Field>
            <Field label="Pages">
              <Input
                name="pages"
                type="number"
                min="1"
                defaultValue={book?.pages ?? ""}
              />
            </Field>
            <Field label="Edition">
              <Input
                name="edition"
                defaultValue={book?.edition ?? ""}
                placeholder="First Edition"
              />
            </Field>
            <Field label="Stock">
              <Input
                name="stock"
                type="number"
                min="0"
                defaultValue={book?.stock ?? 0}
                required
              />
            </Field>
            <Field label="Description" wide>
              <Textarea
                name="description"
                className="min-h-40"
                defaultValue={book?.description}
                required
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Pricing">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Regular price (BDT)">
              <Input
                name="regular_price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={book?.regular_price}
                required
              />
            </Field>
            <Field label="Discount price (optional)">
              <Input
                name="discount_price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={book?.discount_price ?? ""}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="SEO">
          <div className="grid gap-4">
            <Field label="URL slug">
              <Input
                name="slug"
                defaultValue={book?.slug}
                placeholder="Generated from the book name"
              />
            </Field>
            <Field label="SEO title">
              <Input name="seo_title" defaultValue={book?.seo_title ?? ""} />
            </Field>
            <Field label="SEO description">
              <Textarea
                name="seo_description"
                className="min-h-24"
                defaultValue={book?.seo_description ?? ""}
              />
            </Field>
          </div>
        </FormSection>
      </div>

      <div className="space-y-6">
        <FormSection title="Media">
          <div className="space-y-5">
            <Field label="Book cover">
              <Input
                name="cover"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="h-auto py-2"
              />
            </Field>
            <Field label="Preview PDF or image">
              <Input
                name="preview"
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                className="h-auto py-2"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Merchandising">
          <div className="space-y-3">
            {[
              ["featured", "Featured"],
              ["trending", "Trending"],
              ["new_arrival", "New arrival"],
              ["best_seller", "Best seller"],
              ["is_active", "Visible in store"]
            ].map(([name, label]) => (
              <label
                key={name}
                className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-semibold"
              >
                {label}
                <input
                  name={name}
                  type="checkbox"
                  defaultChecked={
                    book
                      ? Boolean(book[name as keyof Book])
                      : name === "is_active"
                  }
                  className="size-4 accent-[hsl(var(--primary))]"
                />
              </label>
            ))}
          </div>
        </FormSection>

        <Button type="submit" size="lg" className="w-full">
          <Save className="size-4" /> {book ? "Update book" : "Save book"}
        </Button>
      </div>
    </form>
  );
}

function FormSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-5 sm:p-6">
      <h2 className="font-display mb-5 text-xl font-semibold">{title}</h2>
      {children}
    </section>
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

function Select({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none focus:border-primary"
      {...props}
    >
      {children}
    </select>
  );
}
