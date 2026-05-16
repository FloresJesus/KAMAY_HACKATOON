import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const products = [
  {
    name: "Almuerzo familiar",
    price: "Bs 35,00 · PORCIONES",
    stock: 20,
    unit: "porciones",
    status: "OK",
    color: "#18b26b",
  },
  {
    name: "Arroz 5kg",
    price: "Bs 45,00 · UNIDADES",
    stock: 3,
    unit: "unidades",
    status: "BAJO",
    color: "#f59e0b",
  },
  {
    name: "Refresco",
    price: "Bs 7,00 · UNIDADES",
    stock: 0,
    unit: "unidades",
    status: "CRÍTICO",
    color: "#ef4444",
  },
];

export default function StockScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>MIS PRODUCTOS</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.alertBox}>
        <Text style={styles.alertText}>⚠ 1 PRODUCTO(S) CON STOCK CRÍTICO</Text>
      </View>

      <Text style={styles.sectionTitle}>STOCK CRÍTICO</Text>

      <View style={styles.criticalCard}>
        <View>
          <Text style={styles.productName}>Refresco</Text>
          <Text style={styles.criticalText}>0 UNIDADES RESTANTES</Text>
        </View>

        <TouchableOpacity style={styles.restockButtonDark}>
          <Text style={styles.restockTextDark}>REPONER</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>CATÁLOGO</Text>

      {products.map((item, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.leftBar} />

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.price}>{item.price}</Text>
              </View>

              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: item.color }]} />
                <Text style={[styles.statusText, { color: item.color }]}>
                  {item.status}
                </Text>
              </View>
            </View>

            <Text style={styles.stockLabel}>STOCK ACTUAL</Text>
            <Text style={[styles.stockNumber, { color: item.color }]}>
              {item.stock}
            </Text>
            <Text style={styles.unit}>{item.unit}</Text>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.outlineButton}>
                <Text style={styles.outlineButtonText}>⊕ REPONER</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.historyButton}>
                <Text style={styles.historyButtonText}>↺ HISTORIAL</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.alertSmall}>Alerta: &lt;5 unidades</Text>
              <Text style={styles.editText}>EDITAR</Text>
            </View>
          </View>
        </View>
      ))}
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
});