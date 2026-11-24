import { Alert, Platform, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../lib/auth";
import { useQuery } from "../../lib/useQuery";
import type { Dashboard } from "../../lib/api";
import { date, inr } from "../../lib/format";
import { useTheme } from "../../lib/theme";
import { Badge, Body, Card, ErrorView, Loading, Screen, SectionTitle, Small, Stat, Title } from "../../components/ui";

export default function Home() {
  const t = useTheme();
  const { user, signOut, serverUrl } = useAuth();
  const { data, error, loading, refreshing, refresh } = useQuery<Dashboard>("/dashboard");

  const confirmSignOut = () => {
    if (Platform.OS === "web") return void signOut();
    Alert.alert("Sign out?", undefined, [{ text: "Cancel", style: "cancel" }, { text: "Sign out", style: "destructive", onPress: () => void signOut() }]);
  };

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorView message={error} onRetry={refresh} />;
  const d = data!;

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: "700", color: t.ink }}>Hello, {user?.name.split(" ")[0]}</Text>
          <Small>{user?.role === "ADMIN" ? "Administrator" : "Teacher"}</Small>
        </View>
        <Pressable onPress={confirmSignOut} hitSlop={10}>
          <Text style={{ color: t.brand, fontWeight: "500" }}>Sign out</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <Stat label="Active students" value={d.students.toLocaleString("en-IN")} />
        <Stat label="Classes" value={String(d.classes)} />
        <Stat label="Collected this month" value={inr(d.collectedThisMonth)} />
        <Stat label="Outstanding" value={inr(d.outstanding)} sub={`${d.studentsWithDues} students`} />
      </View>

      <SectionTitle>Latest notices</SectionTitle>
      {d.recentNotices.map((n) => (
        <Card key={n.id} onPress={() => router.navigate("/notices")}>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {n.pinned && <Badge label="Pinned" tone="amber" />}
            <Title>{n.title}</Title>
          </View>
          <Body muted numberOfLines={2} style={{ marginTop: 4 }}>
            {n.body}
          </Body>
          <Small style={{ marginTop: 6 }}>
            {n.author?.name ?? "School office"} · {date(n.createdAt)}
          </Small>
        </Card>
      ))}
      <Small style={{ textAlign: "center", marginTop: 16 }}>Connected to {serverUrl}</Small>
    </Screen>
  );
}
