import { getAdminCategories } from "@/actions/admin/ecommerce/categories";
import CategoriesClient from "@/components/admin/categories-client";

export default async function AdminCategoriesPage() {
  const result = await getAdminCategories();

  return (
    <CategoriesClient
      initialCategories={result.success ? result.categories : []}
      initialError={result.success ? null : result.message}
    />
  );
}
