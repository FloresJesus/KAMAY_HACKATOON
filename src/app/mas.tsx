import { PageHeader } from "@/components/tinka/AppShell";
import { Colors, Gradients, Shadow } from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import {
  BellRing,
  FileSpreadsheet,
  HelpCircle,
  Lock,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react-native";
import {
  Alert, Linking, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const items: { icon: LucideIcon; label: string }[] = [
  { icon: User, label: "Mi Negocio" },
  { icon: FileSpreadsheet, label: "Exportar" },
  { icon: Package, label: "Productos" },
  { icon: HelpCircle, label: "Ayuda" },
  { icon: BellRing, label: "Avisos" },
  { icon: ShieldCheck, label: "Seguridad" },
  { icon: Settings, label: "Ajustes" },
  { icon: LogOut, label: "Salir" },
];

export default function Mas() {
  const router = useRouter();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", "No se pudo cerrar la sesión");
    }
  }

  function handleOption(label: string) {
    switch (label) {
      case "Mi Negocio":
        router.push("/");
        break;
      case "Exportar":
        router.push("/reportes");
        break;
      case "Productos":
        router.push("/stock");
        break;
      case "Ayuda":
        // open external help URL
        Linking.openURL("https://www.bancofie.com.bo/plataformas/tinka").catch(() => {
          Alert.alert("Error", "No se pudo abrir la ayuda");
        });
        break;
      case "Avisos":
        router.push("/historial");
        break;
      case "Seguridad":
        router.push("/casilleros");
        break;
      case "Ajustes":
        Alert.alert("Ajustes", "Página de ajustes no disponible aún.");
        break;
      case "Salir":
        handleLogout();
        break;
      default:
        Alert.alert("Opción", `Seleccionaste: ${label}`);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <PageHeader
        title="Mas Opciones"
        showBack
        onBack={() => router.push("/")}
      />

      <View style={styles.tinkaSection}>
        <Text style={styles.tinkaTag}>Tinka · Banco FIE</Text>

        <TouchableOpacity
          onPress={() => (router as any).push("/casilleros")}
          style={styles.tinkaCard}
        >
          <LinearGradient
            colors={Gradients.icon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tinkaCardTop}
          />
          <View style={styles.tinkaCardBody}>
            <LinearGradient
              colors={Gradients.icon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tinkaIcon}
            >
              <Lock color="#fff" size={24} strokeWidth={2.25} />
            </LinearGradient>
            <View style={styles.tinkaTextArea}>
              <Text style={styles.tinkaTitle}>Casilleros Tinka</Text>
              <Text style={styles.tinkaDesc}>
                Entrega tus productos de forma rapida y segura
              </Text>
            </View>
            <LinearGradient
              colors={Gradients.icon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tinkaBadge}
            >
              <Text style={styles.tinkaBadgeText}>Acceder</Text>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.optionsSection}>
        <Text style={styles.optionsTag}>Opciones</Text>
        <View style={styles.optionsGrid}>
          {items.map(({ icon: Icon, label }) => (
            <TouchableOpacity
              key={label}
              style={styles.optionBtn}
              onPress={() => handleOption(label)}
            >
              <Icon color={Colors.magenta} size={32} strokeWidth={2} />
              <Text style={styles.optionLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.versionCard}>
        <Text style={styles.versionTag}>Version</Text>
        <Text style={styles.versionTitle}>Kamay v1.0</Text>
        <Text style={styles.versionDesc}>
          Tu negocio, en tus manos · Comunidad Tinka · Banco FIE
        </Text>
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
  tinkaSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tinkaTag: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: Colors.magenta,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  tinkaCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    ...Shadow.soft,
  },
  tinkaCardTop: {
    height: 6,
  },
  tinkaCardBody: {
    backgroundColor: Colors.card,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  tinkaIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tinkaTextArea: {
    flex: 1,
  },
  tinkaTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.navy,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tinkaDesc: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  tinkaBadge: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  tinkaBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  optionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  optionsTag: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: Colors.navy,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionBtn: {
    width: (320 - 20 * 2 - 24) / 3,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
    ...Shadow.soft,
  },
  optionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: Colors.navy,
    textTransform: "uppercase",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  versionCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    ...Shadow.soft,
  },
  versionTag: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: Colors.magenta,
    textTransform: "uppercase",
  },
  versionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.navy,
    marginTop: 4,
  },
  versionDesc: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.mutedForeground,
    marginTop: 4,
  },
});
