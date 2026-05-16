import { StyleSheet, Text, View } from "react-native";

export default function HistorialScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Historial</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
  },
});
