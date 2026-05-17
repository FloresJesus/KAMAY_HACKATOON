import { PageHeader } from "@/components/tinka/AppShell";
import { Colors, Shadow } from "@/constants/colors";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Seguridad() {
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <PageHeader title="Seguridad" showBack onBack={() => router.push("/mas")} />
      <View style={styles.card}>
        <Text style={styles.title}>Seguridad del negocio</Text>
        <Text style={styles.text}>
          Revisa la seguridad de tu cuenta y activa medidas como verificación de sesión y alertas de acceso.
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
  card: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.soft,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.navy,
    marginBottom: 12,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.mutedForeground,
    lineHeight: 20,
  },
});
