import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from "react-native";
import { useTheme } from "../lib/theme";

export function Screen({ children, refreshing, onRefresh }: { children: ReactNode; refreshing?: boolean; onRefresh?: () => void }) {
  const t = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={t.brand} /> : undefined}
    >
      {children}
    </ScrollView>
  );
}

export function Card({ children, style, onPress }: { children: ReactNode; style?: ViewStyle; onPress?: () => void }) {
  const t = useTheme();
  const base: ViewStyle = { backgroundColor: t.surface, borderColor: t.line, borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 16 };
  if (onPress)
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [base, style, pressed && { opacity: 0.7 }]}>
        {children}
      </Pressable>
    );
  return <View style={[base, style]}>{children}</View>;
}

export function Title({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={{ fontSize: 16, fontWeight: "600", color: t.ink }}>{children}</Text>;
}

export function Body({ children, muted, style, numberOfLines }: { children: ReactNode; muted?: boolean; style?: object; numberOfLines?: number }) {
  const t = useTheme();
  return (
    <Text numberOfLines={numberOfLines} style={[{ fontSize: 14, lineHeight: 20, color: muted ? t.muted : t.ink }, style]}>
      {children}
    </Text>
  );
}

export function Small({ children, style }: { children: ReactNode; style?: object }) {
  const t = useTheme();
  return <Text style={[{ fontSize: 12, color: t.muted }, style]}>{children}</Text>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={{ fontSize: 13, fontWeight: "600", color: t.muted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 8 }}>{children}</Text>;
}

export function Button({ title, onPress, loading, variant = "primary", disabled }: { title: string; onPress: () => void; loading?: boolean; variant?: "primary" | "secondary"; disabled?: boolean }) {
  const t = useTheme();
  const primary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      accessibilityRole="button"
      style={({ pressed }) => ({
        backgroundColor: primary ? t.brand : t.surface,
        borderColor: primary ? t.brand : t.line,
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        opacity: pressed || loading || disabled ? 0.7 : 1,
      })}
    >
      {loading ? <ActivityIndicator color={primary ? t.onBrand : t.brand} /> : <Text style={{ color: primary ? t.onBrand : t.ink, fontWeight: "600", fontSize: 15 }}>{title}</Text>}
    </Pressable>
  );
}

export function Input({ label, error, ...props }: { label: string; error?: string } & TextInputProps) {
  const t = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontWeight: "500", color: t.ink }}>{label}</Text>
      <TextInput
        placeholderTextColor={t.muted}
        style={{ borderWidth: 1, borderColor: error ? t.danger : t.line, backgroundColor: t.surface, color: t.ink, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 }}
        {...props}
      />
      {error ? <Text style={{ color: t.danger, fontSize: 12 }}>{error}</Text> : null}
    </View>
  );
}

export function Chips<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const t = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: active ? t.brand : t.surface, borderWidth: 1, borderColor: active ? t.brand : t.line }}
          >
            <Text style={{ color: active ? t.onBrand : t.ink, fontSize: 13, fontWeight: "500" }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function Badge({ label, tone = "gray" }: { label: string; tone?: "green" | "red" | "amber" | "gray" | "blue" }) {
  const t = useTheme();
  const map = { green: [t.successBg, t.success], red: [t.dangerBg, t.danger], amber: [t.warnBg, t.warn], gray: [t.subtle, t.muted], blue: [t.subtle, t.brand] } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, alignSelf: "flex-start" }}>
      <Text style={{ color: fg, fontSize: 11, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

export function Row({ label, value }: { label: string; value: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: t.line, gap: 12 }}>
      <Text style={{ color: t.muted, fontSize: 14 }}>{label}</Text>
      {typeof value === "string" || typeof value === "number" ? <Text style={{ color: t.ink, fontSize: 14, flexShrink: 1, textAlign: "right" }}>{value}</Text> : value}
    </View>
  );
}

export function Loading() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40, backgroundColor: t.bg }}>
      <ActivityIndicator color={t.brand} />
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12, backgroundColor: t.bg }}>
      <Text style={{ color: t.ink, textAlign: "center" }}>{message}</Text>
      {onRetry && <Button title="Try again" variant="secondary" onPress={onRetry} />}
    </View>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ padding: 24, borderRadius: 12, borderWidth: 1, borderStyle: "dashed", borderColor: t.line, alignItems: "center" }}>
      <Text style={{ color: t.muted, textAlign: "center" }}>{children}</Text>
    </View>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card style={{ flex: 1, minWidth: "45%" }}>
      <Small>{label}</Small>
      <Text style={{ fontSize: 22, fontWeight: "700", marginTop: 6, color: useTheme().ink }}>{value}</Text>
      {sub ? <Small style={{ marginTop: 2 }}>{sub}</Small> : null}
    </Card>
  );
}
