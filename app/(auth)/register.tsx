import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
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

export default function Register() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [nombres, setNombres] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [empresa, setEmpresa] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleRegister = () => {
        if (!nombres.trim()) {
            Alert.alert("Campo requerido", "Por favor ingresa tus Nombres.");
            return;
        }
        if (!apellidos.trim()) {
            Alert.alert("Campo requerido", "Por favor ingresa tus Apellidos.");
            return;
        }
        if (!email.trim()) {
            Alert.alert("Campo requerido", "Por favor ingresa tu Correo Electrónico.");
            return;
        }
        if (!password.trim()) {
            Alert.alert("Campo requerido", "Por favor ingresa una Contraseña.");
            return;
        }
        if (!acceptedTerms) {
            Alert.alert(
                "Términos y Condiciones",
                "Debes aceptar los Términos y Condiciones para continuar."
            );
            return;
        }
        // Navegación al dashboard tras registro exitoso
        router.replace("/(dashboard)");
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {/* ── HEADER – blob + logo ── */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                {/* Blob superior-izquierdo */}
                <View style={styles.blobTopLeft} />

                {/* Logo */}
                <View style={styles.logoWrapper}>
                    <Image
                        source={require("../../assets/images/icon.png")}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>

                {/* Botón volver */}
                <TouchableOpacity
                    style={[styles.backButton, { top: insets.top + 12 }]}
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={26} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* ── BOTTOM SHEET – formulario ── */}
            <View style={styles.sheet}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.title}>Crear Cuenta</Text>

                    {/* Nombres* */}
                    <TextInput
                        style={styles.input}
                        placeholder="Nombres*"
                        placeholderTextColor={palette.purple3}
                        value={nombres}
                        onChangeText={setNombres}
                        autoCapitalize="words"
                    />

                    {/* Apellidos* */}
                    <TextInput
                        style={styles.input}
                        placeholder="Apellidos*"
                        placeholderTextColor={palette.purple3}
                        value={apellidos}
                        onChangeText={setApellidos}
                        autoCapitalize="words"
                    />

                    {/* Empresa (opcional) */}
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre de la empresa"
                        placeholderTextColor={palette.purple3}
                        value={empresa}
                        onChangeText={setEmpresa}
                        autoCapitalize="words"
                    />

                    {/* Correo* */}
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

                    {/* Contraseña* */}
                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña *"
                        placeholderTextColor={palette.purple3}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    {/* Checkbox Términos y Condiciones* */}
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        activeOpacity={0.7}
                        onPress={() => setAcceptedTerms(!acceptedTerms)}
                    >
                        <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                            {acceptedTerms && (
                                <Ionicons name="checkmark" size={14} color={colors.bgPage} />
                            )}
                        </View>
                        <Text style={styles.checkboxLabel}>
                            Acepta los{" "}
                            <Text style={styles.checkboxLink}>Terminos y Condiciones</Text>
                            {"\n"}para usar la app *
                        </Text>
                    </TouchableOpacity>

                    {/* Botón Registrarse */}
                    <TouchableOpacity
                        style={styles.registerButton}
                        activeOpacity={0.85}
                        onPress={handleRegister}
                    >
                        <Text style={styles.registerButtonText}>Registrarse</Text>
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
                    <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                        <Text style={styles.footerText}>
                            ¿Ya tienes Cuenta ?{" "}
                            <Text style={styles.footerLink}>Inicia Sesión</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgAccent, // todo el fondo en lavanda como el prototipo
    },

    /* ── HEADER ── */
    header: {
        flex: 0.2,
        backgroundColor: colors.bgAccent,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
    },

    blobTopLeft: {
        position: "absolute",
        top: -30,
        left: -20,
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: colors.bgBlob,
    },

    logoWrapper: {
        alignItems: "center",
        justifyContent: "center",
    },
    logoImage: {
        width: 200,
        height: 80,
    },

    backButton: {
        position: "absolute",
        left: 20,
        padding: 6,
    },

    /* ── BOTTOM SHEET ── */
    sheet: {
        flex: 0.8,
        backgroundColor: colors.bgAccent,
        paddingHorizontal: spacing.xxl,
    },

    scrollContent: {
        paddingBottom: spacing.xxxl,
    },

    title: {
        fontSize: typography.size2xl,
        fontWeight: typography.bold,
        color: colors.primary,
        textAlign: "center",
        marginBottom: spacing.xxl,
    },

    input: {
        backgroundColor: colors.bgInput,
        borderRadius: radii.lg,
        paddingHorizontal: spacing.xl,
        paddingVertical: 15,
        fontSize: typography.sizeMd,
        color: colors.primary,
        marginBottom: spacing.lg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
    },

    /* Checkbox */
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.xl,
        gap: spacing.md,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: radii.sm,
        borderWidth: 1.5,
        borderColor: colors.borderDivider,
        backgroundColor: colors.bgInput,
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkboxLabel: {
        flex: 1,
        fontSize: typography.sizeSm,
        color: colors.textBody,
        lineHeight: 20,
    },
    checkboxLink: {
        color: "#2D9CFF",
        fontWeight: typography.semibold,
    },

    /* Botón */
    registerButton: {
        ...sharedStyles.primaryButton,
        marginBottom: spacing.xl,
    },
    registerButtonText: {
        ...sharedStyles.primaryButtonText,
    },

    /* Divider */
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
    },

    /* Footer */
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
