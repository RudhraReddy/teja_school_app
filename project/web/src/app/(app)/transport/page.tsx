import { requirePageUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";

export const metadata = { title: "Transport" };

export default async function TransportPage() {
  await requirePageUser();
  return (
    <>
      <PageHeader title="Transport" subtitle="Bus routes, stops and which students travel" />
      <Card>
        <p className="text-sm text-muted">
          Coming soon. This page will hold the bus routes and stops, and the students who use each one. Transport fees can be added to a student from their page.
        </p>
      </Card>
    </>
  );
}
