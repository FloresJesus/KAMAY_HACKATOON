import { PageHeader } from "@/components/tinka/AppShell";
import { Colors, Gradients, Shadow } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function MiNegocio() {
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <PageHeader title="Mi Negocio" showBack onBack={() => router.push("/mas")} />
      <View style={styles.card}>
        <LinearGradient
          colors={Gradients.icon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardTop}
        />
        <View style={styles.cardBody}>
          <Text style={styles.tag}>NEGOCIO DEL USUARIO</Text>
          <Text style={styles.title}>Emprendimiento Tinka</Text>
          <Text style={styles.label}>Propietario</Text>
          <Text style={styles.value}>Usuario Demo</Text>
          <Text style={styles.label}>Ubicación</Text>
          <Text style={styles.value}>La Paz · Bolivia</Text>
          <Text style={styles.label}>Estado</Text>
          <Text style={styles.value}>Activo</Text>
          <Text style={styles.label}>Productos</Text>
          <Text style={styles.value}>32 artículos registrados</Text>
        </View>
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    overflow: "hidden",
    ...Shadow.soft,
  },
  cardTop: {
    height: 8,
  },
  cardBody: {
    padding: 20,
  },
  tag: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: Colors.magenta,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.navy,
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.navy,
    marginTop: 12,
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.mutedForeground,
    marginTop: 4,
  },
});
