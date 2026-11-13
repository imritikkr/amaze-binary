// src/app/admin/products/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import { getAdminProductForEdit } from "@/actions/admin/admin-products";
import { EditProductForm } from "@/components/admin/EditProductForm";

export const metadata = {
  title: "Edit Product | Amaze Ayurveda Admin",
};

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const res = await getAdminProductForEdit(id);

  if (res.unauthorized) {
    redirect("/login");
  }

  if (res.notFound || !res.product) {
    notFound();
  }

  return (
    <EditProductForm
      product={res.product}
      categories={res.categories}
      availableBogoProducts={res.availableBogoProducts}
    />
  );
}
