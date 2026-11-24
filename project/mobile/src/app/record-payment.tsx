import { useState } from "react";
import { Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ApiError, request, type FeeSummary } from "../lib/api";
import { useQuery } from "../lib/useQuery";
import { inr, PAYMENT_METHODS } from "../lib/format";
import { useTheme } from "../lib/theme";
import { Button, Chips, ErrorView, Input, Loading, Screen } from "../components/ui";

export default function RecordPayment() {
  const t = useTheme();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const fees = useQuery<FeeSummary>(`/students/${studentId}/fees`);
  // null = not chosen yet; defaults to the first fee that still has a balance.
  const [chosenItem, setFeeItemId] = useState<string | null>(null);
  const [typedAmount, setAmount] = useState<string | null>(null);
  const [method, setMethod] = useState("CASH");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const firstDue = fees.data?.breakdown.find((b) => b.balance > 0);
  const feeItemId = chosenItem ?? firstDue?.item.id ?? "";
  const amount = typedAmount ?? (firstDue ? String(firstDue.balance) : "");

  if (fees.loading && !fees.data) return <Loading />;
  if (fees.error && !fees.data) return <ErrorView message={fees.error} onRetry={fees.refresh} />;

  const pick = (id: string) => {
    setFeeItemId(id);
    const b = fees.data?.breakdown.find((x) => x.item.id === id);
    if (b) setAmount(String(b.balance));
  };

  async function save() {
    setSaving(true);
    setError("");
    try {
      await request("/fees/payments", { method: "POST", body: { studentId, feeItemId: feeItemId || null, amount: Number(amount), method, note } });
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save");
      setSaving(false);
    }
  }

  return (
    <Screen>
      {error ? <Text style={{ backgroundColor: t.dangerBg, color: t.danger, padding: 12, borderRadius: 10 }}>{error}</Text> : null}
      <Text style={{ fontSize: 13, fontWeight: "500", color: t.ink }}>Paying for</Text>
      <Chips
        value={feeItemId}
        onChange={pick}
        options={[...(fees.data?.breakdown ?? []).map((b) => ({ value: b.item.id, label: `${b.item.name} · ${inr(b.balance)}` })), { value: "", label: "General / advance" }]}
      />
      <Input label="Amount (₹)" value={amount} onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ""))} keyboardType="number-pad" />
      <Text style={{ fontSize: 13, fontWeight: "500", color: t.ink }}>Method</Text>
      <Chips value={method} onChange={setMethod} options={Object.entries(PAYMENT_METHODS).map(([value, label]) => ({ value, label }))} />
      <Input label="Note (optional)" value={note} onChangeText={setNote} placeholder="e.g. UPI ref, cheque no." />
      <Button title={amount ? `Record ${inr(Number(amount))}` : "Record payment"} onPress={save} loading={saving} disabled={!amount} />
    </Screen>
  );
}
