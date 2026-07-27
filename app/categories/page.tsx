import { CategoryGrid } from "@/components/store/home-sections";
import { getCategories } from "@/lib/repositories/catalog";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="pt-4">
      <CategoryGrid categories={categories} />
    </div>
  );
}
