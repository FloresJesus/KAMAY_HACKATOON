import { supabase } from "@/lib/supabase";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

export default function AuthCallback() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) return;
    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          setError(error.message);
        } else {
          router.replace("/");
        }
      });
  }, [code]);

  return (
    <View style={styles.root}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <ActivityIndicator size="large" color="#1B3A6B" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  error: {
    color: "#E94560",
    fontSize: 14,
    fontWeight: "700",
  },
});
