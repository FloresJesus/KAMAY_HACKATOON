import { Link, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import {
  Home,
  ReceiptText,
  Package,
  BarChart3,
  History,
  LayoutGrid,
  Power,
  ChevronLeft,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
  type TouchableOpacityProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Gradients, Shadow } from '@/constants/colors';
import { getStockStatus, useProducts } from '@/lib/product-store';

type NavItem = {
  to: '/' | '/nueva-venta' | '/stock' | '/reportes' | '/historial' | '/mas';
  icon: LucideIcon;
  label: string;
  badge?: boolean;
};

export function DottedStripe() {
  return (
    //dos filas de puntos alternados en magenta y navy, con un pequeño margen entre ellos, que se repiten a lo largo del ancho de la pantalla
    <View style={styles.dottedStripe}>
      {Array.from({ length: 100 }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: i % 2 === 0 ? Colors.magenta : Colors.navy },
          ]}
        />
      ))}
    </View>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { products } = useProducts();
  const hasStockAlert = products.some((p) => {
    const s = getStockStatus(p);
    return s === 'low' || s === 'critical';
  });

  const items: NavItem[] = [
    { to: '/', icon: Home, label: 'INICIO' },
    { to: '/nueva-venta', icon: ReceiptText, label: 'VENTAS' },
    { to: '/stock', icon: Package, label: 'STOCK', badge: hasStockAlert },
    { to: '/reportes', icon: BarChart3, label: 'REPORTES' },
    { to: '/historial', icon: History, label: 'HISTORIAL' },
    { to: '/mas', icon: LayoutGrid, label: 'MÁS' },
  ];

  return (
    <View style={[styles.shell, { paddingTop: insets.top }]}>
      <DottedStripe />
      <View style={styles.content}>
        {children}
        
      </View>
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
        {items.map((it) => {
          const active = pathname === it.to;
          const Icon = it.icon;
          return (
            <Link key={it.to} href={it.to} asChild>
              <Pressable style={styles.navItem}>
                <View style={styles.navIconWrap}>
                  <Icon
                    color={active ? Colors.magenta : Colors.navy}
                    size={20}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  {it.badge && !active && (
                    <View style={styles.navBadge} />
                  )}
                </View>
                <Text
                  style={[
                    styles.navLabel,
                    active && styles.navLabelActive,
                  ]}
                >
                  {it.label}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

export function PageHeader({
  title,
  showBack = false,
  onBack,
  right,
}: {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {showBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.headerBtn}
          >
            <ChevronLeft color={Colors.navy} size={24} strokeWidth={2.75} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerBtn} />
        )}
      </View>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerSide}>
        {right ?? (
          <TouchableOpacity style={styles.headerBtn}>
            
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export function ClientTime({
  iso,
  mode = 'time',
}: {
  iso: string;
  mode?: 'time' | 'datetime' | 'date';
}) {
  const [text, setText] = useState('');
  useEffect(() => {
    const d = new Date(iso);
    if (mode === 'time') {
      setText(d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }));
    } else if (mode === 'date') {
      setText(d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short' }));
    } else {
      setText(
        d.toLocaleString('es-BO', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }
  }, [iso, mode]);
  return <Text>{text || '\u00A0'}</Text>;
}

export function FieLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function FieInput(props: TextInputProps & { inputMode?: string }) {
  const { style, ...rest } = props;
  return (
    <TextInput
      {...rest}
      placeholderTextColor={Platform.select({
        default: 'rgba(27, 58, 107, 0.4)',
      })}
      style={[styles.input, style as object]}
    />
  );
}

export function FieButton({
  children,
  style,
  ...rest
}: TouchableOpacityProps & { children: ReactNode }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      {...rest}
      style={[styles.buttonWrap, style as object]}
    >
      <LinearGradient
        colors={Gradients.icon}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientButton, rest.disabled && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>{children}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function GradientCard({
  gradient,
  children,
  style,
}: {
  gradient: readonly [string, string, string] | readonly [string, string];
  children: ReactNode;
  style?: object;
}) {
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradientCard, style]}
    >
      {children}
    </LinearGradient>
  );
}

export function StepHeader({
  step,
  total,
  title,
  onBack,
}: {
  step: number;
  total: number;
  title: string;
  onBack: () => void;
}) {
  return (
    <View>
      <PageHeader title={title} showBack onBack={onBack} />
      <View style={styles.stepProgress}>
        <View style={styles.stepDots}>
          {Array.from({ length: total }, (_, i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                i < step
                  ? styles.stepDotActive
                  : styles.stepDotInactive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepText}>
          Paso {step} de {total}
        </Text>
      </View>
    </View>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

export { Row };

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  dottedStripe: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 8,
    overflow: 'hidden',
    paddingHorizontal: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    margin: 1,
  },
  bottomNav: {
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    gap: 4,
  },
  navIconWrap: {
    position: 'relative',
  },
  navBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.danger,
  },
  navLabel: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: Colors.navy,
  },
  navLabelActive: {
    color: Colors.magenta,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerSide: {
    width: 40,
    alignItems: 'center',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: Colors.navy,
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: Colors.magenta,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 28,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: 'rgba(27, 58, 107, 0.7)',
    color: Colors.navy,
    fontWeight: '600',
    fontSize: 16,
  },
  buttonWrap: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  gradientCard: {
    borderRadius: 16,
    padding: 16,
  },
  stepProgress: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  stepDots: {
    flexDirection: 'row',
    gap: 6,
  },
  stepDot: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  stepDotActive: {
    backgroundColor: Colors.magenta,
  },
  stepDotInactive: {
    backgroundColor: Colors.border,
  },
  stepText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: Colors.mutedForeground,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: Colors.magenta,
    textTransform: 'uppercase',
  },
  rowValue: {
    fontWeight: '800',
    color: Colors.navy,
    fontSize: 14,
  },
  rowValueHighlight: {
    fontSize: 18,
  },
});
