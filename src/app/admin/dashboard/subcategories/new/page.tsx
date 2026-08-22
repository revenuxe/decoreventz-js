"use client";

import { useSearchParams } from "next/navigation";
import { SubcategoryForm } from "../subcategory-form";

export default function NewSubcategoryPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category") ?? undefined;
  return <SubcategoryForm subcategory={null} defaultCategoryId={categoryId} />;
}
