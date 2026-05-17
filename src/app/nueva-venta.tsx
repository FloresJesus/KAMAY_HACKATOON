import { useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  UtensilsCrossed,
  ShoppingBag,
  Wrench,
  Palette,
  Scissors,
  Package,
  Banknote,
  QrCode,
  Landmark,
  MoreHorizontal,
  Store,
  Tent,
  Bike,
  MapPin,
  Check,
  Calendar,
  Zap,
  TriangleAlert,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSales } from "@/lib/store";
import { useProducts, getStockStatus } from "@/lib/product-store";
import { formatBs } from "@/lib/utils";
import {
  CATEGORIES,
  PAYMENT_METHODS,
  LOCATIONS,
  type PaymentMethod,
  type Location,
} from "@/lib/mock-data";
import { Colors, Gradients, Shadow } from "@/constants/colors";
import {
  PageHeader,
  FieLabel,
  FieInput,
  FieButton,
  ClientTime,
} from "@/components/tinka/AppShell";

const ICON_MAP: Record<string, React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>> = {
  UtensilsCrossed,
  ShoppingBag,
  Wrench,
  Palette,
  Scissors,
  Package,
  Banknote,
  QrCode,
  Landmark,
  MoreHorizontal,
  Store,
  Tent,
  Bike,
  MapPin,
};

export default function NewSale() {
  const { sales, addSale } = useSales();
  const { products, deductStock } = useProducts();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [product, setProduct] = useState("");
  const [linkedProductId, setLinkedProductId] = useState<string | null>(null);
  const [category, setCategory] = useState<string>(CATEGORIES[0].label);
  const [method, setMethod] = useState<PaymentMethod>("Efectivo");
  const [location, setLocation] = useState<Location>("Tienda");
  const [success, setSuccess] = useState<{
    product: string;
    amount: number;
    method: PaymentMethod;
  } | null>(null);
  const [stockWarning, setStockWarning] = useState<{
    available: number;
    productName: string;
  } | null>(null);

  const topProducts = useMemo(() => {
    const count = new Map<string, number>();
    sales.forEach((s) => count.set(s.product, (count.get(s.product) ?? 0) + 1));
    return [...count.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([p]) => p);
  }, [sales]);

  const nowIso = useMemo(() => new Date().toISOString(), []);

  const handleSelectCatalogProduct = (p: (typeof products)[0]) => {
    setProduct(p.name);
    setLinkedProductId(p.id);
    setAmount(String(p.price));
  };

  const doSubmit = () => {
    const value = parseFloat(amount.replace(",", "."));
    if (!value || !product) return;
    const saleId = Date.now().toString(36) + Math.random().toString(36).slice(2);
    addSale({ product, qty: 1, category, method, location, amount: value });
    if (linkedProductId) {
      deductStock(linkedProductId, 1, saleId);
    }
    setSuccess({ product, amount: value, method });
  };

  const submit = () => {
    if (linkedProductId) {
      const linked = products.find((p) => p.id === linkedProductId);
      if (linked && linked.stockCurrent <= 0) {
        setStockWarning({ available: linked.stockCurrent, productName: linked.name });
        return;
      }
    }
    doSubmit();
  };

  if (success) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.successContent}>
        <PageHeader title="Venta Exitosa" />
        <View style={styles.successInner}>
          <LinearGradient
            colors={Gradients.icon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successIcon}
          >
            <Check color="#fff" size={48} strokeWidth={3} />
          </LinearGradient>
          <Text style={styles.successTitle}>Venta registrada con exito</Text>
          <View style={styles.successCard}>
            <Row label="Producto" value={success.product} />
            <Row label="Monto" value={formatBs(success.amount)} highlight />
            <Row label="Metodo" value={success.method} />
          </View>
          <View style={styles.successActions}>
            <FieButton
              onPress={() => {
                setSuccess(null);
                setAmount("");
                setProduct("");
                setLinkedProductId(null);
              }}
            >
              Nueva Venta
            </FieButton>
            <TouchableOpacity
              onPress={() => router.push("/")}
              style={styles.outlineBtn}
            >
              <Text style={styles.outlineBtnText}>Volver al inicio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <PageHeader
        title="Registrar Venta"
        showBack
        onBack={() => router.push("/")}
      />

      <Modal visible={!!stockWarning} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <TriangleAlert color={Colors.danger} size={24} strokeWidth={2.5} />
              </View>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>Stock Insuficiente</Text>
                <Text style={styles.modalDesc}>
                  Solo tienes {stockWarning?.available} unidades disponibles de{" "}
                  {stockWarning?.productName}.
                </Text>
              </View>
            </View>
            <Text style={styles.modalQuestion}>
              Deseas continuar de todas formas?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setStockWarning(null)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setStockWarning(null);
                  doSubmit();
                }}
                style={styles.modalConfirmBtn}
              >
                <LinearGradient
                  colors={Gradients.icon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalConfirmGrad}
                >
                  <Text style={styles.modalConfirmText}>Continuar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.form}>
        {products.length > 0 && (
          <View>
            <FieLabel>
              <Text style={styles.labelIcon}>
                <Package color={Colors.magenta} size={12} /> Desde tu catalogo
              </Text>
            </FieLabel>
            <View style={styles.chipsRow}>
              {products.map((p) => {
                const status = getStockStatus(p);
                const active = linkedProductId === p.id;
                const dotColor =
                  status === "ok"
                    ? Colors.success
                    : status === "low"
                      ? Colors.warning
                      : Colors.danger;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => handleSelectCatalogProduct(p)}
                    style={[
                      styles.chip,
                      active ? styles.chipActive : styles.chipInactive,
                    ]}
                  >
                    {active ? (
                      <LinearGradient
                        colors={Gradients.icon}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.chipGrad}
                      >
                        <View
                          style={[styles.chipDot, { backgroundColor: "#fff" }]}
                        />
                        <Text style={styles.chipActiveText}>{p.name}</Text>
                      </LinearGradient>
                    ) : (
                      <>
                        <View
                          style={[styles.chipDot, { backgroundColor: dotColor }]}
                        />
                        <Text style={styles.chipInactiveText}>{p.name}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {topProducts.length > 0 && (
          <View>
            <FieLabel>
              <Text style={styles.labelIcon}>
                <Zap color={Colors.magenta} size={12} /> Acceso rapido
              </Text>
            </FieLabel>
            <View style={styles.chipsRow}>
              {topProducts.map((p) => {
                const active = product === p && !linkedProductId;
                return (
                  <TouchableOpacity
                    key={p}
                    onPress={() => {
                      setProduct(p);
                      setLinkedProductId(null);
                    }}
                    style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                  >
                    {active ? (
                      <LinearGradient
                        colors={Gradients.icon}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.chipGrad}
                      >
                        <Text style={styles.chipActiveText}>{p}</Text>
                      </LinearGradient>
                    ) : (
                      <Text style={styles.chipInactiveText}>{p}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View>
          <FieLabel>Producto o Servicio</FieLabel>
          <FieInput
            value={product}
            onChangeText={(t) => {
              setProduct(t);
              setLinkedProductId(null);
            }}
            placeholder="Ej. Almuerzo familiar"
          />
        </View>

        <View>
          <FieLabel>Monto (Bs.)</FieLabel>
          <FieInput
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={(t) => setAmount(t.replace(/[^\d.,]/g, ""))}
            placeholder="0.00"
          />
        </View>

        <View>
          <FieLabel>Categoria</FieLabel>
          <View style={styles.grid3}>
            {CATEGORIES.map((c) => {
              const Icon = ICON_MAP[c.icon] || Package;
              const active = category === c.label;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setCategory(c.label)}
                  style={[
                    styles.gridItem3,
                    active ? styles.gridItemActive3 : styles.gridItemInactive3,
                  ]}
                >
                  <Icon
                    color={active ? Colors.magenta : Colors.navy}
                    size={24}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.gridLabel3,
                      active && { color: Colors.magenta },
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View>
          <FieLabel>Metodo de pago</FieLabel>
          <View style={styles.grid4}>
            {PAYMENT_METHODS.map((m) => {
              const Icon = ICON_MAP[m.icon] || Package;
              const active = method === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setMethod(m.id)}
                  style={[
                    styles.gridItem4,
                    active ? styles.gridItemActive : styles.gridItemInactive,
                  ]}
                >
                  {active ? (
                    <LinearGradient
                      colors={Gradients.icon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gridGrad4}
                    >
                      <Icon color="#fff" size={20} strokeWidth={2.25} />
                      <Text style={styles.gridActiveText}>{m.id}</Text>
                    </LinearGradient>
                  ) : (
                    <>
                      <Icon color={Colors.navy} size={20} strokeWidth={2.25} />
                      <Text style={styles.gridInactiveText}>{m.id}</Text>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View>
          <FieLabel>Ubicacion</FieLabel>
          <View style={styles.grid4}>
            {LOCATIONS.map((l) => {
              const Icon = ICON_MAP[l.icon] || MapPin;
              const active = location === l.id;
              return (
                <TouchableOpacity
                  key={l.id}
                  onPress={() => setLocation(l.id)}
                  style={[
                    styles.gridItem4,
                    active ? styles.gridItemActive : styles.gridItemInactive,
                  ]}
                >
                  {active ? (
                    <LinearGradient
                      colors={Gradients.icon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gridGrad4}
                    >
                      <Icon color="#fff" size={20} strokeWidth={2.25} />
                      <Text style={styles.gridActiveText}>{l.id}</Text>
                    </LinearGradient>
                  ) : (
                    <>
                      <Icon color={Colors.navy} size={20} strokeWidth={2.25} />
                      <Text style={styles.gridInactiveText}>{l.id}</Text>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View>
          <FieLabel>Fecha y hora</FieLabel>
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>
              <ClientTime iso={nowIso} mode="datetime" />
            </Text>
            <Calendar color={Colors.magenta} size={20} />
          </View>
        </View>

        <FieButton
          onPress={submit}
          disabled={!product || !amount}
        >
          Registrar Venta
        </FieButton>
      </View>
    </ScrollView>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowValueHighlight]}>
        {value}
      </Text>
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
  successContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  successInner: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 24,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.glow,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: Colors.navy,
    textAlign: "center",
    marginTop: 20,
  },
  successCard: {
    width: "100%",
    marginTop: 24,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    gap: 12,
    ...Shadow.soft,
  },
  successActions: {
    width: "100%",
    marginTop: 24,
    gap: 12,
  },
  outlineBtn: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineBtnText: {
    color: Colors.navy,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  modal: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    ...Shadow.elevated,
  },
  modalHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF0F3",
    alignItems: "center",
    justifyContent: "center",
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.danger,
  },
  modalDesc: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  modalQuestion: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.navy,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    color: Colors.navy,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  modalConfirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },
  modalConfirmGrad: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  form: {
    paddingHorizontal: 20,
    gap: 20,
    paddingBottom: 24,
  },
  labelIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 20,
    height: 40,
    overflow: "hidden",
  },
  chipActive: {
    borderWidth: 0,
  },
  chipInactive: {
    borderWidth: 2,
    borderColor: "rgba(27,58,107,0.7)",
    backgroundColor: Colors.card,
  },
  chipGrad: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 40,
    gap: 6,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipActiveText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#fff",
  },
  chipInactiveText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.navy,
    paddingHorizontal: 16,
    lineHeight: 40,
  },
  grid3: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gridItem3: {
    width: (Dimensions.get("window").width - 56) / 3,
    borderRadius: 16,
    borderWidth: 2,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  gridItemActive3: {
    borderColor: Colors.magenta,
    backgroundColor: Colors.accent,
  },
  gridItemInactive3: {
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  gridLabel3: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.navy,
    textAlign: "center",
  },
  grid4: {
    flexDirection: "row",
    gap: 8,
  },
  gridItem4: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    height: 72,
  },
  gridItemActive: {
    borderColor: "transparent",
  },
  gridItemInactive: {
    borderColor: "rgba(27,58,107,0.6)",
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  gridGrad4: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  gridActiveText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  gridInactiveText: {
    color: Colors.navy,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  dateRow: {
    width: "100%",
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 28,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: "rgba(27,58,107,0.7)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    color: Colors.navy,
    fontWeight: "600",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: Colors.magenta,
    textTransform: "uppercase",
  },
  rowValue: {
    fontWeight: "800",
    color: Colors.navy,
    fontSize: 14,
  },
  rowValueHighlight: {
    fontSize: 18,
  },
});
