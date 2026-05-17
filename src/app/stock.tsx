import { ClientTime, FieButton, FieInput, FieLabel, PageHeader } from "@/components/tinka/AppShell";
import { Colors, Gradients, Shadow } from "@/constants/colors";
import { getStockStatus, useProducts, type Product, type ProductUnit } from "@/lib/product-store";
import { formatBs } from "@/lib/utils";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowUpCircle,
  History,
  Package,
  Plus,
  TriangleAlert,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ViewType = "catalog" | "add-edit" | "replenish" | "history";

export default function StockTab() {
  const router = useRouter();
  const {
    products,
    addProduct,
    updateProduct,
    replenishStock,
    getMovementsForProduct,
    getLowProducts,
  } = useProducts();
  const [view, setView] = useState<ViewType>("catalog");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [replenishTarget, setReplenishTarget] = useState<Product | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Product | null>(null);
  const [replenishQty, setReplenishQty] = useState("");

  const alertProducts = getLowProducts();

  if (view === "add-edit") {
    return (
      <AddEditProduct
        product={editingProduct}
        onSave={(data) => {
          if (editingProduct) {
            updateProduct(editingProduct.id, data);
          } else {
            addProduct(data);
          }
          setView("catalog");
          setEditingProduct(null);
        }}
        onBack={() => {
          setView("catalog");
          setEditingProduct(null);
        }}
      />
    );
  }

  if (view === "replenish" && replenishTarget) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <PageHeader
          title="Reponer Stock"
          showBack
          onBack={() => {
            setView("catalog");
            setReplenishTarget(null);
            setReplenishQty("");
          }}
        />
        <View style={styles.form}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Producto</Text>
            <Text style={styles.infoValue}>{replenishTarget.name}</Text>
            <Text style={styles.infoSub}>
              Stock actual: {replenishTarget.stockCurrent} {replenishTarget.unit}
            </Text>
          </View>
          <View>
            <FieLabel>
              Cantidad a reponer ({replenishTarget.unit})
            </FieLabel>
            <FieInput
              keyboardType="number-pad"
              value={replenishQty}
              onChangeText={(t) => setReplenishQty(t.replace(/[^\d]/g, ""))}
              placeholder="0"
            />
          </View>
          <FieButton
            disabled={!replenishQty || parseInt(replenishQty) <= 0}
            onPress={() => {
              replenishStock(replenishTarget.id, parseInt(replenishQty));
              setView("catalog");
              setReplenishTarget(null);
              setReplenishQty("");
            }}
          >
            Confirmar Reposicion
          </FieButton>
        </View>
      </ScrollView>
    );
  }

  if (view === "history" && historyTarget) {
    const productMovements = getMovementsForProduct(historyTarget.id);
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <PageHeader
          title="Historial de Stock"
          showBack
          onBack={() => {
            setView("catalog");
            setHistoryTarget(null);
          }}
        />
        <View>
          <View style={styles.historyInfoCard}>
            <Text style={styles.historyInfoName}>{historyTarget.name}</Text>
            <Text style={styles.historyInfoStock}>
              Stock actual: {historyTarget.stockCurrent} {historyTarget.unit}
            </Text>
          </View>
          {productMovements.length === 0 ? (
            <Text style={styles.emptyText}>Sin movimientos registrados</Text>
          ) : (
            <View style={styles.card}>
              {productMovements.map((m) => (
                <View key={m.id} style={styles.movementItem}>
                  <View
                    style={[
                      styles.movementAccent,
                      {
                        backgroundColor:
                          m.quantityChange > 0 ? Colors.success : Colors.magenta,
                      },
                    ]}
                  />
                  <View style={styles.movementBody}>
                    <View>
                      <Text style={styles.movementReason}>{m.reason}</Text>
                      {m.referenceSaleId && (
                        <Text style={styles.movementRef}>
                          Ref: {m.referenceSaleId.slice(0, 8)}
                        </Text>
                      )}
                      <Text style={styles.movementDate}>
                        <ClientTime iso={m.createdAt} mode="datetime" />
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.movementQty,
                        {
                          color:
                            m.quantityChange > 0 ? Colors.success : Colors.danger,
                        },
                      ]}
                    >
                      {m.quantityChange > 0 ? "+" : ""}
                      {m.quantityChange} {historyTarget.unit}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <PageHeader
        title="Mis Productos"
        right={
          <TouchableOpacity
            onPress={() => {
              setEditingProduct(null);
              setView("add-edit");
            }}
            style={styles.addBtn}
          >
            <LinearGradient
              colors={Gradients.icon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addBtnGrad}
            >
              <Plus color="#fff" size={20} strokeWidth={2.75} />
            </LinearGradient>
          </TouchableOpacity>
        }
      />

      {alertProducts.length > 0 && (
        <View style={styles.alertBanner}>
          <TriangleAlert color={Colors.danger} size={20} strokeWidth={2.5} />
          <Text style={styles.alertBannerText}>
            {alertProducts.filter((p) => getStockStatus(p) === "critical").length > 0
              ? `${alertProducts.filter((p) => getStockStatus(p) === "critical").length} producto(s) con stock critico`
              : `${alertProducts.length} producto(s) con stock bajo`}
          </Text>
        </View>
      )}

      {alertProducts.filter((p) => getStockStatus(p) === "critical").length > 0 && (
        <View>
          <Text style={styles.criticalSectionTitle}>Stock Critico</Text>
          {alertProducts
            .filter((p) => getStockStatus(p) === "critical")
            .map((p) => (
              <View key={p.id} style={styles.criticalCard}>
                <View style={styles.criticalAccent} />
                <View style={styles.criticalBody}>
                  <Text style={styles.criticalName}>{p.name}</Text>
                  <Text style={styles.criticalCount}>
                    {p.stockCurrent} {p.unit} restantes
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setReplenishTarget(p);
                    setView("replenish");
                  }}
                  style={styles.criticalBtn}
                >
                  <LinearGradient
                    colors={Gradients.icon}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.criticalBtnGrad}
                  >
                    <Text style={styles.criticalBtnText}>Reponer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))}
        </View>
      )}

      <View>
        <Text style={styles.sectionTitle}>Catalogo</Text>

        {products.length === 0 && (
          <View style={styles.emptyState}>
            <Package color={Colors.mutedForeground} size={48} />
            <Text style={styles.emptyTitle}>Sin productos aun</Text>
            <TouchableOpacity
              onPress={() => {
                setEditingProduct(null);
                setView("add-edit");
              }}
            >
              <LinearGradient
                colors={Gradients.icon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addFirstBtnGrad}
              >
                <Text style={styles.addFirstBtnText}>
                  Agregar primer producto
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {products.map((p) => {
          const status = getStockStatus(p);
          const statusColor =
            status === "ok"
              ? Colors.success
              : status === "low"
                ? Colors.warning
                : Colors.danger;
          const statusLabel =
            status === "ok" ? "OK" : status === "low" ? "BAJO" : "CRITICO";
          return (
            <View key={p.id} style={styles.productCard}>
              <View style={styles.productAccent} />
              <View style={styles.productBody}>
                <View style={styles.productHeader}>
                  <View style={styles.productNameArea}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={styles.productMeta}>
                      {formatBs(p.price)} · {p.unit}
                    </Text>
                  </View>
                  <View style={styles.productStatus}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: statusColor },
                      ]}
                    />
                    <Text style={[styles.statusLabel, { color: statusColor }]}>
                      {statusLabel}
                    </Text>
                  </View>
                </View>

                <View style={styles.productStockRow}>
                  <View>
                    <Text style={styles.stockLabel}>Stock actual</Text>
                    <Text style={[styles.stockValue, { color: statusColor }]}>
                      {p.stockCurrent}
                    </Text>
                    <Text style={styles.stockUnit}>{p.unit}</Text>
                  </View>
                  <View style={styles.productActions}>
                    <TouchableOpacity
                      onPress={() => {
                        setReplenishTarget(p);
                        setView("replenish");
                      }}
                      style={styles.actionBtnSuccess}
                    >
                      <ArrowUpCircle color={Colors.success} size={14} />
                      <Text style={styles.actionBtnSuccessText}>Reponer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setHistoryTarget(p);
                        setView("history");
                      }}
                      style={styles.actionBtnNavy}
                    >
                      <History color={Colors.navy} size={14} />
                      <Text style={styles.actionBtnNavyText}>Historial</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.productFooter}>
                  <Text style={styles.alertThreshold}>
                    Alerta: &lt;{p.lowStockThreshold} {p.unit}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingProduct(p);
                      setView("add-edit");
                    }}
                  >
                    <Text style={styles.editBtn}>Editar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function AddEditProduct({
  product,
  onSave,
  onBack,
}: {
  product: Product | null;
  onSave: (data: Omit<Product, "id" | "createdAt">) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [stockInitial, setStockInitial] = useState(String(product?.stockInitial ?? ""));
  const [stockCurrent, setStockCurrent] = useState(String(product?.stockCurrent ?? ""));
  const [unit, setUnit] = useState<ProductUnit>(product?.unit ?? "unidades");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [threshold, setThreshold] = useState(String(product?.lowStockThreshold ?? "5"));

  const UNITS: ProductUnit[] = ["unidades", "kg", "porciones", "docenas"];

  const valid = name.trim() && parseFloat(price) >= 0 && parseInt(threshold) >= 0;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <PageHeader
        title={product ? "Editar Producto" : "Nuevo Producto"}
        showBack
        onBack={onBack}
      />
      <View style={styles.form}>
        <View>
          <FieLabel>Nombre del producto</FieLabel>
          <FieInput
            value={name}
            onChangeText={setName}
            placeholder="Ej. Almuerzo familiar"
          />
        </View>
        {!product && (
          <View>
            <FieLabel>Stock inicial</FieLabel>
            <FieInput
              keyboardType="number-pad"
              value={stockInitial}
              onChangeText={(t) => setStockInitial(t.replace(/[^\d]/g, ""))}
              placeholder="0"
            />
          </View>
        )}
        {product && (
          <View>
            <FieLabel>Stock actual</FieLabel>
            <FieInput
              keyboardType="number-pad"
              value={stockCurrent}
              onChangeText={(t) => setStockCurrent(t.replace(/[^\d]/g, ""))}
              placeholder="0"
            />
          </View>
        )}
        <View>
          <FieLabel>Unidad</FieLabel>
          <View style={styles.unitGrid}>
            {UNITS.map((u) => {
              const active = unit === u;
              return (
                <TouchableOpacity
                  key={u}
                  onPress={() => setUnit(u)}
                  style={[
                    styles.unitBtn,
                    active ? styles.unitBtnActive : styles.unitBtnInactive,
                  ]}
                >
                  {active ? (
                    <LinearGradient
                      colors={Gradients.icon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.unitBtnGrad}
                    >
                      <Text style={styles.unitBtnActiveText}>{u}</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.unitBtnInactiveText}>{u}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View>
          <FieLabel>Precio de venta (Bs.)</FieLabel>
          <FieInput
            keyboardType="decimal-pad"
            value={price}
            onChangeText={(t) => setPrice(t.replace(/[^\d.,]/g, ""))}
            placeholder="0.00"
          />
        </View>
        <View>
          <FieLabel>Alerta cuando queden (unidades)</FieLabel>
          <FieInput
            keyboardType="number-pad"
            value={threshold}
            onChangeText={(t) => setThreshold(t.replace(/[^\d]/g, ""))}
            placeholder="5"
          />
        </View>
        <FieButton
          disabled={!valid}
          onPress={() => {
            const initial = parseInt(stockInitial) || 0;
            const current = product ? parseInt(stockCurrent) || 0 : initial;
            onSave({
              name: name.trim(),
              stockInitial: initial,
              stockCurrent: current,
              unit,
              price: parseFloat(price.replace(",", ".")) || 0,
              lowStockThreshold: parseInt(threshold) || 5,
            });
          }}
        >
          Guardar Producto
        </FieButton>
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
  form: {
    paddingHorizontal: 20,
    gap: 20,
    paddingBottom: 24,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    ...Shadow.soft,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: Colors.magenta,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.navy,
    marginTop: 4,
  },
  infoSub: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  addBtnGrad: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  alertBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(233, 69, 96, 0.3)",
    backgroundColor: "#FFF0F3",
  },
  alertBannerText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.danger,
    flex: 1,
  },
  criticalSectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: Colors.danger,
    textTransform: "uppercase",
    marginBottom: 8,
    marginHorizontal: 20,
  },
  criticalCard: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(233, 69, 96, 0.4)",
    overflow: "hidden",
    marginBottom: 8,
    marginHorizontal: 20,
    alignItems: "center",
  },
  criticalAccent: {
    width: 6,
    backgroundColor: Colors.danger,
  },
  criticalBody: {
    flex: 1,
    padding: 12,
  },
  criticalName: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.navy,
  },
  criticalCount: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: Colors.danger,
    marginTop: 2,
  },
  criticalBtn: {
    marginRight: 12,
    borderRadius: 18,
    overflow: "hidden",
  },
  criticalBtnGrad: {
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  criticalBtnText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: Colors.navy,
    textTransform: "uppercase",
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.mutedForeground,
  },
  addFirstBtnGrad: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addFirstBtnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  productCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 12,
    ...Shadow.soft,
  },
  productAccent: {
    width: 6,
    backgroundColor: Colors.magenta,
  },
  productBody: {
    flex: 1,
    padding: 16,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  productNameArea: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.navy,
  },
  productMeta: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: Colors.mutedForeground,
    marginTop: 4,
  },
  productStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  productStockRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  stockLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: Colors.mutedForeground,
  },
  stockValue: {
    fontSize: 30,
    fontWeight: "800",
  },
  stockUnit: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.mutedForeground,
  },
  productActions: {
    gap: 6,
  },
  actionBtnSuccess: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(31, 182, 107, 0.4)",
  },
  actionBtnSuccessText: {
    color: Colors.success,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  actionBtnNavy: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(27, 58, 107, 0.4)",
  },
  actionBtnNavyText: {
    color: Colors.navy,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  alertThreshold: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.mutedForeground,
  },
  editBtn: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.magenta,
  },
  unitGrid: {
    flexDirection: "row",
    gap: 8,
  },
  unitBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
  },
  unitBtnActive: {
    borderColor: "transparent",
  },
  unitBtnInactive: {
    borderColor: "rgba(27,58,107,0.6)",
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  unitBtnGrad: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  unitBtnActiveText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  unitBtnInactiveText: {
    color: Colors.navy,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    marginHorizontal: 20,
    ...Shadow.soft,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.mutedForeground,
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 32,
  },
  historyInfoCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 16,
    marginHorizontal: 20,
    marginTop: 8,
    ...Shadow.soft,
  },
  historyInfoName: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.magenta,
  },
  historyInfoStock: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.navy,
    marginTop: 2,
  },
  movementItem: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  movementAccent: {
    width: 6,
  },
  movementBody: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    gap: 12,
  },
  movementReason: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.navy,
    textTransform: "capitalize",
  },
  movementRef: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.mutedForeground,
  },
  movementDate: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  movementQty: {
    fontSize: 16,
    fontWeight: "800",
  },
});
