import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Inicio</Text>
      <Text style={styles.subtitle}>Bienvenido a Kamay</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2b4382",
  },
  subtitle: {
    fontSize: 16,
    color: "#0065ac",
    marginTop: 8,
    textAlign: "center",
  },
});
