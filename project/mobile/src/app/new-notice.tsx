import { useState } from "react";
import { Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { ApiError, request } from "../lib/api";
import { useTheme } from "../lib/theme";
import { Button, Chips, Input, Screen } from "../components/ui";

export default function NewNotice() {
  const t = useTheme();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"ALL" | "TEACHERS">("ALL");
  const [pinned, setPinned] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setError("");
    setErrors({});
    try {
      await request("/notices", { method: "POST", body: { title, body, audience, pinned } });
      router.back();
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
        setErrors(e.details ?? {});
      }
      setSaving(false);
    }
  }

  return (
    <Screen>
      {error ? <Text style={{ backgroundColor: t.dangerBg, color: t.danger, padding: 12, borderRadius: 10 }}>{error}</Text> : null}
      <Input label="Title" value={title} onChangeText={setTitle} error={errors.title?.[0]} placeholder="e.g. Annual Day on 15 December" />
      <Input label="Message" value={body} onChangeText={setBody} error={errors.body?.[0]} multiline numberOfLines={6} style={{ minHeight: 140, textAlignVertical: "top", borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, color: t.ink, borderRadius: 10, padding: 12, fontSize: 15 }} />
      <Text style={{ fontSize: 13, fontWeight: "500", color: t.ink }}>Audience</Text>
      <Chips value={audience} onChange={setAudience} options={[{ value: "ALL", label: "Everyone" }, { value: "TEACHERS", label: "Staff only" }]} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: t.ink }}>Pin to top</Text>
        <Switch value={pinned} onValueChange={setPinned} trackColor={{ true: t.brand }} />
      </View>
      <Button title="Post notice" onPress={save} loading={saving} />
    </Screen>
  );
}
