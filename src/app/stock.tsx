import { PageHeader } from "@/components/tinka/AppShell";
import { Colors, Gradients } from "@/constants/colors";
import { useProducts } from "@/lib/product-store";
import { LinearGradient } from "expo-linear-gradient";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";

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
});