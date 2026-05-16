import { Link, usePathname } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import {
  BarChart3,
  History,
  Home,
  LayoutGrid,
  Package,
  ReceiptText,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type NavItem = {
  to: "/" | "/nueva-venta" | "/stock" | "/reportes" | "/historial" | "/mas";
  icon: LucideIcon;
  label: string;
  badge?: boolean;
};

const items: NavItem[] = [
  { to: "/", icon: Home, label: "INICIO" },
  { to: "/nueva-venta", icon: ReceiptText, label: "VENTAS" },
  { to: "/stock", icon: Package, label: "STOCK" },
  { to: "/reportes", icon: BarChart3, label: "REPORTES" },
  { to: "/historial", icon: History, label: "HISTORIAL" },
  { to: "/mas", icon: LayoutGrid, label: "MÁS" },
];

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <View style={styles.content}>{children}</View>

      <View style={styles.bottomBar}>
        {items.map((item) => {
          const isActive = pathname === item.to;
          const Icon = item.icon;
          const buttonStyle = StyleSheet.flatten([
            styles.menuButton,
            isActive && styles.menuButtonActive,
          ]);
          const labelStyle = StyleSheet.flatten([
            styles.menuLabel,
            isActive && styles.menuLabelActive,
          ]);

          return (
            <Link key={item.to} href={item.to} asChild>
              <Pressable style={buttonStyle}>
                <Icon color={isActive ? "#FFFFFF" : "#0065ac"} size={24} />
                <Text style={labelStyle}>{item.label}</Text>
                {item.badge ? <View style={styles.badge} /> : null}
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    color: "#2b4382",
  },
  subtitle: {
    fontSize: 16,
    color: "#0065ac",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fafafa",
  },
  menuButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  menuButtonActive: {
    backgroundColor: "#2b4382",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#44bef0",
    shadowColor: "#ee008b",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 4,
  },
  menuLabel: {
    fontSize: 10,
    marginTop: 4,
    color: "#0065ac",
    letterSpacing: 0.5,
  },
  menuLabelActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 22,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
});
