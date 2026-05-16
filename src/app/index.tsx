import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronRight,
  Lightbulb,
  Plus,
  TrendingUp,
  TriangleAlert,
  Package,
} from "lucide-react-native";
import { useSales } from "@/lib/store";
import { useProducts, getStockStatus } from "@/lib/product-store";
import { useCasilleros } from "@/lib/casillero-store";
import { formatBs } from "@/lib/utils";
import { Colors, Gradients, Shadow } from "@/constants/colors";
import { PageHeader, ClientTime, FieButton } from "@/components/tinka/AppShell";

export default function Dashboard() {
  const router = useRouter();
  const { sales } = useSales();
  const { products } = useProducts();
  const { activeReservations } = useCasilleros();
  const today = new Date().toDateString();

  const todaySales = useMemo(
    () => sales.filter((s) => new Date(s.date).toDateString() === today),
    [sales, today]
  );
  const abonos = todaySales.reduce((a, s) => a + s.amount, 0);
  const gastos = 0;
  const recent = sales.slice(0, 6);

  const bestDay = useMemo(() => {
    const days = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    const totals = new Array(7).fill(0);
    sales.forEach((s) => {
      totals[new Date(s.date).getDay()] += s.amount;
    });
    let best = 0;
    for (let i = 1; i < 7; i++) if (totals[i] > totals[best]) best = i;
    return days[best];
  }, [sales]);

  const criticalProducts = products.filter((p) => getStockStatus(p) === "critical");
  const lowProducts = products.filter((p) => {
    const s = getStockStatus(p);
    return s === "low" || s === "critical";
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <PageHeader title="Mi Negocio" />

      {criticalProducts.length > 0 && (
        <TouchableOpacity onPress={() => router.push("/stock")} style={styles.alertBanner}>
          <View style={[styles.alertIcon, { backgroundColor: "rgba(233, 69, 96, 0.15)" }]}>
            <TriangleAlert color={Colors.danger} size={20} strokeWidth={2.5} />
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>
              {criticalProducts.length} producto{criticalProducts.length > 1 ? "s" : ""} con stock
              critico
            </Text>
            <Text style={styles.alertDesc}>
              {criticalProducts.map((p) => p.name).join(", ")}
            </Text>
          </View>
          <ChevronRight color={Colors.danger} size={16} />
        </TouchableOpacity>
      )}

      {activeReservations.length > 0 && (
        <TouchableOpacity onPress={() => (router as any).push("/casilleros")} style={styles.reserveBanner}>
            <View style={[styles.alertIcon, { backgroundColor: "rgba(245, 166, 35, 0.15)" }]}>
              <Package color={Colors.warning} size={20} strokeWidth={2.5} />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.reserveTitle}>
                {activeReservations.length} entrega
                {activeReservations.length > 1 ? "s" : ""} pendiente
                {activeReservations.length > 1 ? "s" : ""}
              </Text>
              <Text style={styles.alertDesc}>
                Casillero Tinka{" "}
                {activeReservations[0].location} {"—"} Ver detalle
              </Text>
            </View>
            <ChevronRight color={Colors.warning} size={16} />
          </TouchableOpacity>
      )}

      <View style={styles.negocioCard}>
        <View style={styles.negocioAccent} />
        <View style={styles.negocioBody}>
          <Text style={styles.negocioTag}>MI NEGOCIO</Text>
          <Text style={styles.negocioName}>Emprendimiento Tinka</Text>
          <Text style={styles.ventasHoyLabel}>Ventas de hoy</Text>
          <Text style={styles.ventasHoyValue}>{formatBs(abonos)}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Abonos</Text>
          <Text style={[styles.statValue, { color: Colors.success }]}>+{formatBs(abonos)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Gastos</Text>
          <Text style={[styles.statValue, { color: Colors.danger }]}>-{formatBs(gastos)}</Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => router.push("/reportes")} style={styles.reportesBtn}>
        <FieButton>
          Ver Reportes Completos{" "}
          <ChevronRight color="#fff" size={20} />
        </FieButton>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/nueva-venta")} style={styles.nuevaVentaBtn}>
          <LinearGradient
            colors={Gradients.icon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nuevaVentaIcon}
          >
            <Plus color="#fff" size={20} strokeWidth={3} />
          </LinearGradient>
          <View style={styles.nuevaVentaText}>
            <Text style={styles.nuevaVentaTitle}>REGISTRAR VENTA</Text>
            <Text style={styles.nuevaVentaDesc}>En segundos, sin papeles</Text>
          </View>
          <ChevronRight color={Colors.navy} size={20} />
        </TouchableOpacity>

      {lowProducts.length > 0 && (
        <View style={styles.stockAlertSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alertas de Stock</Text>
            <TouchableOpacity onPress={() => router.push("/stock")}>
              <Text style={styles.sectionLink}>Ver Stock</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            {lowProducts.slice(0, 3).map((p) => {
              const status = getStockStatus(p);
              const dotColor = status === "critical" ? Colors.danger : Colors.warning;
              return (
                <View key={p.id} style={styles.stockItem}>
                  <View style={[styles.stockDot, { backgroundColor: dotColor }]} />
                  <View style={styles.stockItemContent}>
                    <Text style={styles.stockItemName}>{p.name}</Text>
                    <Text style={styles.stockItemUnit}>{p.unit}</Text>
                  </View>
                  <Text style={[styles.stockItemQty, { color: dotColor }]}>
                    {p.stockCurrent} restantes
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <LinearGradient
        colors={Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.insightCard}
      >
        <View style={styles.insightIcon}>
          <Lightbulb color="#fff" size={20} />
        </View>
        <View style={styles.insightContent}>
          <Text style={styles.insightTag}>INSIGHT DE LA SEMANA</Text>
          <Text style={styles.insightTitle}>Tu mejor dia fue el {bestDay}</Text>
          <Text style={styles.insightDesc}>
            Asegura stock y prepara ofertas ese dia.
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ultimos movimientos</Text>
          <TouchableOpacity onPress={() => router.push("/historial")}>
            <Text style={styles.sectionLink}>Ver todo</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {recent.map((s) => (
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
                    <ClientTime iso={s.date} mode="datetime" />
                  </Text>
                </View>
                <View style={styles.saleAmount}>
                  <Text style={styles.saleAmountValue}>
                    +{formatBs(s.amount)}
                  </Text>
                  <Text style={styles.saleAmountCat}>{s.category}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TrendingUp color={Colors.success} size={12} />
        <Text style={styles.footerText}>Comunidad Tinka · Banco FIE</Text>
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
    paddingBottom: 32,
  },
  alertBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: "rgba(233, 69, 96, 0.4)",
    backgroundColor: "#FFF0F3",
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: Colors.danger,
  },
  alertDesc: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  reserveBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: "rgba(245, 166, 35, 0.4)",
    backgroundColor: "#FFFBEC",
  },
  reserveTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: Colors.warning,
  },
  negocioCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    flexDirection: "row",
    ...Shadow.soft,
  },
  negocioAccent: {
    width: 8,
    backgroundColor: Colors.magenta,
  },
  negocioBody: {
    flex: 1,
    padding: 16,
  },
  negocioTag: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: Colors.magenta,
    textTransform: "uppercase",
  },
  negocioName: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.navy,
    marginTop: 2,
  },
  ventasHoyLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.mutedForeground,
    marginTop: 12,
  },
  ventasHoyValue: {
    fontSize: 30,
    fontWeight: "800",
    color: Colors.navy,
  },
  statsRow: {
    marginHorizontal: 20,
    marginTop: 12,
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    ...Shadow.soft,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: Colors.mutedForeground,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
  },
  reportesBtn: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  nuevaVentaBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(233, 30, 140, 0.4)",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  nuevaVentaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  nuevaVentaText: {
    flex: 1,
  },
  nuevaVentaTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.navy,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  nuevaVentaDesc: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.mutedForeground,
  },
  stockAlertSection: {
    marginTop: 16,
    marginHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: Colors.navy,
    textTransform: "uppercase",
  },
  sectionLink: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.magenta,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    ...Shadow.soft,
  },
  stockItem: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    padding: 14,
    gap: 10,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockItemContent: {
    flex: 1,
  },
  stockItemName: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.navy,
  },
  stockItemUnit: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: Colors.mutedForeground,
  },
  stockItemQty: {
    fontSize: 14,
    fontWeight: "800",
  },
  insightCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  insightContent: {
    flex: 1,
  },
  insightTag: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    marginTop: 2,
  },
  insightDesc: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  recentSection: {
    marginTop: 20,
    marginHorizontal: 20,
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
    alignItems: "flex-end",
  },
  saleAmountValue: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.success,
  },
  saleAmountCat: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: Colors.mutedForeground,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.mutedForeground,
  },
});

