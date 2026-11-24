import { router } from "expo-router";
import { useQuery } from "../../lib/useQuery";
import type { SchoolClass } from "../../lib/api";
import { classLabel } from "../../lib/format";
import { Body, Card, Empty, ErrorView, Loading, Screen, Small, Title } from "../../components/ui";

export default function Classes() {
  const { data, error, loading, refreshing, refresh } = useQuery<{ classes: SchoolClass[] }>("/classes");
  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorView message={error} onRetry={refresh} />;
  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      {data!.classes.length === 0 && <Empty>No classes yet. An admin can add them from the web portal.</Empty>}
      {data!.classes.map((c) => (
        <Card key={c.id} onPress={() => router.push(`/class/${c.id}`)}>
          <Title>{classLabel(c)}</Title>
          <Body muted style={{ marginTop: 2 }}>
            {c._count.students} {c._count.students === 1 ? "student" : "students"}
            {c.room ? ` · Room ${c.room}` : ""}
          </Body>
          <Small style={{ marginTop: 6 }}>Class teacher: {c.classTeacher?.name ?? "Not assigned"}</Small>
        </Card>
      ))}
    </Screen>
  );
}
