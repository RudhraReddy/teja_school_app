import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";
import { Loading } from "../components/ui";

function RootNavigator() {
  const { ready, user } = useAuth();
  const t = useTheme();
  if (!ready) return <Loading />;
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: t.surface },
        headerTintColor: t.brand,
        headerTitleStyle: { color: t.ink },
        contentStyle: { backgroundColor: t.bg },
        headerBackTitle: "Back",
      }}
    >
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="student/[id]" options={{ title: "Student" }} />
        <Stack.Screen name="class/[id]" options={{ title: "Class" }} />
        <Stack.Screen name="new-notice" options={{ title: "Post a notice", presentation: "modal" }} />
        <Stack.Screen name="record-payment" options={{ title: "Record payment", presentation: "modal" }} />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <RootNavigator />
    </AuthProvider>
  );
}
