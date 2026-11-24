import { Text, View } from "react-native";
import { useTheme } from "../lib/theme";

export function Logo({ size = 40 }: { size?: number }) {
  const t = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 4, backgroundColor: t.brand, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: size * 0.42 }}>T</Text>
      <View style={{ position: "absolute", bottom: size * 0.16, width: size * 0.4, height: 3, borderRadius: 2, backgroundColor: t.accent }} />
    </View>
  );
}
