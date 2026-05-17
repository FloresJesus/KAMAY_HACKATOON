import { PageHeader } from "@/components/tinka/AppShell";
import { Colors, Gradients, Shadow } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Exportar() {
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <PageHeader title="Exportar" showBack onBack={() => router.push("/mas")} />
      <View style={styles.card}>
        <Text style={styles.title}>Exporta tus ventas y datos</Text>
        <Text style={styles.description}>
          Aquí puedes exportar tu información de ventas en formato CSV y revisar reportes completos.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/reportes")}> 
          <LinearGradient colors={Gradients.icon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>Abrir Reportes</Text>
            <ArrowRight color="#fff" size={18} />
          </LinearGradient>
        </TouchableOpacity>
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
  card: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    ...Shadow.soft,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.navy,
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.mutedForeground,
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    borderRadius: 16,
    overflow: "hidden",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
