import { redirect } from "next/navigation";
import { fetchCategory } from "@/src/services/categories/action";
import ContributeForm from "./contribute-form";

export default async function ContributeQuestionPage() {
  const { data: categories } = await fetchCategory();
  if (!categories?.length) {
    return (
      <div className="page-container">
        <p className="text-body">No categories available. Contact an admin.</p>
      </div>
    );
  }

  return <ContributeForm categories={categories} />;
}
