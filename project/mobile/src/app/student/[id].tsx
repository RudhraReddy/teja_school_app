import { Linking, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../lib/auth";
import { useQuery } from "../../lib/useQuery";
import type { FeeSummary, Student } from "../../lib/api";
import { classLabel, date, inr, PAYMENT_METHODS } from "../../lib/format";
import { useTheme } from "../../lib/theme";
import { Badge, Button, Card, Empty, ErrorView, Loading, Row, Screen, SectionTitle, Small, Title } from "../../components/ui";

export default function StudentScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const s = useQuery<{ student: Student }>(`/students/${id}`);
  const f = useQuery<FeeSummary>(`/students/${id}/fees`);
  const refresh = () => {
    s.refresh();
    f.refresh();
  };

  if (s.loading && !s.data) return <Loading />;
  if (s.error && !s.data) return <ErrorView message={s.error} onRetry={s.refresh} />;
  const st = s.data!.student;
  const fees = f.data;

  return (
    <Screen refreshing={s.refreshing || f.refreshing} onRefresh={refresh}>
      <Stack.Screen options={{ title: `${st.firstName} ${st.lastName}` }} />
      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: t.ink }}>{st.firstName} {st.lastName}</Text>
            <Small>{st.admissionNo} · {classLabel(st.class)}</Small>
          </View>
          <Badge label={st.status === "ACTIVE" ? "Active" : "Inactive"} tone={st.status === "ACTIVE" ? "green" : "gray"} />
        </View>
        <View style={{ marginTop: 12 }}>
          <Row label="Class teacher" value={st.class?.classTeacher?.name ?? "—"} />
          <Row label="Date of birth" value={date(st.dateOfBirth)} />
          <Row label="Gender" value={st.gender ? st.gender[0] + st.gender.slice(1).toLowerCase() : "—"} />
          <Row label="Guardian" value={st.guardianName ?? "—"} />
          <Row
            label="Guardian phone"
            value={
              st.guardianPhone ? (
                <Text style={{ color: t.brand, fontSize: 14 }} onPress={() => Linking.openURL(`tel:${st.guardianPhone}`)}>
                  {st.guardianPhone}
                </Text>
              ) : (
                "—"
              )
            }
          />
          <Row label="Address" value={st.address ?? "—"} />
        </View>
      </Card>

      <SectionTitle>Fees</SectionTitle>
      {!fees ? (
        f.error ? <Empty>{f.error}</Empty> : <Loading />
      ) : (
        <>
          <Card>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              {[
                ["Total", inr(fees.totalDue), t.ink],
                ["Paid", inr(fees.totalPaid), t.success],
                ["Balance", inr(fees.balance), fees.balance > 0 ? t.danger : t.ink],
              ].map(([label, value, color]) => (
                <View key={label} style={{ alignItems: "center", flex: 1 }}>
                  <Small>{label}</Small>
                  <Text style={{ fontSize: 17, fontWeight: "700", color, marginTop: 4 }}>{value}</Text>
                </View>
              ))}
            </View>
            <View style={{ marginTop: 12 }}>
              {fees.breakdown.map(({ item, balance }) => (
                <Row
                  key={item.id}
                  label={item.name}
                  value={balance === 0 ? <Badge label="Paid" tone="green" /> : <Text style={{ color: t.danger, fontSize: 14 }}>{inr(balance)} due</Text>}
                />
              ))}
            </View>
          </Card>
          {user?.role === "ADMIN" && <Button title="Record a payment" onPress={() => router.push({ pathname: "/record-payment", params: { studentId: id } })} />}
          <SectionTitle>Payment history</SectionTitle>
          {fees.payments.length === 0 && <Empty>No payments recorded.</Empty>}
          {fees.payments.map((p) => (
            <Card key={p.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Title>{p.feeItem?.name ?? "General"}</Title>
                <Small>{date(p.paidOn)} · {PAYMENT_METHODS[p.method] ?? p.method}</Small>
                <Small>{p.receiptNo}</Small>
              </View>
              <Text style={{ fontSize: 16, fontWeight: "700", color: t.ink }}>{inr(p.amount)}</Text>
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}
