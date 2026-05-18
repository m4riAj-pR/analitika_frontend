import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authApi } from "../../src/services/api/auth";

import {
    colors,
    palette,
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
    const [recoveryLoading, setRecoveryLoading] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
            Alert.alert("Error de Inicio de Sesión", error.message || "Credenciales incorrectas");
        } finally {
            setLoading(false);
        }
    };

    const handleRecovery = async () => {
        if (!recoveryEmail.trim()) {
            Alert.alert("Campo requerido", "Por favor ingresa tu correo electrónico.");
            return;
        }
        try {
            setRecoveryLoading(true);
            const res: any = await authApi.forgotPassword(recoveryEmail.trim());
            
            Alert.alert(
                "Solicitud Procesada", 
                res.message || "Si el correo está registrado, recibirás instrucciones pronto.",
                [{ text: "Entendido", onPress: () => setShowRecoveryModal(false) }]
            );
        } catch (error: any) {
            Alert.alert("Error", error.message || "No se pudo procesar la solicitud.");
        } finally {
            setRecoveryLoading(false);
        }
    };

    return (

        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: themeColors.bgPage }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <ScrollView 
                contentContainerStyle={{ flexGrow: 1 }} 
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                {/* ── HEADER – fondo blanco con diagramas de analítica ── */}
                <View style={[styles.header, { paddingTop: insets.top, backgroundColor: themeColors.bgPage }]}>
                {/* Diagrama tipo Torta (Pie Chart) - Superior Izquierda */}
                <View style={styles.blobTopLeft}>
                    <Svg height="160" width="160" viewBox="0 0 100 100">
                        {/* Slice 1 */}
                        <Path d="M50,50 L50,0 A50,50 0 0,1 100,50 Z" fill={palette.purple1} opacity={0.15} />
                        {/* Slice 2 */}
                        <Path d="M50,50 L100,50 A50,50 0 0,1 50,100 Z" fill={palette.purple2} opacity={0.1} />
                        {/* Slice 3 */}
                        <Path d="M50,50 L50,100 A50,50 0 0,1 0,50 Z" fill={palette.purple3} opacity={0.08} />
                    </Svg>
                </View>

                {/* Diagrama tipo Dona (Donut Chart) - Superior Derecha */}
                <View style={styles.blobTopRight}>
                    <Svg height="120" width="120" viewBox="0 0 100 100">
                        <Circle cx="50" cy="50" r="40" stroke={palette.purple2} strokeWidth="15" fill="none" opacity={0.12} strokeDasharray="180 100" />
                        <Circle cx="50" cy="50" r="40" stroke={palette.purple1} strokeWidth="15" fill="none" opacity={0.15} strokeDasharray="80 200" />
                    </Svg>
                </View>

                {/* Diagrama de Barras Estilizado - Lateral Izquierdo */}
                <View style={styles.blobMidLeft}>
                    <Svg height="70" width="70" viewBox="0 0 100 100">
                        <Rect x="10" y="50" width="15" height="40" rx="5" fill={palette.purple1} opacity={0.1} />
                        <Rect x="35" y="30" width="15" height="60" rx="5" fill={palette.purple2} opacity={0.12} />
                        <Rect x="60" y="10" width="15" height="80" rx="5" fill={palette.purple3} opacity={0.15} />
                    </Svg>
                </View>

                {/* Diagrama de Líneas (Trend Chart) - Lateral Derecho */}
                <View style={styles.blobMidRight}>
                    <Svg height="80" width="100" viewBox="0 0 100 100">
                        <Path 
                            d="M10,80 Q30,20 50,50 T90,10" 
                            fill="none" 
                            stroke={palette.purple1} 
                            strokeWidth="5" 
                            opacity={0.15} 
                        />
                        <Circle cx="10" cy="80" r="4" fill={palette.purple1} opacity={0.2} />
                        <Circle cx="50" cy="50" r="4" fill={palette.purple1} opacity={0.2} />
                        <Circle cx="90" cy="10" r="4" fill={palette.purple1} opacity={0.2} />
                    </Svg>
                </View>

                {/* Puntos de Datos Dispersos - Superior Centro */}
                <View style={styles.blobTopCenter}>
                    <Svg height="60" width="100" viewBox="0 0 100 60">
                        <Circle cx="20" cy="20" r="3" fill={palette.purple2} opacity={0.1} />
                        <Circle cx="50" cy="10" r="4" fill={palette.purple1} opacity={0.15} />
                        <Circle cx="80" cy="30" r="3" fill={palette.purple3} opacity={0.1} />
                        <Circle cx="40" cy="40" r="5" fill={palette.purple2} opacity={0.08} />
                        <Circle cx="70" cy="50" r="3" fill={palette.purple1} opacity={0.12} />
                    </Svg>
                </View>

                {/* Logo oficial */}
                <View style={styles.logoWrapper}>
                    <Image
                        source={isDark ? require("../../assets/images/icon_negative.png") : require("../../assets/images/icon.png")}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>
            </View>

            {/* ── BOTTOM SHEET – formulario ── */}
            <View style={[styles.sheet, { backgroundColor: themeColors.bgAccent }]}>
                <Text style={[styles.title, { color: themeColors.primary }]}>Inicio de sesión</Text>

                {/* Email */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: themeColors.textSecondary }]}>Correo Electrónico</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary, borderColor: themeColors.borderInput }]}
                        placeholder="Correo Electrónico"
                        placeholderTextColor={themeColors.textMuted}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                {/* Contraseña */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: themeColors.textSecondary }]}>Contraseña</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.input, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary, borderColor: themeColors.borderInput, flex: 1, marginBottom: 0 }]}
                            placeholder="Contraseña"
                            placeholderTextColor={themeColors.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity 
                            style={styles.eyeIcon} 
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons 
                                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                                size={22} 
                                color={themeColors.primary} 
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Olvidaste contraseña */}
                <TouchableOpacity 
                    style={styles.forgotPasswordBtn} 
                    onPress={() => {
                        setRecoveryEmail(email);
                        setShowRecoveryModal(true);
                    }}
                >
                    <Text style={[styles.forgotPasswordText, { color: themeColors.primary }]}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>

                {/* Botón principal */}
                <TouchableOpacity
                    style={[styles.loginButtonContainer, loading && { opacity: 0.7 }]}
                    activeOpacity={0.85}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={[themeColors.primary, themeColors.primaryHover || themeColors.primary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.loginButtonGradient}
                    >
                        {loading ? (
                            <ActivityIndicator color={themeColors.textOnPrimary} />
                        ) : (
                            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                        )}
                    </LinearGradient>
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
                        <Text style={[styles.footerLink, { color: themeColors.primary }]}>Regístrate gratis</Text>
                    </Text>
                </TouchableOpacity>

                {/* Modal de Recuperación */}
                <Modal visible={showRecoveryModal} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: themeColors.bgPage }]}>
                            <Text style={[styles.modalTitle, { color: themeColors.primary }]}>Recuperar contraseña</Text>
                            <Text style={[styles.modalSub, { color: themeColors.textSecondary }]}>
                                Ingresa tu correo y te enviaremos un código para restablecer tu acceso.
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary, width: '100%' }]}
                                placeholder="tu@email.com"
                                placeholderTextColor={themeColors.textMuted}
                                value={recoveryEmail}
                                onChangeText={setRecoveryEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={[styles.loginButtonContainer, { width: '90%', alignSelf: 'center' }, recoveryLoading && { opacity: 0.7 }]}
                                onPress={handleRecovery}
                                disabled={recoveryLoading}
                            >
                                <LinearGradient
                                    colors={[themeColors.primary, themeColors.primaryHover || themeColors.primary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.loginButtonGradient, { paddingVertical: 14 }]}
                                >
                                    {recoveryLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={[styles.loginButtonText, { fontSize: 15 }]}>Enviar código</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowRecoveryModal(false)}>
                                <Text style={[styles.cancelText, { color: themeColors.textMuted }]}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
            </ScrollView>
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
        height: 320,
        backgroundColor: colors.bgPage,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
    },

    /* Diagramas decorativos (antes blobs) */
    blobTopLeft: {
        position: "absolute",
        top: -45,
        left: -35,
        width: 160,
        height: 160,
    },
    blobTopRight: {
        position: "absolute",
        top: -15,
        right: -30,
        width: 120,
        height: 120,
    },
    blobMidLeft: {
        position: "absolute",
        bottom: 40,
        left: 5,
        width: 70,
        height: 70,
        transform: [{ rotate: '-15deg' }]
    },
    blobMidRight: {
        position: "absolute",
        bottom: 60,
        right: -10,
        width: 100,
        height: 80,
        transform: [{ rotate: '10deg' }]
    },
    blobTopCenter: {
        position: "absolute",
        top: 20,
        alignSelf: 'center',
        width: 100,
        height: 60,
    },

    /* Logo */
    logoWrapper: {
        alignItems: "center",
        justifyContent: "center",
    },
    logoImage: {
        width: 290,
        height: 290,
    },

    /* ── BOTTOM SHEET ── */
    sheet: {
        flex: 1,
        backgroundColor: colors.bgAccent,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: spacing.xxl,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xxl,
        justifyContent: 'center',
    },

    title: {
        fontSize: typography.size4xl,
        fontWeight: typography.bold,
        color: colors.primary,
        textAlign: "center",
        marginBottom: spacing.md,
    },
    label: {
        fontSize: typography.sizeSm,
        fontWeight: typography.semibold,
        color: colors.primary,
        marginBottom: spacing.xs,
        marginLeft: spacing.xs,
    },

    inputGroup: {
        marginBottom: spacing.lg,
    },
    input: {
        backgroundColor: colors.bgInput,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: radii.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: Platform.OS === "ios" ? 16 : 14,
        fontSize: typography.sizeMd,
        color: colors.primary,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        height: '100%',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },

    loginButtonContainer: {
        marginTop: spacing.xs,
        marginBottom: spacing.lg,
        borderRadius: radii.pill,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
    },
    loginButtonGradient: {
        borderRadius: radii.pill,
        paddingVertical: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 17,
        letterSpacing: 0.5,
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
    forgotPasswordBtn: {
        alignSelf: 'flex-end',
        marginTop: -10,
        marginBottom: 20,
        padding: 4,
    },
    forgotPasswordText: {
        fontSize: 13,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 10,
    },
    modalSub: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    cancelText: {
        marginTop: 15,
        fontSize: 14,
        fontWeight: '500',
    },
});
