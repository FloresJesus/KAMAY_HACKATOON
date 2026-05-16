import { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  history: string[];
};

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Almuerzo familiar",
    category: "Comida",
    price: 35,
    stock: 20,
    minStock: 5,
    unit: "porciones",
    history: ["Producto creado con 20 porciones"],
  },
  {
    id: 2,
    name: "Arroz 5kg",
    category: "Abarrotes",
    price: 45,
    stock: 3,
    minStock: 5,
    unit: "unidades",
    history: ["Stock inicial: 3 unidades"],
  },
  {
    id: 3,
    name: "Refresco",
    category: "Bebidas",
    price: 7,
    stock: 0,
    minStock: 5,
    unit: "unidades",
    history: ["Stock inicial: 0 unidades"],
  },
];

export default function StockScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    minStock: "",
    unit: "",
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const criticalProducts = products.filter((p) => p.stock === 0);

  const getStatus = (product: Product) => {
    if (product.stock === 0) return { label: "CRÍTICO", color: "#ef4444" };
    if (product.stock <= product.minStock) return { label: "BAJO", color: "#f59e0b" };
    return { label: "OK", color: "#16a34a" };
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      category: "",
      price: "",
      stock: "",
      minStock: "5",
      unit: "unidades",
    });
    setModalVisible(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      minStock: String(product.minStock),
      unit: product.unit,
    });
    setModalVisible(true);
  };

  const saveProduct = () => {
    if (!form.name || !form.price || !form.stock) {
      Alert.alert("Datos incompletos", "Completa nombre, precio y stock.");
      return;
    }

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: form.name,
                category: form.category,
                price: Number(form.price),
                stock: Number(form.stock),
                minStock: Number(form.minStock),
                unit: form.unit,
                history: [
                  `Editado: stock actualizado a ${form.stock} ${form.unit}`,
                  ...p.history,
                ],
              }
            : p
        )
      );
    } else {
      const newProduct: Product = {
        id: Date.now(),
        name: form.name,
        category: form.category || "General",
        price: Number(form.price),
        stock: Number(form.stock),
        minStock: Number(form.minStock),
        unit: form.unit || "unidades",
        history: [`Producto creado con ${form.stock} ${form.unit || "unidades"}`],
      };
      setProducts((prev) => [newProduct, ...prev]);
    }

    setModalVisible(false);
  };

  const restockProduct = (product: Product) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
              ...p,
              stock: p.stock + 10,
              history: [`Reposición: +10 ${p.unit}`, ...p.history],
            }
          : p
      )
    );
  };

  const showHistory = (product: Product) => {
    Alert.alert(product.name, product.history.join("\n"));
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={[styles.wrapper, isWide && styles.wrapperWide]}>
        <View style={styles.header}>
          <Text style={styles.title}>MIS PRODUCTOS</Text>
          <TouchableOpacity style={styles.addButton} onPress={openNewProduct}>
            <Text style={styles.addText}>+</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Buscar producto..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
          placeholderTextColor="#94a3b8"
        />

        <View style={styles.alertBox}>
          <Text style={styles.alertText}>
            ⚠ {criticalProducts.length} PRODUCTO(S) CON STOCK CRÍTICO
          </Text>
        </View>

        {criticalProducts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>STOCK CRÍTICO</Text>
            {criticalProducts.map((product) => (
              <View key={product.id} style={styles.criticalCard}>
                <View>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.criticalText}>
                    {product.stock} {product.unit.toUpperCase()} RESTANTES
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.restockButtonDark}
                  onPress={() => restockProduct(product)}
                >
                  <Text style={styles.restockTextDark}>REPONER</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>CATÁLOGO</Text>

        <View style={isWide ? styles.grid : undefined}>
          {filteredProducts.map((product) => {
            const status = getStatus(product);

            return (
              <View key={product.id} style={[styles.card, isWide && styles.cardWide]}>
                <View style={styles.leftBar} />

                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.price}>
                        Bs {product.price.toFixed(2)} · {product.category.toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.statusRow}>
                      <View
                        style={[styles.statusDot, { backgroundColor: status.color }]}
                      />
                      <Text style={[styles.statusText, { color: status.color }]}>
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.stockLabel}>STOCK ACTUAL</Text>
                  <Text style={[styles.stockNumber, { color: status.color }]}>
                    {product.stock}
                  </Text>
                  <Text style={styles.unit}>{product.unit}</Text>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.outlineButton}
                      onPress={() => restockProduct(product)}
                    >
                      <Text style={styles.outlineButtonText}>⊕ REPONER</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.historyButton}
                      onPress={() => showHistory(product)}
                    >
                      <Text style={styles.historyButtonText}>↺ HISTORIAL</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.footer}>
                    <Text style={styles.alertSmall}>
                      Alerta: &lt;{product.minStock} {product.unit}
                    </Text>
                    <TouchableOpacity onPress={() => openEditProduct(product)}>
                      <Text style={styles.editText}>EDITAR</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editingProduct ? "Editar producto" : "Nuevo producto"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Categoría"
              value={form.category}
              onChangeText={(text) => setForm({ ...form, category: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Precio"
              keyboardType="numeric"
              value={form.price}
              onChangeText={(text) => setForm({ ...form, price: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Stock"
              keyboardType="numeric"
              value={form.stock}
              onChangeText={(text) => setForm({ ...form, stock: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Stock mínimo"
              keyboardType="numeric"
              value={form.minStock}
              onChangeText={(text) => setForm({ ...form, minStock: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Unidad"
              value={form.unit}
              onChangeText={(text) => setForm({ ...form, unit: text })}
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveProduct}>
              <Text style={styles.saveText}>GUARDAR</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f4f5f9",
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  wrapper: {
    width: "100%",
  },
  wrapperWide: {
    maxWidth: 1000,
    alignSelf: "center",
  },
  header: {
    marginTop: 10,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#172554",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
  },
  addButton: {
    position: "absolute",
    right: 0,
    top: -4,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#8b1c7c",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  addText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  search: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "web" ? 12 : 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    color: "#172554",
    fontWeight: "700",
  },
  alertBox: {
    borderWidth: 1,
    borderColor: "#fb7185",
    backgroundColor: "#fff1f2",
    borderRadius: 24,
    padding: 14,
    marginBottom: 16,
  },
  alertText: {
    color: "#e11d48",
    fontSize: 11,
    fontWeight: "900",
  },
  sectionTitle: {
    color: "#e11d8f",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  criticalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#fb7185",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productName: {
    color: "#172554",
    fontSize: 14,
    fontWeight: "900",
  },
  criticalText: {
    color: "#e11d48",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 4,
  },
  restockButtonDark: {
    backgroundColor: "#5b2a6f",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  restockTextDark: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 18,
    overflow: "hidden",
    flexDirection: "row",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardWide: {
    width: "48%",
    marginBottom: 0,
  },
  leftBar: {
    width: 6,
    backgroundColor: "#ec1aa6",
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  price: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "900",
  },
  stockLabel: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 18,
  },
  stockNumber: {
    fontSize: 32,
    fontWeight: "900",
    marginTop: 2,
  },
  unit: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
  },
  actions: {
    position: "absolute",
    right: 14,
    top: 64,
    gap: 8,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#22c55e",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  outlineButtonText: {
    color: "#16a34a",
    fontSize: 10,
    fontWeight: "900",
  },
  historyButton: {
    borderWidth: 1,
    borderColor: "#1e3a8a",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  historyButtonText: {
    color: "#1e3a8a",
    fontSize: 10,
    fontWeight: "900",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 14,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  alertSmall: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "600",
  },
  editText: {
    color: "#e11d8f",
    fontSize: 10,
    fontWeight: "900",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  modalTitle: {
    color: "#172554",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 14,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    color: "#172554",
  },
  saveButton: {
    backgroundColor: "#8b1c7c",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveText: {
    color: "#fff",
    fontWeight: "900",
  },
  cancelText: {
    textAlign: "center",
    color: "#64748b",
    fontWeight: "800",
    marginTop: 14,
  },
});