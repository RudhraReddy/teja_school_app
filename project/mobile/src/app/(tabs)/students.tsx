import { useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "../../lib/useQuery";
import type { SchoolClass, Student } from "../../lib/api";
import { classLabel } from "../../lib/format";
import { useTheme } from "../../lib/theme";
import { Badge, Chips, Empty, ErrorView, Small } from "../../components/ui";

export default function Students() {
  const t = useTheme();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [classId, setClassId] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(id);
  }, [q]);

  const params = new URLSearchParams({ pageSize: "100", ...(debounced ? { q: debounced } : {}), ...(classId ? { classId } : {}) });
  const { data, error, loading, refreshing, refresh } = useQuery<{ students: Student[]; total: number }>(`/students?${params}`);
  const classes = useQuery<{ classes: SchoolClass[] }>("/classes");

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ padding: 16, paddingBottom: 8, gap: 10 }}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search name, admission no., guardian…"
          placeholderTextColor={t.muted}
          autoCorrect={false}
          clearButtonMode="while-editing"
          style={{ backgroundColor: t.surface, borderColor: t.line, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: t.ink, fontSize: 15 }}
        />
        <Chips
          value={classId}
          onChange={setClassId}
          options={[{ value: "", label: "All classes" }, ...(classes.data?.classes ?? []).map((c) => ({ value: c.id, label: classLabel(c) }))]}
        />
        {data && <Small>{data.total} {data.total === 1 ? "student" : "students"}{data.total > data.students.length ? ` · showing first ${data.students.length}` : ""}</Small>}
      </View>
      {error && !data ? (
        <ErrorView message={error} onRetry={refresh} />
      ) : (
        <FlatList
          data={data?.students ?? []}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={t.brand} />}
          ListEmptyComponent={loading ? undefined : <Empty>No students found.</Empty>}
          renderItem={({ item: s }) => (
            <Pressable
              onPress={() => router.push(`/student/${s.id}`)}
              style={({ pressed }) => ({ backgroundColor: pressed ? t.subtle : t.surface, paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: t.line, flexDirection: "row", alignItems: "center", gap: 12 })}
            >
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: t.subtle, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: t.brand, fontWeight: "700" }}>{s.firstName[0]}{s.lastName[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.ink, fontSize: 15, fontWeight: "500" }}>{s.firstName} {s.lastName}</Text>
                <Small>{s.admissionNo} · {classLabel(s.class)}</Small>
              </View>
              {s.status === "INACTIVE" && <Badge label="Inactive" />}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
