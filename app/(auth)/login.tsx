import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authApi } from "../../src/services/api/auth";

import {
    colors,
    radii,
    sharedStyles,
    spacing,
    typography
} from "../../src/theme/colors";
import { useTheme } from "../../src/ThemeContext";

export default function Login() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colors: themeColors, isDark } = useTheme();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim()) {
            Alert.alert("Campo requerido", "Por favor ingresa tu Correo Electrónico.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert("Correo Inválido", "Por favor ingresa un correo electrónico válido.");
            return;
        }

        if (!password.trim()) {
            Alert.alert("Campo requerido", "Por favor ingresa tu Contraseña.");
            return;
        }

        try {
            setLoading(true);
            const response = await authApi.login({
                email: email.trim(),
                password: password
            });

            // Si el login es exitoso, redirigir según el rol
            const user = response?.user || response;
            if (user?.id_role === 1) {
                router.replace('/(admin)/companies');
            } else {
                router.replace('/(app)/(tabs)/dashboard');
            }

        } catch (error: any) {
            console.error("Login Error:", error.message || "Credenciales incorrectas");
        } finally {
            setLoading(false);
        }
    };

    return (

        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: themeColors.bgPage }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {/* ── HEADER – fondo blanco con blobs y logo ── */}
            <View style={[styles.header, { paddingTop: insets.top, backgroundColor: themeColors.bgPage }]}>
                {/* Blob superior-izquierdo (grande, cortado) */}
                <View style={styles.blobTopLeft} />

                {/* Blob superior-derecho (mediano, cortado) */}
                <View style={styles.blobTopRight} />

                {/* Blob lateral-izquierdo (pequeño, a media altura) */}
                <View style={styles.blobMidLeft} />
                {/* Logo oficial */}
                <View style={styles.logoWrapper}>
                    <Image
                        source={require("../../assets/images/icon.png")}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>
            </View>

            {/* ── BOTTOM SHEET – formulario ── */}
            <View style={[styles.sheet, { backgroundColor: themeColors.bgAccent }]}>
                <Text style={[styles.title, { color: themeColors.primary }]}>Inicio de Sesion</Text>

                {/* Email */}
                <Text style={[styles.label, { color: themeColors.primary }]}>Correo Electrónico</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary }]}
                    placeholder="Correo Electrónico"
                    placeholderTextColor={themeColors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                {/* Contraseña */}
                <Text style={[styles.label, { color: themeColors.primary }]}>Contraseña</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary }]}
                    placeholder="Contraseña"
                    placeholderTextColor={themeColors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {/* Botón principal */}
                <TouchableOpacity
                    style={[styles.loginButton, { backgroundColor: themeColors.primary }, loading && { opacity: 0.7 }]}
                    activeOpacity={0.85}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={themeColors.textOnPrimary} />
                    ) : (
                        <Text style={styles.loginButtonText}>Iniciar Sesion</Text>
                    )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                    <View style={sharedStyles.dividerLine} />
                    <View
                        style={[
                            sharedStyles.dividerDot,
                            {
                                backgroundColor: "transparent",
                                borderWidth: 1,
                                borderColor: colors.primary,
                            },
                        ]}
                    />
                    <View style={sharedStyles.dividerLine} />
                </View>

                {/* Footer */}
                <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                    <Text style={[styles.footerText, { color: themeColors.textBody }]}>
                        ¿No tienes cuenta ?{" "}
                        <Text style={[styles.footerLink, { color: themeColors.primary }]}>Registrate Gratis</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPage,
    },

    /* ── HEADER ── */
    header: {
        flex: 0.48,
        backgroundColor: colors.bgPage,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
    },

    /* Blobs decorativos */
    blobTopLeft: {
        position: "absolute",
        top: -55,
        left: -35,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: colors.bgBlob,
        opacity: 0.4,
    },
    blobTopRight: {
        position: "absolute",
        top: -15,
        right: -30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.bgBlob,
        opacity: 0.4,
    },
    blobMidLeft: {
        position: "absolute",
        bottom: 30,
        left: -10,
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: colors.bgBlob,
        opacity: 0.3,
    },

    /* Logo */
    logoWrapper: {
        alignItems: "center",
        justifyContent: "center",
    },
    logoImage: {
        width: 300,
        height: 400,
    },

    /* ── BOTTOM SHEET ── */
    sheet: {
        flex: 0.52,
        backgroundColor: colors.bgAccent,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: spacing.xxl,
        paddingTop: spacing.xxxl,
        paddingBottom: spacing.xxl,
    },

    title: {
        fontSize: typography.size3xl,
        fontWeight: typography.bold,
        color: colors.primary,
        textAlign: "center",
        marginBottom: spacing.xxl,
    },
    label: {
        fontSize: typography.sizeSm,
        fontWeight: typography.semibold,
        color: colors.primary,
        marginBottom: spacing.xs,
        marginLeft: spacing.xs,
    },

    input: {
        backgroundColor: colors.bgInput,
        borderRadius: radii.lg,
        paddingHorizontal: spacing.xl,
        paddingVertical: 16,
        fontSize: typography.sizeMd,
        color: colors.primary,
        marginBottom: spacing.lg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },

    loginButton: {
        ...sharedStyles.primaryButton,
        marginTop: spacing.sm,
        marginBottom: spacing.xl,
    },
    loginButtonText: {
        ...sharedStyles.primaryButtonText,
    },

    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
    },

    footerText: {
        textAlign: "center",
        fontSize: typography.sizeSm,
        color: colors.textBody,
    },
    footerLink: {
        color: "#2D9CFF",
        fontWeight: typography.semibold,
    },
});
