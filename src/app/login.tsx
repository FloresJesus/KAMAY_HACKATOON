import { Colors, Gradients, Shadow } from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Eye, EyeOff, TrendingUp, Loader } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") {
      WebBrowser.maybeCompleteAuthSession();
    }
  }, []);

  const handleLogin = async () => {
    setError("");
    if (!email.trim()) {
      setError("Ingresa tu correo electrónico");
      return;
    }
    if (!password.trim()) {
      setError("Ingresa tu contraseña");
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message === "Invalid login credentials"
        ? "Credenciales inválidas"
        : authError.message);
    }
  };

  useEffect(() => {
    const handler = Linking.addEventListener("url", async (event) => {
      const code = event.url.match(/code=([^&]+)/)?.[1];
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
    });
    return () => handler.remove();
  }, []);

  const handleRegister = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Completa todos los campos");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { business_name: "Mi Negocio" },
      },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
    } else if (!data.session) {
      Alert.alert(
        "Registro exitoso",
        "Revisa tu correo para confirmar la cuenta. Si ya tienes cuenta, inicia sesión."
      );
    }
  };

  const handleGitHubSignIn = async () => {
    setError("");
    setLoading(true);
    const redirectTo =
      process.env.EXPO_PUBLIC_REDIRECT_URL ??
      Linking.createURL("auth/callback");

    try {
      if (Platform.OS === "web") {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "github",
          options: { redirectTo },
        });
        if (error) setError(error.message);
      } else {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "github",
          options: { redirectTo, skipBrowserRedirect: true },
        });
        if (error) {
          setError(error.message);
        } else if (data?.url) {
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectTo
          );
          if (result.type === "success") {
            const code = (result.url as string).match(/code=([^&]+)/)?.[1];
            if (code) {
              await supabase.auth.exchangeCodeForSession(code);
            }
          }
        }
      }
    } catch (e: any) {
      setError(e?.message || "Error al iniciar sesión con GitHub");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar />

      <View style={styles.inner}>
        <View style={styles.hero}>
          <Image
            source={require("../../assets/image.png")}
            style={styles.logo}
          />
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>
            Ingresa a tu cuenta para administrar tu negocio
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <TextInput
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError("");
              }}
              placeholder="ejemplo@correo.com"
              placeholderTextColor="rgba(27, 58, 107, 0.35)"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONTRASEÑA</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setError("");
                }}
                placeholder="••••••••"
                placeholderTextColor="rgba(27, 58, 107, 0.35)"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
                style={[styles.input, styles.passwordInput]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? (
                  <EyeOff color={Colors.mutedForeground} size={20} />
                ) : (
                  <Eye color={Colors.mutedForeground} size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
            style={styles.loginBtn}
          >
            <LinearGradient
              colors={Gradients.icon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.loginBtnGrad}
            >
              {loading ? (
                <Loader color="#fff" size={20} />
              ) : (
                <Text style={styles.loginBtnText}>INICIAR SESIÓN</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O CONTINÚA CON</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            onPress={handleGitHubSignIn}
            activeOpacity={0.85}
            disabled={loading}
            style={styles.googleBtn}
          >
            <Text style={styles.googleBtnText}>GITHUB</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TrendingUp color={Colors.success} size={14} />
          <Text style={styles.footerText}>
            Comunidad Tinka · Banco FIE
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function StatusBar() {
  return <View style={styles.statusBar} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
  },
  statusBar: {
    height: 0,
  },
  hero: {
    alignItems: "center",
    marginBottom: 8,
  },
  logo: {
    width: Math.min(240, width * 0.65),
    height: 80,
    resizeMode: "contain",
  },
  form: {
    marginHorizontal: 24,
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    ...Shadow.elevated,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.navy,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.mutedForeground,
    textAlign: "center",
    marginBottom: 20,
    marginTop: 4,
    lineHeight: 18,
  },
  inputGroup: {
    marginTop: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: Colors.magenta,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 26,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    color: Colors.navy,
    fontWeight: "600",
    fontSize: 15,
  },
  passwordRow: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 52,
  },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
  },
  errorBox: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#FFF0F3",
    borderWidth: 1,
    borderColor: "rgba(233, 69, 96, 0.3)",
  },
  errorText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.danger,
    textAlign: "center",
  },
  loginBtn: {
    marginTop: 20,
    width: "100%",
    height: 54,
    borderRadius: 27,
    overflow: "hidden",
  },
  loginBtnGrad: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: Colors.mutedForeground,
  },
  googleBtn: {
    marginTop: 12,
    width: "100%",
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: Colors.navy,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: Colors.navy,
    textTransform: "uppercase",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 32,
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: Colors.mutedForeground,
  },
});
