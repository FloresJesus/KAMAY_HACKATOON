import { useState, useMemo } from "react";
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View as RnView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  MapPin,
  Package,
  Check,
  ChevronRight,
  Share2,
  Archive,
  Lock,
  BoxSelect,
} from "lucide-react-native";
import {
  useCasilleros,
  LOCATIONS,
  getSlotsForLocation,
  getSlotSize,
  type CasilleroLocation,
  type CasilleroSize,
  type CasilleroReservation,
} from "@/lib/casillero-store";
import { useProducts } from "@/lib/product-store";
import { Colors, Gradients, Shadow } from "@/constants/colors";
import {
  PageHeader,
  FieLabel,
  FieButton,
  ClientTime,
  StepHeader,
  Row,
} from "@/components/tinka/AppShell";
import { useRouter } from "expo-router";

type ViewType2 =
  | "hub"
  | "reserve-step1"
  | "reserve-step2"
  | "reserve-step3"
  | "reserve-step4"
  | "mis-reservas";

export default function CasillerosHub() {
  const router = useRouter();
  const { reservations, activeReservations, addReservation, markRecogido } = useCasilleros();
  const { products, deductStock } = useProducts();

  const [view, setView] = useState<ViewType2>("hub");
  const [selectedLocation, setSelectedLocation] = useState<CasilleroLocation | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [pin, setPin] = useState("");
  const [expiry, setExpiry] = useState<24 | 48 | 72>(24);
  const [confirmedReservation, setConfirmedReservation] = useState<CasilleroReservation | null>(null);

  const slots = useMemo(
    () => (selectedLocation ? getSlotsForLocation(selectedLocation, reservations) : []),
    [selectedLocation, reservations]
  );

  const resetWizard = () => {
    setSelectedLocation(null);
    setSelectedSlot(null);
    setSelectedProductId("");
    setPin("");
    setExpiry(24);
    setConfirmedReservation(null);
  };

  if (view === "mis-reservas") {
    return (
      <MisReservas
        reservations={reservations}
        onBack={() => setView("hub")}
        onMarkRecogido={(id) => markRecogido(id)}
      />
    );
  }

  if (view === "reserve-step4" && confirmedReservation) {
    const expiresDate = new Date(confirmedReservation.expiresAt);
    const whatsappMsg = encodeURIComponent(
      `Hola! Tu pedido está listo en el Casillero Tinka N°${confirmedReservation.casilleroNumber} en Espacio Creativo Tinka ${confirmedReservation.location}. Tu código de acceso es: ${confirmedReservation.accessPin}. Válido hasta ${expiresDate.toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" })}. ¡Gracias por tu compra!`
    );

    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.confirmContent}>
        <PageHeader title="Confirmacion" />
        <RnView style={styles.confirmInner}>
          <LinearGradient
            colors={Gradients.icon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.confirmIcon}
          >
            <Check color="#fff" size={48} strokeWidth={3} />
          </LinearGradient>
          <Text style={styles.confirmTitle}>
            Casillero Reservado con Exito
          </Text>
          <RnView style={styles.confirmCard}>
            <Row
              label="Ubicación"
              value={`Espacio Creativo Tinka ${confirmedReservation.location}`}
            />
            <Row label="Casillero N°" value={String(confirmedReservation.casilleroNumber)} />
            <Row label="Tamaño" value={confirmedReservation.size} />
            <Row label="Código de acceso" value="●●●●" />
            <Row
              label="Válido hasta"
              value={expiresDate.toLocaleDateString("es-BO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          </RnView>
          <RnView style={styles.confirmActions}>
            <TouchableOpacity
              onPress={() => Linking.openURL(`https://wa.me/?text=${whatsappMsg}`)}
              style={styles.whatsappBtn}
            >
              <LinearGradient
                colors={Gradients.icon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.whatsappBtnGrad}
              >
                <Share2 color="#fff" size={20} />
                <Text style={styles.whatsappBtnText}>Compartir con Cliente</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                resetWizard();
                setView("mis-reservas");
              }}
              style={styles.outlineBtn}
            >
              <Text style={styles.outlineBtnText}>Ver Mis Reservas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                resetWizard();
                setView("hub");
              }}
            >
              <Text style={styles.backLink}>Volver al inicio de Casilleros</Text>
            </TouchableOpacity>
          </RnView>
        </RnView>
      </ScrollView>
    );
  }

  if (view === "reserve-step3") {
    const slotSize: CasilleroSize = selectedSlot ? getSlotSize(selectedSlot) : "MEDIANO";
    const validPin = /^\d{4}$/.test(pin);

    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.formContent}>
        <StepHeader
          step={3}
          total={4}
          title="Configurar Entrega"
          onBack={() => setView("reserve-step2")}
        />
        <RnView style={styles.form}>
          <RnView>
            <FieLabel>Producto del catálogo</FieLabel>
            {products.length === 0 && (
              <Text style={styles.noProductsText}>
                Sin productos en catálogo. Ve a Stock para agregar.
              </Text>
            )}
            <RnView style={styles.productList}>
              {products.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setSelectedProductId(p.id)}
                  style={[
                    styles.productItem,
                    selectedProductId === p.id && styles.productItemActive,
                  ]}
                >
                  <RnView>
                    <Text
                      style={[
                        styles.productItemName,
                        selectedProductId === p.id && { color: Colors.magenta },
                      ]}
                    >
                      {p.name}
                    </Text>
                    <Text style={styles.productItemStock}>
                      Stock: {p.stockCurrent} {p.unit}
                    </Text>
                  </RnView>
                  {selectedProductId === p.id && (
                    <Check color={Colors.magenta} size={16} />
                  )}
                </TouchableOpacity>
              ))}
            </RnView>
          </RnView>

          <RnView>
            <FieLabel>Código de acceso (4 dígitos)</FieLabel>
            <TextInput
              keyboardType="number-pad"
              maxLength={4}
              value={pin}
              onChangeText={(t) => setPin(t.replace(/\D/g, "").slice(0, 4))}
              placeholder="0000"
              placeholderTextColor="rgba(27, 58, 107, 0.4)"
              style={styles.pinInput}
            />
          </RnView>

          <RnView>
            <FieLabel>Tiempo de expiración</FieLabel>
            <RnView style={styles.expiryRow}>
              {([24, 48, 72] as const).map((h) => {
                const active = expiry === h;
                return (
                  <TouchableOpacity
                    key={h}
                    onPress={() => setExpiry(h)}
                    style={[
                      styles.expiryBtn,
                      active ? styles.expiryBtnActive : styles.expiryBtnInactive,
                    ]}
                  >
                    {active ? (
                      <LinearGradient
                        colors={Gradients.icon}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.expiryBtnGrad}
                      >
                        <Text style={styles.expiryBtnActiveText}>{h}hs</Text>
                      </LinearGradient>
                    ) : (
                      <Text style={styles.expiryBtnInactiveText}>{h}hs</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </RnView>
          </RnView>

          <FieButton
            disabled={!validPin || (!selectedProductId && products.length > 0)}
            onPress={() => {
              if (!selectedLocation || !selectedSlot) return;
              const expiresAt = new Date(Date.now() + expiry * 3600 * 1000).toISOString();
              const prod = products.find((p) => p.id === selectedProductId);
              const newR = addReservation({
                productId: selectedProductId,
                productName: prod?.name ?? "Producto",
                location: selectedLocation,
                casilleroNumber: selectedSlot,
                size: slotSize,
                accessPin: pin,
                expiresAt,
                status: "activo",
              });
              setConfirmedReservation(newR);
              setView("reserve-step4");
            }}
          >
            Confirmar Reserva
          </FieButton>
        </RnView>
      </ScrollView>
    );
  }

  if (view === "reserve-step2") {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.formContent}>
        <StepHeader
          step={2}
          total={4}
          title="Seleccionar Casillero"
          onBack={() => setView("reserve-step1")}
        />
        <RnView style={styles.form}>
          <Text style={styles.locationName}>
            {selectedLocation ? `Espacio Creativo Tinka ${selectedLocation}` : ""}
          </Text>

          <RnView style={styles.legendRow}>
            {[
              { color: Colors.success, label: "Disponible" },
              { color: Colors.danger, label: "Ocupado" },
              { color: Colors.warning, label: "Reservado" },
            ].map((l) => (
              <RnView key={l.label} style={styles.legendItem}>
                <RnView style={[styles.legendSquare, { backgroundColor: l.color }]} />
                <Text style={styles.legendLabel}>{l.label}</Text>
              </RnView>
            ))}
          </RnView>

          <RnView style={styles.slotsGrid}>
            {slots.map((slot) => {
              const isAvailable = slot.status === "disponible";
              const isSelected = selectedSlot === slot.number;
              const bg = isAvailable
                ? isSelected
                  ? Colors.navy
                  : "#E8F8EF"
                : slot.status === "ocupado"
                  ? "#FFF0F3"
                  : "#FFF8EC";
              const border = isAvailable
                ? isSelected
                  ? Colors.navy
                  : Colors.success
                : slot.status === "ocupado"
                  ? Colors.danger
                  : Colors.warning;
              const textColor = isAvailable
                ? isSelected
                  ? "#fff"
                  : Colors.navy
                : slot.status === "ocupado"
                  ? Colors.danger
                  : Colors.warning;
              const size = getSlotSize(slot.number);
              return (
                <TouchableOpacity
                  key={slot.number}
                  disabled={!isAvailable}
                  onPress={() => setSelectedSlot(slot.number)}
                  style={[styles.slotBtn, { backgroundColor: bg, borderColor: border }]}
                >
                  <Text style={[styles.slotNumber, { color: textColor }]}>
                    {String(slot.number).padStart(2, "0")}
                  </Text>
                  <Text style={[styles.slotSize, { color: textColor }]}>{size}</Text>
                </TouchableOpacity>
              );
            })}
          </RnView>

          <RnView style={styles.continueBtn}>
            <FieButton
              disabled={!selectedSlot}
              onPress={() => setView("reserve-step3")}
            >
              Continuar
            </FieButton>
          </RnView>
        </RnView>
      </ScrollView>
    );
  }

  if (view === "reserve-step1") {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.formContent}>
        <StepHeader
          step={1}
          total={4}
          title="Seleccionar Ubicacion"
          onBack={() => {
            resetWizard();
            setView("hub");
          }}
        />
        <RnView style={styles.form}>
          {LOCATIONS.map((loc) => (
            <TouchableOpacity
              key={loc.id}
              onPress={() => {
                setSelectedLocation(loc.id);
                setView("reserve-step2");
              }}
              style={[
                styles.locationCard,
                selectedLocation === loc.id && styles.locationCardActive,
              ]}
            >
              <LinearGradient
                colors={Gradients.icon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.locationIcon}
              >
                <MapPin color="#fff" size={24} strokeWidth={2.25} />
              </LinearGradient>
              <RnView style={styles.locationInfo}>
                <Text style={styles.locationAddress}>{loc.address}</Text>
                <Text style={styles.locationCity}>{loc.id}, Bolivia</Text>
              </RnView>
              <ChevronRight color={Colors.navy} size={20} />
            </TouchableOpacity>
          ))}
        </RnView>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <PageHeader
        title="Casilleros Tinka"
        showBack
        onBack={() => (router as any).push("/mas")}
      />

      <RnView style={styles.brandCard}>
        <LinearGradient
          colors={Gradients.icon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.brandCardTop}
        />
        <RnView style={styles.brandCardBody}>
          <Text style={styles.brandTag}>Casilleros Tinka</Text>
          <Text style={styles.brandTitle}>Entrega rapida y segura</Text>
          <Text style={styles.brandDesc}>
            Entrega tus productos de forma rapida y segura en los espacios Tinka.
          </Text>
        </RnView>
      </RnView>

      {activeReservations.length > 0 && (
        <RnView style={styles.activeSection}>
          <RnView style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Reservas activas</Text>
            <TouchableOpacity onPress={() => setView("mis-reservas")}>
              <Text style={styles.sectionLink}>Ver todas</Text>
            </TouchableOpacity>
          </RnView>
          <RnView style={styles.card}>
            {activeReservations.slice(0, 2).map((r) => (
              <RnView key={r.id} style={styles.activeItem}>
                <RnView style={styles.activeAccent} />
                <RnView style={styles.activeBody}>
                  <Text style={styles.activeName}>
                    Casillero N°{r.casilleroNumber} — {r.location}
                  </Text>
                  <Text style={styles.activeProduct}>{r.productName}</Text>
                </RnView>
                <RnView style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ACTIVO</Text>
                </RnView>
              </RnView>
            ))}
          </RnView>
        </RnView>
      )}

      <RnView style={styles.actions}>
        <FieButton onPress={() => setView("reserve-step1")}>
          Reservar Nuevo Casillero
        </FieButton>
        <TouchableOpacity
          onPress={() => setView("mis-reservas")}
          style={styles.archiveBtn}
        >
          <Archive color={Colors.navy} size={20} />
          <Text style={styles.archiveBtnText}>Mis Reservas</Text>
        </TouchableOpacity>
      </RnView>
    </ScrollView>
  );
}

function MisReservas({
  reservations,
  onBack,
  onMarkRecogido,
}: {
  reservations: CasilleroReservation[];
  onBack: () => void;
  onMarkRecogido: (id: string) => void;
}) {
  const active = reservations.filter((r) => r.status === "activo");
  const past = reservations.filter((r) => r.status !== "activo");

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <PageHeader title="Mis Reservas" showBack onBack={onBack} />

      <RnView style={styles.reservasList}>
        {reservations.length === 0 && (
          <RnView style={styles.emptyReservas}>
            <BoxSelect color={Colors.mutedForeground} size={48} />
            <Text style={styles.emptyReservasText}>Sin reservas aun</Text>
          </RnView>
        )}

        {active.length > 0 && (
          <>
            <Text style={styles.reservasSectionTitle}>Activas</Text>
            {active.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                onMarkRecogido={onMarkRecogido}
              />
            ))}
          </>
        )}

        {past.length > 0 && (
          <>
            <Text style={styles.reservasSectionTitlePast}>Historial</Text>
            {past.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                onMarkRecogido={onMarkRecogido}
              />
            ))}
          </>
        )}
      </RnView>
    </ScrollView>
  );
}

function ReservationCard({
  reservation: r,
  onMarkRecogido,
}: {
  reservation: CasilleroReservation;
  onMarkRecogido: (id: string) => void;
}) {
  const statusColor =
    r.status === "activo"
      ? Colors.success
      : r.status === "recogido"
        ? Colors.navy
        : Colors.mutedForeground;
  const statusBg =
    r.status === "activo"
      ? "#E8F8EF"
      : r.status === "recogido"
        ? "#EEF2FF"
        : Colors.muted;
  const statusLabel =
    r.status === "activo"
      ? "ACTIVO"
      : r.status === "recogido"
        ? "RECOGIDO"
        : "EXPIRADO";

  return (
    <RnView style={styles.reservaCard}>
      <RnView style={[styles.reservaAccent, { backgroundColor: statusColor }]} />
      <RnView style={styles.reservaBody}>
        <RnView style={styles.reservaHeader}>
          <RnView style={styles.reservaInfo}>
            <Text style={styles.reservaName}>
              Casillero N°{r.casilleroNumber} — {r.size}
            </Text>
            <Text style={styles.reservaLocation}>
              Espacio Creativo Tinka {r.location}
            </Text>
          </RnView>
          <RnView style={[styles.reservaStatusBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.reservaStatusLabel, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </RnView>
        </RnView>
        <RnView style={styles.reservaDetails}>
          <Text style={styles.reservaDetailText}>
            <Text style={styles.reservaDetailLabel}>Producto:</Text> {r.productName}
          </Text>
          <Text style={styles.reservaDetailText}>
            <Text style={styles.reservaDetailLabel}>Valido hasta:</Text>{" "}
            <ClientTime iso={r.expiresAt} mode="datetime" />
          </Text>
        </RnView>
        {r.status === "activo" && (
          <TouchableOpacity
            onPress={() => onMarkRecogido(r.id)}
            style={styles.recogidoBtn}
          >
            <LinearGradient
              colors={Gradients.icon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.recogidoBtnGrad}
            >
              <Text style={styles.recogidoBtnText}>Marcar como Recogido</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </RnView>
    </RnView>
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
  formContent: {
    paddingBottom: 40,
  },
  confirmContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  confirmInner: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 24,
  },
  confirmIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.glow,
  },
  confirmTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: Colors.navy,
    textAlign: "center",
    marginTop: 20,
  },
  confirmCard: {
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
  confirmActions: {
    width: "100%",
    marginTop: 24,
    gap: 12,
  },
  whatsappBtn: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
  },
  whatsappBtnGrad: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  whatsappBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
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
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  backLink: {
    textAlign: "center",
    color: Colors.mutedForeground,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingVertical: 8,
  },
  form: {
    paddingHorizontal: 20,
    gap: 20,
    paddingBottom: 24,
  },
  noProductsText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.mutedForeground,
  },
  productList: {
    gap: 8,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  productItemActive: {
    borderColor: Colors.magenta,
    backgroundColor: Colors.accent,
  },
  productItemName: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.navy,
  },
  productItemStock: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.mutedForeground,
  },
  pinInput: {
    width: "100%",
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 28,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: "rgba(27, 58, 107, 0.7)",
    color: Colors.navy,
    fontWeight: "800",
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 8,
  },
  expiryRow: {
    flexDirection: "row",
    gap: 12,
  },
  expiryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
  },
  expiryBtnActive: {
    borderColor: "transparent",
  },
  expiryBtnInactive: {
    borderColor: "rgba(27,58,107,0.6)",
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  expiryBtnGrad: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  expiryBtnActiveText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  expiryBtnInactiveText: {
    color: Colors.navy,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  locationName: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.navy,
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendSquare: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.mutedForeground,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  slotBtn: {
    width: (320 - 40 - 24) / 3,
    borderRadius: 16,
    borderWidth: 2,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  slotNumber: {
    fontSize: 20,
    fontWeight: "800",
  },
  slotSize: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  continueBtn: {
    marginTop: 12,
  },
  locationCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  locationCardActive: {
    borderColor: Colors.magenta,
  },
  locationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  locationInfo: {
    flex: 1,
  },
  locationAddress: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.navy,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  locationCity: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  brandCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    ...Shadow.soft,
  },
  brandCardTop: {
    height: 8,
  },
  brandCardBody: {
    backgroundColor: Colors.card,
    padding: 16,
  },
  brandTag: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: Colors.magenta,
    textTransform: "uppercase",
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.navy,
    marginTop: 2,
  },
  brandDesc: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.mutedForeground,
    marginTop: 4,
  },
  activeSection: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
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
  activeItem: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activeAccent: {
    width: 6,
    backgroundColor: Colors.magenta,
  },
  activeBody: {
    flex: 1,
    padding: 14,
  },
  activeName: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.navy,
  },
  activeProduct: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: "#E8F8EF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  activeBadgeText: {
    color: Colors.success,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  actions: {
    marginHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  archiveBtn: {
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
  archiveBtnText: {
    color: Colors.navy,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  reservasList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  emptyReservas: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 48,
  },
  emptyReservasText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.mutedForeground,
  },
  reservasSectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: Colors.navy,
    textTransform: "uppercase",
  },
  reservasSectionTitlePast: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: Colors.mutedForeground,
    textTransform: "uppercase",
    marginTop: 8,
  },
  reservaCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    flexDirection: "row",
    ...Shadow.soft,
  },
  reservaAccent: {
    width: 6,
  },
  reservaBody: {
    flex: 1,
    padding: 16,
  },
  reservaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  reservaInfo: {
    flex: 1,
  },
  reservaName: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.navy,
  },
  reservaLocation: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  reservaStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  reservaStatusLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  reservaDetails: {
    marginTop: 12,
    gap: 4,
  },
  reservaDetailText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.navy,
  },
  reservaDetailLabel: {
    fontWeight: "800",
    color: Colors.magenta,
  },
  recogidoBtn: {
    marginTop: 12,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  recogidoBtnGrad: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  recogidoBtnText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});
