import { Tabs } from "expo-router/js-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ColorValue } from "react-native";
import { useTheme } from "../../lib/theme";

type IconName = keyof typeof Ionicons.glyphMap;
const icon = (name: IconName) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color as string} size={size} />;
  };

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: t.brand,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.line },
        headerStyle: { backgroundColor: t.surface },
        headerTitleStyle: { color: t.ink },
        sceneStyle: { backgroundColor: t.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: icon("home-outline") }} />
      <Tabs.Screen name="students" options={{ title: "Students", tabBarIcon: icon("people-outline") }} />
      <Tabs.Screen name="classes" options={{ title: "Classes", tabBarIcon: icon("school-outline") }} />
      <Tabs.Screen name="notices" options={{ title: "Notices", tabBarIcon: icon("megaphone-outline") }} />
      <Tabs.Screen name="fees" options={{ title: "Fees", tabBarIcon: icon("wallet-outline") }} />
    </Tabs>
  );
}
