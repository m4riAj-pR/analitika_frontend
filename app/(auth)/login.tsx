import { useRouter } from "expo-router";
import { authApi } from "../../src/services/api";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    colors,
    palette,
    radii,
    sharedStyles,
    spacing,
    typography,
} from "../../src/theme/colors";

export default function Login() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

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
            await authApi.login({
                email: email.trim(),
                password: password
            });

            // Si el login es exitoso
            router.replace('/(app)/(tabs)/dashboard');
        } catch (error: any) {
            Alert.alert("Error de Inicio de Sesión", error.message || "Credenciales incorrectas o usuario no registrado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {/* ── HEADER – fondo blanco con blobs y logo ── */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
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
            <View style={styles.sheet}>
                <Text style={styles.title}>Inicio de Sesion</Text>

                {/* Email */}
                <TextInput
                    style={styles.input}
                    placeholder="Correo Electronico *"
                    placeholderTextColor={palette.purple3}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                {/* Contraseña */}
                <TextInput
                    style={styles.input}
                    placeholder="Contraseña *"
                    placeholderTextColor={palette.purple3}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {/* Botón principal */}
                <TouchableOpacity
                    style={[styles.loginButton, loading && { opacity: 0.7 }]}
                    activeOpacity={0.85}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.textOnPrimary} />
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
                    <Text style={styles.footerText}>
                        ¿No tienes cuenta ?{" "}
                        <Text style={styles.footerLink}>Registrate Gratis</Text>
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
    },
    blobTopRight: {
        position: "absolute",
        top: -15,
        right: -30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.bgBlob,
    },
    blobMidLeft: {
        position: "absolute",
        bottom: 30,
        left: -10,
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: colors.bgBlob,
        opacity: 0.7,
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
