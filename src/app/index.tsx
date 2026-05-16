import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ChevronRight,
  Lightbulb,
  Plus,
  Power,
} from "lucide-react-native";
import { useResponsive } from "../hooks/use-responsive";

export default function HomeScreen() {
  const { isMobile, isDesktop } = useResponsive();
  const horizontalMargin = isMobile ? 22 : 32;

  const movimientos = [
    {
      id: 1,
      nombre: "Almuerzo familiar",
      detalle: "EFECTIVO · TIENDA · 16-MAY, 10:05 A. M.",
      monto: "+Bs 35,00",
      categoria: "ALIMENTOS",
    },
    {
      id: 2,
      nombre: "Refresco x2",
      detalle: "QR · TIENDA · 16-MAY, 09:00 A. M.",
      monto: "+Bs 14,00",
      categoria: "ALIMENTOS",
    },
    {
      id: 3,
      nombre: "Manualidad bordada",
      detalle: "QR · FERIA · 16-MAY, 07:30 A. M.",
      monto: "+Bs 80,00",
      categoria: "ARTESANÍA",
    },
    {
      id: 4,
      nombre: "Arroz 5kg",
      detalle: "EFECTIVO · TIENDA · 15-MAY, 12:20 P. M.",
      monto: "+Bs 45,00",
      categoria: "ABARROTES",
    },
    {
      id: 5,
      nombre: "Corte de cabello",
      detalle: "EFECTIVO · TIENDA · 14-MAY, 02:05 P. M.",
      monto: "+Bs 25,00",
      categoria: "BELLEZA",
    },
    {
      id: 6,
      nombre: "Reparación celular",
      detalle: "TRANSFERENCIA · TIENDA · 13-MAY, 08:00 A. M.",
      monto: "+Bs 120,00",
      categoria: "SERVICIOS",
    }
  ];

  return (
    <View style={styles.screenWrapper}>
      <View style={[styles.container, { maxWidth: isDesktop ? 640 : "100%" }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 30,
          }}
        >
          <View style={[styles.header, { paddingHorizontal: horizontalMargin }]}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              MI NEGOCIO
            </Text>

            <TouchableOpacity style={styles.powerButton}>
              <Power size={22} color="#FF1E8E" />
            </TouchableOpacity>
          </View>

          <View style={[styles.mainCard, { marginHorizontal: horizontalMargin }]}>
            <View style={styles.mainBar} />

            <View style={styles.mainContent}>
              <Text style={styles.smallPink}>MI NEGOCIO</Text>

              <Text style={styles.businessName} numberOfLines={1}>
                Emprendimiento Tinka
              </Text>

              <Text style={styles.salesLabel}>VENTAS DE HOY</Text>

              <Text style={styles.salesAmount}>Bs 129,00</Text>
            </View>
          </View>

          <View style={[styles.row, { marginHorizontal: horizontalMargin }]}>
            <View style={styles.smallCard}>
              <Text style={styles.smallLabel}>ABONOS</Text>
              <Text style={styles.greenText}>+Bs 129,00</Text>
            </View>

            <View style={styles.smallCard}>
              <Text style={styles.smallLabel}>GASTOS</Text>
              <Text style={styles.redText}>-Bs 0,00</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.reportButton, { marginHorizontal: horizontalMargin }]}>
            <Text style={styles.reportText} numberOfLines={1}>
              VER REPORTES COMPLETOS
            </Text>
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.newSaleCard, { marginHorizontal: horizontalMargin }]}>
            <View style={styles.newSaleLeft}>
              <View style={styles.plusCircle}>
                <Plus size={22} color="#fff" />
              </View>

              <View style={styles.flexShrink}>
                <Text style={styles.newSaleTitle} numberOfLines={1}>
                  REGISTRAR VENTA
                </Text>
                <Text style={styles.newSaleSubtitle} numberOfLines={1}>
                  En segundos, sin papeles
                </Text>
              </View>
            </View>

            <ChevronRight size={20} color="#1B3A6B" />
          </TouchableOpacity>

          <View style={[styles.insightCard, { marginHorizontal: horizontalMargin }]}>
            <View style={styles.insightIcon}>
              <Lightbulb size={20} color="#fff" />
            </View>

            <View style={styles.flex1}>
              <Text style={styles.insightLabel}>INSIGHT DE LA SEMANA</Text>
              <Text style={styles.insightTitle} numberOfLines={1}>
                Tu mejor día fue el Sábado 💡
              </Text>
              <Text style={styles.insightText}>
                Asegura stock y prepara ofertas ese día.
              </Text>
            </View>
          </View>

          <View style={[styles.movementsSection, { marginHorizontal: horizontalMargin }]}>
            <View style={styles.movementsHeader}>
              <Text style={styles.movementsTitle}>ÚLTIMOS MOVIMIENTOS</Text>

              <TouchableOpacity>
                <Text style={styles.viewAll}>VER TODO</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.movementsBox}>
              {movimientos.map((item) => (
                <View key={item.id} style={styles.movementItem}>
                  <View style={styles.leftPinkBar} />

                  <View style={styles.movementContent}>
                    <View style={styles.greenDot} />

                    <View style={styles.itemTextContainer}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {item.nombre}
                      </Text>
                      <Text style={styles.itemDetail} numberOfLines={1}>
                        {item.detalle}
                      </Text>
                    </View>

                    <View style={styles.rightAmountContainer}>
                      <Text style={styles.amount} numberOfLines={1}>
                        {item.monto}
                      </Text>
                      <Text style={styles.category} numberOfLines={1}>
                        {item.categoria}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: "#F4F4F6",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  container: {
    flex: 1,
    backgroundColor: "#F4F4F6",
    width: "100%",
  },

  header: {
    paddingTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#1F3C77",
    marginLeft: 22,
  },

  powerButton: {
    padding: 4,
  },

  mainCard: {
    marginTop: 24,
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  mainBar: {
    width: 8,
    backgroundColor: "#FF1E8E",
  },

  mainContent: {
    padding: 18,
    flex: 1,
  },

  smallPink: {
    fontSize: 11,
    color: "#FF1E8E",
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  businessName: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "800",
    color: "#1F3C77",
  },

  salesLabel: {
    marginTop: 14,
    fontSize: 11,
    color: "#8A8EA5",
    fontWeight: "800",
  },

  salesAmount: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "900",
    color: "#1F3C77",
  },

  row: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },

  smallCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  smallLabel: {
    fontSize: 11,
    color: "#8A8EA5",
    fontWeight: "800",
    letterSpacing: 1,
  },

  greenText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "900",
    color: "#20B56C",
  },

  redText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "900",
    color: "#FF4C68",
  },

  reportButton: {
    marginTop: 18,
    height: 54,
    borderRadius: 999,
    backgroundColor: "#C2188B",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  reportText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
    marginRight: 8,
  },

  newSaleCard: {
    marginTop: 18,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#FF9ACD",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  newSaleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },

  plusCircle: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#A31C8E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  newSaleTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1F3C77",
  },

  newSaleSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#6F768D",
  },

  insightCard: {
    marginTop: 18,
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    backgroundColor: "#C2188B",
  },

  insightIcon: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  insightLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "800",
    letterSpacing: 1,
  },

  insightTitle: {
    marginTop: 4,
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },

  insightText: {
    marginTop: 4,
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "600",
  },

  movementsSection: {
    marginTop: 24,
  },

  movementsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  movementsTitle: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: "#1F3C77",
  },

  viewAll: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FF1E8E",
  },

  movementsBox: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
  },

  movementItem: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E7E7EE",
  },

  leftPinkBar: {
    width: 6,
    backgroundColor: "#FF1E8E",
  },

  movementContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#20B56C",
  },

  itemTextContainer: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 10,
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F3C77",
  },

  itemDetail: {
    marginTop: 4,
    fontSize: 11,
    color: "#8A8EA5",
    fontWeight: "700",
  },

  rightAmountContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
  },

  amount: {
    fontSize: 14,
    fontWeight: "900",
    color: "#20B56C",
    textAlign: "right",
  },

  category: {
    marginTop: 4,
    fontSize: 11,
    color: "#8A8EA5",
    fontWeight: "800",
    textAlign: "right",
  },

  flex1: {
    flex: 1,
  },

  flexShrink: {
    flex: 1,
    flexShrink: 1,
  },
});
