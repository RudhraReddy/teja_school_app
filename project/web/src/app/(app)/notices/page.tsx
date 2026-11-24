import { requirePageUser } from "@/lib/auth";
import { listNotices } from "@/lib/services/notices";
import { createNoticeAction, deleteNoticeAction } from "@/app/actions";
import { Badge, Card, Empty, PageHeader } from "@/components/ui";
import { ConfirmButton } from "@/components/forms";
import { date } from "@/lib/format";
import { NoticeForm } from "./notice-form";

export const metadata = { title: "Notices" };

export default async function NoticesPage() {
  const user = await requirePageUser();
  const notices = await listNotices();
  return (
    <>
      <PageHeader title="Notices" subtitle="Announcements for staff and the school" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {notices.length === 0 && <Empty>No notices posted yet.</Empty>}
          {notices.map((n) => (
            <Card key={n.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {n.pinned && <Badge tone="amber">Pinned</Badge>}
                    {n.audience === "TEACHERS" && <Badge tone="blue">Staff only</Badge>}
                    <h2 className="font-semibold">{n.title}</h2>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {n.author?.name ?? "School office"} · {date(n.createdAt)}
                  </p>
                </div>
                {(user.role === "ADMIN" || n.author?.id === user.id) && (
                  <ConfirmButton action={deleteNoticeAction.bind(null, n.id)} confirm="Delete this notice?" variant="secondary">
                    Delete
                  </ConfirmButton>
                )}
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{n.body}</p>
            </Card>
          ))}
        </div>
        <Card title="Post a notice" className="self-start">
          <NoticeForm action={createNoticeAction} />
        </Card>
      </div>
    </>
  );
}
