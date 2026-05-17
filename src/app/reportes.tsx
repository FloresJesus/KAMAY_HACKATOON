import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Share, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TrendingUp, Download } from "lucide-react-native";
import { useSales } from "@/lib/store";
import { formatBs } from "@/lib/utils";
import { Colors, Gradients, Shadow } from "@/constants/colors";
import { PageHeader } from "@/components/tinka/AppShell";
import { useRouter } from "expo-router";

const FILTERS = ["HOY", "SEMANA", "MES", "PERSONAL."] as const;
type Filter = (typeof FILTERS)[number];

function inRange(date: Date, f: Filter) {
  const n = new Date();
  if (f === "HOY") return date.toDateString() === n.toDateString();
  if (f === "SEMANA") {
    const start = new Date(n);
    start.setDate(n.getDate() - ((n.getDay() + 6) % 7));
    start.setHours(0, 0, 0, 0);
    return date >= start;
  }
  if (f === "MES") return date.getMonth() === n.getMonth() && date.getFullYear() === n.getFullYear();
  return true;
}

const CHART_COLORS = [Colors.navy, Colors.magenta, Colors.purple, "#4A7BC8", Colors.warning];

export default function Reports() {
  const { sales } = useSales();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("SEMANA");

  const filtered = useMemo(
    () => sales.filter((s) => inRange(new Date(s.date), filter)),
    [sales, filter]
  );
  const total = filtered.reduce((a, s) => a + s.amount, 0);

  const trend = useMemo(() => {
    const days = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return days.map((d, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const v = sales
        .filter((s) => new Date(s.date).toDateString() === day.toDateString())
        .reduce((a, s) => a + s.amount, 0);
      return { day: d, ventas: v };
    });
  }, [sales]);

  const maxVentas = Math.max(...trend.map((t) => t.ventas), 1);

  const byMethod = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((s) => map.set(s.method, (map.get(s.method) ?? 0) + s.amount));
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const byLocation = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((s) => map.set(s.location, (map.get(s.location) ?? 0) + s.amount));
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const exportCSV = async () => {
    const header = "id,producto,categoria,monto,metodo,ubicacion,fecha\n";
    const body = filtered
      .map((s) => [s.id, s.product, s.category, s.amount, s.method, s.location, s.date].join(","))
      .join("\n");
    try {
      await Share.share({
        message: header + body,
        title: `tinkaventas-${filter.toLowerCase()}.csv`,
      });
    } catch {}
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <PageHeader title="Reportes" showBack onBack={() => router.push("/")} />

      <View style={styles.filters}>
        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.filterBtn, active && styles.filterBtnActive]}
              >
                {active ? (
                  <LinearGradient
                    colors={Gradients.icon}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.filterBtnGrad}
                  >
                    <Text style={styles.filterBtnActiveText}>{f}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.filterBtnInactiveText}>{f}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <LinearGradient
        colors={Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.summaryCard}
      >
        <Text style={styles.summaryLabel}>Total recaudado</Text>
        <Text style={styles.summaryValue}>{formatBs(total)}</Text>
        <View style={styles.summaryRow}>
          <TrendingUp color="rgba(255,255,255,0.9)" size={14} />
          <Text style={styles.summarySales}>{filtered.length} ventas registradas</Text>
        </View>
      </LinearGradient>

      <View style={styles.trendCard}>
        <Text style={styles.chartTitle}>Ventas por dia (semana)</Text>
        <View style={styles.barChart}>
          {trend.map((t) => {
            const barHeight = Math.max((t.ventas / maxVentas) * 140, 4);
            return (
              <View key={t.day} style={styles.barColumn}>
                <Text style={styles.barValue}>
                  {t.ventas > 0 ? formatBs(t.ventas) : ""}
                </Text>
                <View style={styles.barTrack}>
                  <LinearGradient
                    colors={Gradients.icon}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={[styles.bar, { height: barHeight }]}
                  />
                </View>
                <Text style={styles.barLabel}>{t.day}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.donutCards}>
        <DonutCard title="Por metodo de pago" data={byMethod} colors={CHART_COLORS} />
        <DonutCard title="Por ubicacion" data={byLocation} colors={CHART_COLORS} />
      </View>

      <View style={styles.exportSection}>
        <TouchableOpacity onPress={exportCSV} style={styles.exportBtn}>
          <Download color={Colors.navy} size={20} />
          <Text style={styles.exportBtnText}>Exportar CSV</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function DonutCard({
  title,
  data,
  colors,
}: {
  title: string;
  data: { name: string; value: number }[];
  colors: string[];
}) {
  const total = data.reduce((a, d) => a + d.value, 0);

  if (data.length === 0) {
    return (
      <View style={styles.donutCard}>
        <Text style={styles.chartTitle}>{title}</Text>
        <Text style={styles.noData}>Sin datos en este periodo.</Text>
      </View>
    );
  }

  return (
    <View style={styles.donutCard}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.donutLegend}>
        {data.map((d, i) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <View key={d.name} style={styles.legendRow}>
              <View style={styles.legendRow2}>
                <View style={[styles.legendDot, { backgroundColor: colors[i % colors.length] }]} />
                <Text style={styles.legendName}>{d.name}</Text>
              </View>
              <Text style={styles.legendPct}>
                {formatBs(d.value)} ({pct}%)
              </Text>
            </View>
          );
        })}
      </View>
      <View style={styles.donutBar}>
        {data.map((d, i) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          return (
            <View
              key={d.name}
              style={[
                styles.donutBarSegment,
                {
                  flex: pct,
                  backgroundColor: colors[i % colors.length],
                },
              ]}
            />
          );
        })}
      </View>
    </View>
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
  filters: {
    paddingHorizontal: 20,
  },
  filterRow: {
    flexDirection: "row",
    gap: 6,
    padding: 4,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 28,
  },
  filterBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  filterBtnActive: {
    borderWidth: 0,
  },
  filterBtnGrad: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnActiveText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  filterBtnInactiveText: {
    color: Colors.navy,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
    lineHeight: 40,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    ...Shadow.elevated,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: "rgba(255,255,255,0.85)",
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  summarySales: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
  },
  trendCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    ...Shadow.soft,
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: Colors.navy,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  barChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 200,
    paddingTop: 20,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  barValue: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.navy,
    marginBottom: 2,
  },
  barTrack: {
    width: 24,
    height: 140,
    borderRadius: 12,
    backgroundColor: Colors.muted,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    borderRadius: 12,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.navy,
    marginTop: 4,
  },
  donutCards: {
    marginHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  donutCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    ...Shadow.soft,
  },
  noData: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.mutedForeground,
    marginTop: 12,
  },
  donutLegend: {
    gap: 8,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legendRow2: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.navy,
  },
  legendPct: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.mutedForeground,
  },
  donutBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 12,
  },
  donutBarSegment: {
    height: "100%",
  },
  exportSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  exportBtn: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.navy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  exportBtnText: {
    color: Colors.navy,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
