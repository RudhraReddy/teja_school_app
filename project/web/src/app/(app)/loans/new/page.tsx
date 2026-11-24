import { requirePageUser } from "@/lib/auth";
import { createLoanAction } from "@/app/actions";
import { Card, PageHeader } from "@/components/ui";
import { LoanForm } from "../loan-form";

export const metadata = { title: "Add loan" };

export default async function NewLoanPage() {
  await requirePageUser("ADMIN");
  return (
    <>
      <PageHeader title="Add loan" subtitle="Record a loan the school has taken or given. Interest and late fees are calculated automatically." />
      <Card>
        <LoanForm action={createLoanAction} cancelHref="/loans" />
      </Card>
    </>
  );
}
