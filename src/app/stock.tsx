import { PageHeader } from "@/components/tinka/AppShell";
import { useProducts } from "@/lib/product-store";
import { LinearGradient } from "expo-linear-gradient";
import { Package, Plus } from "lucide-react-native";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Colors = {
  background: "#F8FAFC",
  navy: "#1B3A6B",
  magenta: "#E94560",
  mutedForeground: "#64748B",
  card: "#FFFFFF",
  border: "#E2E8F0",
};

const Gradients = {
  icon: ["#1B3A6B", "#E94560"] as const,
};

type ViewType = "catalog" | "add-edit" | "replenish" | "history";

export default function StockTab() {
  const {
    products,
    addProduct,
    updateProduct,
    replenishStock,
    getMovementsForProduct,
    getLowProducts,
  } = useProducts();

  const [view, setView] = useState<ViewType>("catalog");
  const [editingProduct, setEditingProduct] = useState(null);
  const [replenishTarget, setReplenishTarget] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [replenishQty, setReplenishQty] = useState("");

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

      <View>
        <Text style={styles.sectionTitle}>Catalogo</Text>

        {products.length === 0 && (
          <View style={styles.emptyState}>
            <Package color={Colors.mutedForeground} size={48} />
            <Text style={styles.emptyTitle}>Sin productos aun</Text>
          </View>
        )}

        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productAccent} />
            <View style={styles.productBody}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productMeta}>
                Stock: {product.stockCurrent} {product.unit}
              </Text>
              <Text style={styles.productMeta}>
                Precio: Bs. {product.price}
              </Text>
            </View>
          </View>
        ))}
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
  productCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 12,
  },
  productAccent: {
    width: 6,
    backgroundColor: Colors.magenta,
  },
  productBody: {
    flex: 1,
    padding: 16,
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
});