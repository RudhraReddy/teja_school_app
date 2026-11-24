import { Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useQuery } from "../../lib/useQuery";
import type { ClassDetail } from "../../lib/api";
import { classLabel } from "../../lib/format";
import { useTheme } from "../../lib/theme";
import { Badge, Card, Empty, ErrorView, Loading, Row, Screen, SectionTitle, Small } from "../../components/ui";

export default function ClassScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error, loading, refreshing, refresh } = useQuery<{ class: ClassDetail }>(`/classes/${id}`);
  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorView message={error} onRetry={refresh} />;
  const c = data!.class;
  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Stack.Screen options={{ title: classLabel(c) }} />
      <Card>
        <Row label="Class teacher" value={c.classTeacher?.name ?? "Not assigned"} />
        <Row label="Room" value={c.room ?? "—"} />
        <Row label="Students" value={String(c.students.length)} />
      </Card>
      <SectionTitle>Students</SectionTitle>
      {c.students.length === 0 && <Empty>No students in this class.</Empty>}
      <View style={{ borderRadius: 14, overflow: "hidden" }}>
        {c.students.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => router.push(`/student/${s.id}`)}
            style={({ pressed }) => ({ backgroundColor: pressed ? t.subtle : t.surface, padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: t.line, flexDirection: "row", alignItems: "center" })}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.ink, fontSize: 15 }}>{s.firstName} {s.lastName}</Text>
              <Small>{s.admissionNo}{s.guardianPhone ? ` · ${s.guardianPhone}` : ""}</Small>
            </View>
            {s.status === "INACTIVE" && <Badge label="Inactive" />}
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
