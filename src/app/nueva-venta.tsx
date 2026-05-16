import {
    TriangleAlert as AlertTriangle,
    Banknote,
    Bike,
    Calendar,
    Check,
    Landmark,
    MapPin,
    MoveHorizontal as MoreHorizontal,
    Package,
    Palette,
    QrCode,
    Scissors,
    ShoppingBag,
    Store,
    Tent,
    UtensilsCrossed,
    Wrench,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from "react-native";

import {
    CATEGORIES,
    LOCATIONS,
    PAYMENT_METHODS,
    formatBs,
    type Location,
    type PaymentMethod,
} from "@/components/tinka/mock-data";
import { getStockStatus, useProducts } from "@/components/tinka/product-store";
import { useSales } from "@/components/tinka/store";

const ICONS: Record<string, any> = {
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

type NewSaleScreenProps = {
  navigation: {
    goBack: () => void;
  };
};

export default function NewSaleScreen({ navigation }: NewSaleScreenProps) {
  const { sales, addSale } = useSales();
  const { products, deductStock } = useProducts();

  const [amount, setAmount] = useState("");
  const [product, setProduct] = useState("");
  const [linkedProductId, setLinkedProductId] = useState<string | null>(null);
  const [category, setCategory] = useState<string>(CATEGORIES[0].label);
  const [method, setMethod] = useState<PaymentMethod>("Efectivo");
  const [location, setLocation] = useState<Location>("Tienda");
  const [success, setSuccess] = useState<null | {
    product: string;
    amount: number;
    method: PaymentMethod;
  }>(null);
  const [stockWarning, setStockWarning] = useState<null | {
    available: number;
    productName: string;
  }>(null);

  const topProducts = useMemo(() => {
    const count = new Map<string, number>();
    sales.forEach((s) => {
      count.set(s.product, (count.get(s.product) ?? 0) + 1);
    });
    return [...count.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([p]) => p);
  }, [sales]);

  const nowIso = useMemo(() => new Date().toLocaleString(), []);

  const handleSelectCatalogProduct = (p: (typeof products)[number]) => {
    setProduct(p.name);
    setLinkedProductId(p.id);
    setAmount(String(p.price));
  };

  const doSubmit = () => {
    const value = parseFloat(amount.replace(",", "."));
    if (!value || !product) return;

    addSale({
      product,
      qty: 1,
      category,
      method,
      location,
      amount: value,
    });

    if (linkedProductId) {
      deductStock(linkedProductId, 1, crypto.randomUUID());
    }

    setSuccess({ product, amount: value, method });
  };

  const submit = () => {
    if (linkedProductId) {
      const linked = products.find((p) => p.id === linkedProductId);
      if (linked && linked.stockCurrent <= 0) {
        setStockWarning({
          available: linked.stockCurrent,
          productName: linked.name,
        });
        return;
      }
    }
    doSubmit();
  };

  if (success) {
    return (
      <View style={styles.screen}>
        <View style={styles.successBox}>
          <View style={styles.successIcon}>
            <Check size={48} color="#fff" strokeWidth={3} />
          </View>
          <Text style={styles.successTitle}>Venta registrada</Text>
          <View style={styles.successDetails}>
            <Row label="Producto" value={success.product} />
            <Row label="Monto" value={formatBs(success.amount)} highlight />
            <Row label="Método" value={success.method} />
          </View>
          <TouchableOpacity
            onPress={() => {
              setSuccess(null);
              setAmount("");
              setProduct("");
              setLinkedProductId(null);
            }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Nueva Venta</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={navigation.goBack}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageTitle}>Registrar Venta</Text>

        <Modal visible={!!stockWarning} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIcon}>
                  <AlertTriangle size={24} color="#E94560" />
                </View>
                <View style={styles.modalTextBox}>
                  <Text style={styles.modalTitle}>Stock insuficiente</Text>
                  <Text style={styles.modalMessage}>
                    Solo tienes {stockWarning?.available} unidades disponibles
                    de {stockWarning?.productName}
                  </Text>
                </View>
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setStockWarning(null)}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setStockWarning(null);
                    doSubmit();
                  }}
                  style={styles.modalConfirmButton}
                >
                  <Text style={styles.modalConfirmText}>Continuar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {products.length > 0 && (
          <View style={styles.section}>
            <Label text="Desde tu catálogo" />
            <View style={styles.tagContainer}>
              {products.map((p) => {
                const status = getStockStatus(p);
                const active = linkedProductId === p.id;
                const dotColor =
                  status === "ok"
                    ? "#1FB66B"
                    : status === "low"
                      ? "#F5A623"
                      : "#E94560";
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => handleSelectCatalogProduct(p)}
                    style={[
                      styles.catalogTag,
                      active
                        ? styles.catalogTagActive
                        : styles.catalogTagInactive,
                    ]}
                  >
                    <View
                      style={[
                        styles.catalogDot,
                        { backgroundColor: active ? "#fff" : dotColor },
                      ]}
                    />
                    <Text
                      style={[
                        styles.catalogTagText,
                        active ? styles.catalogTagTextActive : {},
                      ]}
                    >
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {topProducts.length > 0 && (
          <View style={styles.section}>
            <Label text="Acceso rápido" />
            <View style={styles.tagContainer}>
              {topProducts.map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => {
                    setProduct(p);
                    setLinkedProductId(null);
                  }}
                  style={[
                    styles.quickAccessTag,
                    product === p && !linkedProductId
                      ? styles.quickAccessTagActive
                      : styles.quickAccessTagInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.quickAccessText,
                      product === p && !linkedProductId
                        ? styles.quickAccessTextActive
                        : {},
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Label text="Producto o Servicio" />
          <Input
            value={product}
            onChangeText={(text) => {
              setProduct(text);
              setLinkedProductId(null);
            }}
            placeholder="Ej. Almuerzo familiar"
          />
        </View>

        <View style={styles.section}>
          <Label text="Monto (Bs.)" />
          <Input
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={(text) => setAmount(text.replace(/[^\d.,]/g, ""))}
            placeholder="0.00"
          />
        </View>

        <View style={styles.section}>
          <Label text="Categoría" />
          <View style={styles.gridRow}>
            {CATEGORIES.map((c) => {
              const Icon = ICONS[c.icon];
              const active = category === c.label;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setCategory(c.label)}
                  style={[
                    styles.card,
                    active ? styles.cardActive : styles.cardInactive,
                  ]}
                >
                  <Icon size={24} color={active ? "#E91E8C" : "#1B3A6B"} />
                  <Text
                    style={[
                      styles.cardText,
                      active ? styles.cardTextActive : {},
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Label text="Método de pago" />
          <View style={styles.gridRow}>
            {PAYMENT_METHODS.map((m) => {
              const Icon = ICONS[m.icon];
              const active = method === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setMethod(m.id)}
                  style={[
                    styles.smallCard,
                    active ? styles.smallCardActive : styles.smallCardInactive,
                  ]}
                >
                  <Icon size={20} color={active ? "#fff" : "#1B3A6B"} />
                  <Text
                    style={[
                      styles.smallCardText,
                      active ? styles.smallCardTextActive : {},
                    ]}
                  >
                    {m.id}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Label text="Ubicación" />
          <View style={styles.gridRow}>
            {LOCATIONS.map((l) => {
              const Icon = ICONS[l.icon];
              const active = location === l.id;
              return (
                <TouchableOpacity
                  key={l.id}
                  onPress={() => setLocation(l.id)}
                  style={[
                    styles.smallCard,
                    active ? styles.smallCardActive : styles.smallCardInactive,
                  ]}
                >
                  <Icon size={20} color={active ? "#fff" : "#1B3A6B"} />
                  <Text
                    style={[
                      styles.smallCardText,
                      active ? styles.smallCardTextActive : {},
                    ]}
                  >
                    {l.id}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Label text="Fecha y hora" />
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>{nowIso}</Text>
            <Calendar size={20} color="#E91E8C" />
          </View>
        </View>

        <TouchableOpacity
          disabled={!product || !amount}
          onPress={submit}
          style={[
            styles.submitButton,
            !product || !amount ? styles.submitButtonDisabled : {},
          ]}
        >
          <Text style={styles.submitButtonText}>Registrar Venta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

function Input(props: TextInputProps) {
  return (
    <TextInput {...props} placeholderTextColor="#94A3B8" style={styles.input} />
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
      <Text
        style={[styles.rowValue, highlight ? styles.rowValueHighlight : {}]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1B3A6B",
    marginBottom: 24,
  },
  successBox: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#E91E8C",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1B3A6B",
    marginBottom: 20,
  },
  successDetails: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  primaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E91E8C",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#1B3A6B",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#1B3A6B",
    fontSize: 16,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEE2E6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modalTextBox: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#E94560",
    marginBottom: 6,
  },
  modalMessage: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1B3A6B",
    justifyContent: "center",
    alignItems: "center",
  },
  modalConfirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E91E8C",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelText: {
    color: "#1B3A6B",
    fontWeight: "700",
  },
  modalConfirmText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#E91E8C",
    marginBottom: 10,
  },
  input: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#1B3A6B",
    paddingHorizontal: 20,
    color: "#1B3A6B",
    fontWeight: "700",
    fontSize: 16,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  catalogTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 999,
    marginRight: 10,
    marginBottom: 10,
  },
  catalogTagActive: {
    backgroundColor: "#E91E8C",
  },
  catalogTagInactive: {
    borderWidth: 1,
    borderColor: "#1B3A6B",
  },
  catalogDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  catalogTagText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1B3A6B",
  },
  catalogTagTextActive: {
    color: "#FFFFFF",
  },
  quickAccessTag: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 999,
    marginRight: 10,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  quickAccessTagActive: {
    backgroundColor: "#E91E8C",
  },
  quickAccessTagInactive: {
    borderWidth: 1,
    borderColor: "#1B3A6B",
  },
  quickAccessText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1B3A6B",
  },
  quickAccessTextActive: {
    color: "#FFFFFF",
  },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
  },
  card: {
    width: "31%",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  cardActive: {
    backgroundColor: "#FCE7F3",
    borderWidth: 1,
    borderColor: "#E91E8C",
  },
  cardInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardText: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: "800",
    color: "#1B3A6B",
    textAlign: "center",
  },
  cardTextActive: {
    color: "#E91E8C",
  },
  smallCard: {
    width: "23%",
    borderRadius: 20,
    paddingVertical: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  smallCardActive: {
    backgroundColor: "#E91E8C",
    borderWidth: 1,
    borderColor: "#E91E8C",
  },
  smallCardInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  smallCardText: {
    marginTop: 8,
    fontSize: 9,
    fontWeight: "800",
    color: "#1B3A6B",
  },
  smallCardTextActive: {
    color: "#FFFFFF",
  },
  dateRow: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#1B3A6B",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    color: "#1B3A6B",
    fontWeight: "700",
  },
  submitButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E91E8C",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rowLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#E91E8C",
    letterSpacing: 1,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B3A6B",
  },
  rowValueHighlight: {
    fontSize: 20,
  },
});
