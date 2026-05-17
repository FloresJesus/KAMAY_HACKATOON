import { ClientTime, PageHeader } from "@/components/tinka/AppShell";
import { Colors, Shadow } from "@/constants/colors";
import { useSales } from "@/lib/store";
import { formatBs } from "@/lib/utils";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Historial() {
  const { sales } = useSales();
  const router = useRouter();

  const grouped = useMemo(() => {
    const map = new Map<string, typeof sales>();
    sales.forEach((s) => {
      const key = new Date(s.date).toDateString();
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    });
    return [...map.entries()];
  }, [sales]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <PageHeader title="Historial" showBack onBack={() => router.push("/")} />

      <View style={styles.list}>
        {grouped.map(([day, items]) => {
          const total = items.reduce((a, s) => a + s.amount, 0);
          return (
            <View key={day}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayLabel}>
                  <ClientTime iso={items[0].date} mode="date" />
                </Text>
                <Text style={styles.dayTotal}>{formatBs(total)}</Text>
              </View>
              <View style={styles.card}>
                {items.map((s) => (
                  <View key={s.id} style={styles.saleItem}>
                    <View style={styles.saleAccent} />
                    <View style={styles.saleBody}>
                      <View style={styles.saleDot} />
                      <View style={styles.saleInfo}>
                        <Text style={styles.saleProduct} numberOfLines={1}>
                          {s.product}
                        </Text>
                        <Text style={styles.saleMeta}>
                          {s.method} · {s.location} ·{" "}
                          <ClientTime iso={s.date} mode="time" />
                        </Text>
                      </View>
                      <Text style={styles.saleAmount}>
                        +{formatBs(s.amount)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  list: {
    paddingHorizontal: 20,
    gap: 16,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: Colors.magenta,
    textTransform: "uppercase",
  },
  dayTotal: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.navy,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    ...Shadow.soft,
  },
  saleItem: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  saleAccent: {
    width: 6,
    backgroundColor: Colors.magenta,
  },
  saleBody: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  saleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  saleInfo: {
    flex: 1,
  },
  saleProduct: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.navy,
  },
  saleMeta: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  saleAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.success,
  },
});
