import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";
import { Button, Input } from "../components/ui";
import { Logo } from "../components/logo";

export default function Login() {
  const t = useTheme();
  const { signIn, serverUrl } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [server, setServer] = useState(serverUrl);
  const [showServer, setShowServer] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    if (!email || !password) return setError("Enter your email and password.");
    setLoading(true);
    try {
      await signIn(email.trim(), password, server.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed");
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <Logo size={64} />
            <Text style={{ fontSize: 20, fontWeight: "700", color: t.ink, marginTop: 16, textAlign: "center" }}>Teja International High School</Text>
            <Text style={{ color: t.muted, marginTop: 4 }}>Staff sign in</Text>
          </View>
          {error ? (
            <Text accessibilityRole="alert" style={{ backgroundColor: t.dangerBg, color: t.danger, padding: 12, borderRadius: 10 }}>
              {error}
            </Text>
          ) : null}
          <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" />
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" textContentType="password" onSubmitEditing={submit} />
          <Button title="Sign in" onPress={submit} loading={loading} />
          <Pressable onPress={() => setShowServer((s) => !s)} style={{ alignItems: "center", padding: 8 }}>
            <Text style={{ color: t.muted, fontSize: 12 }}>{showServer ? "Hide server settings" : "Server settings"}</Text>
          </Pressable>
          {showServer && <Input label="School server address" value={server} onChangeText={setServer} autoCapitalize="none" autoCorrect={false} keyboardType="url" />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
