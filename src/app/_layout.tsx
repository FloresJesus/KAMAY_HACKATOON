import { Slot } from "expo-router";
import AppShell from "../components/tinka/AppShell";

export default function RootLayout() {
  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
