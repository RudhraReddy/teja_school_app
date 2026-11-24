import { Alert, Platform, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../lib/auth";
import { useQuery } from "../../lib/useQuery";
import { request, type Notice } from "../../lib/api";
import { date } from "../../lib/format";
import { useTheme } from "../../lib/theme";
import { Badge, Body, Button, Card, Empty, ErrorView, Loading, Screen, Small, Title } from "../../components/ui";

export default function Notices() {
  const t = useTheme();
  const { user } = useAuth();
  const { data, error, loading, refreshing, refresh } = useQuery<{ notices: Notice[] }>("/notices");

  const remove = (n: Notice) => {
    const doDelete = async () => {
      try {
        await request(`/notices/${n.id}`, { method: "DELETE" });
        refresh();
      } catch (e) {
        Alert.alert("Could not delete", e instanceof Error ? e.message : undefined);
      }
    };
    if (Platform.OS === "web") return window.confirm("Delete this notice?") && void doDelete();
    Alert.alert("Delete this notice?", n.title, [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: doDelete }]);
  };

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorView message={error} onRetry={refresh} />;
  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Button title="Post a notice" onPress={() => router.push("/new-notice")} />
      {data!.notices.length === 0 && <Empty>No notices yet.</Empty>}
      {data!.notices.map((n) => (
        <Card key={n.id}>
          <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            {n.pinned && <Badge label="Pinned" tone="amber" />}
            {n.audience === "TEACHERS" && <Badge label="Staff only" tone="blue" />}
          </View>
          <Title>{n.title}</Title>
          <Small style={{ marginTop: 2 }}>
            {n.author?.name ?? "School office"} · {date(n.createdAt)}
          </Small>
          <Body style={{ marginTop: 10 }}>{n.body}</Body>
          {(user?.role === "ADMIN" || n.author?.id === user?.id) && (
            <Pressable onPress={() => remove(n)} hitSlop={8} style={{ alignSelf: "flex-end", marginTop: 8 }}>
              <Text style={{ color: t.danger, fontSize: 13 }}>Delete</Text>
            </Pressable>
          )}
        </Card>
      ))}
    </Screen>
  );
}
