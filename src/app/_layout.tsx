import { AuthProvider } from "@/lib/auth-context";
import { Slot, usePathname } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/lib/auth-context";
import AppShell from "../components/tinka/AppShell";

function RootLayoutInner() {
  const pathname = usePathname();
  const { isLoading } = useAuth();
  const isLogin = pathname === "/login" || pathname.startsWith("/auth");

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#E91E8C" />
      </View>
    );
  }

  if (isLogin) {
    return <Slot />;
  }

  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  );
}
