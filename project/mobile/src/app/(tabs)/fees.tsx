import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "../../lib/useQuery";
import type { Balance, SchoolClass } from "../../lib/api";
import { classLabel, inr } from "../../lib/format";
import { useTheme } from "../../lib/theme";
import { Badge, Body, Card, Chips, Empty, ErrorView, Loading, Screen, Small, Stat, Title } from "../../components/ui";

export default function Fees() {
  const t = useTheme();
  const [classId, setClassId] = useState("");
  const [onlyDues, setOnlyDues] = useState<"dues" | "all">("dues");
  const { data, error, loading, refreshing, refresh } = useQuery<{ balances: Balance[] }>(`/fees/balances${classId ? `?classId=${classId}` : ""}`);
  const classes = useQuery<{ classes: SchoolClass[] }>("/classes");

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorView message={error} onRetry={refresh} />;
  const all = data!.balances;
  const shown = onlyDues === "dues" ? all.filter((b) => b.balance > 0) : all;
  const outstanding = all.reduce((s, b) => s + b.balance, 0);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Stat label="Outstanding" value={inr(outstanding)} />
        <Stat label="Students with dues" value={String(all.filter((b) => b.balance > 0).length)} />
      </View>
      <Chips value={classId} onChange={setClassId} options={[{ value: "", label: "All classes" }, ...(classes.data?.classes ?? []).map((c) => ({ value: c.id, label: classLabel(c) }))]} />
      <Chips value={onlyDues} onChange={setOnlyDues} options={[{ value: "dues", label: "With dues" }, { value: "all", label: "Everyone" }]} />
      {shown.length === 0 && <Empty>{onlyDues === "dues" ? "No outstanding fees 🎉" : "No students."}</Empty>}
      {shown.map((b) => (
        <Card key={b.student.id} onPress={() => router.push(`/student/${b.student.id}`)} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Title>{b.student.firstName} {b.student.lastName}</Title>
            <Small>{b.student.admissionNo} · {classLabel(b.student.class)}</Small>
            <Small style={{ marginTop: 4 }}>Paid {inr(b.paid)} of {inr(b.due)}</Small>
          </View>
          {b.balance > 0 ? <Body style={{ color: t.danger, fontWeight: "700" }}>{inr(b.balance)}</Body> : <Badge label="Clear" tone="green" />}
        </Card>
      ))}
    </Screen>
  );
}
