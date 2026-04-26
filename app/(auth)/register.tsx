import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authApi } from "../../src/services/api/auth";
import {
    colors,
    palette,
    radii,
    spacing,
    typography
} from "../../src/theme/colors";

const { height } = Dimensions.get('window');

export default function Register() {
    console.log("AUTH API DIRECT:", authApi);
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [nombres, setNombres] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [empresa, setEmpresa] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    const handleRegister = async () => {
        console.log("CLICK REGISTER");
        console.log("FORM DATA", { nombres, apellidos, email, phone, password });
        console.log("AUTH API", authApi);
        console.log("AUTH REGISTER FN", authApi?.register);

        if (!nombres.trim()) {
            Alert.alert("Campo requerido", "Por favor ingresa tus Nombres.");
            return;
        }
        if (!apellidos.trim()) {
            Alert.alert("Campo requerido", "Por favor ingresa tus Apellidos.");
            return;
        }
        if (!phone.trim()) {
            Alert.alert("Campo requerido", "Por favor ingresa tu Teléfono.");
            return;
        }
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
            Alert.alert("Campo requerido", "Por favor ingresa una Contraseña.");
            return;
        }

        if (password.length < 8) {
            Alert.alert("Contraseña débil", "La contraseña debe tener al menos 8 caracteres.");
            return;
        }
        if (!acceptedTerms) {
            Alert.alert(
                "Términos y Condiciones",
                "Debes aceptar los Términos y Condiciones para continuar."
            );
            return;
        }

        try {
            setLoading(true);
            const res = await authApi.register({
                first_name: nombres,
                last_name: apellidos,
                email: email.trim(),
                phone: phone.trim(),
                company: empresa.trim(),
                password,
            });
            console.log("REGISTER SUCCESS RESULT", res);

            Alert.alert("Registro Exitoso", "Tu cuenta ha sido creada correctamente.", [
                { text: "OK", onPress: () => router.replace("/(auth)/login") }
            ]);
        } catch (error: any) {
            console.log("ERROR COMPLETO", JSON.stringify(error, null, 2));
            Alert.alert("Error de registro", error.message || "Hubo un problema al crear tu cuenta.");
        } finally {
            setLoading(false);
        }
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

                {/* Botón volver */}
                <TouchableOpacity
                    style={[styles.backButton, { top: insets.top + 10 }]}
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>

                {/* Logo */}
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
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xxl }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                >
                    <View style={styles.sheetHeader}>
                        <Text style={styles.title}>Crea tu Cuenta</Text>
                    </View>

                    <View style={styles.form}>
                        {/* Nombres */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nombres</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Tus nombres"
                                placeholderTextColor="rgba(156, 163, 175, 0.8)"
                                value={nombres}
                                onChangeText={setNombres}
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Apellidos */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Apellidos</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Tus apellidos"
                                placeholderTextColor="rgba(156, 163, 175, 0.8)"
                                value={apellidos}
                                onChangeText={setApellidos}
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Teléfono */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Teléfono</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Tu número de teléfono"
                                placeholderTextColor="rgba(156, 163, 175, 0.8)"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                        </View>

                        {/* Empresa (opcional) */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Empresa <Text style={styles.optional}></Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre de tu empresa"
                                placeholderTextColor="rgba(156, 163, 175, 0.8)"
                                value={empresa}
                                onChangeText={setEmpresa}
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Correo */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Correo Electrónico</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="ejemplo@correo.com"
                                placeholderTextColor="rgba(156, 163, 175, 0.8)"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Contraseña */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Contraseña</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Mínimo 8 caracteres"
                                placeholderTextColor="rgba(156, 163, 175, 0.8)"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        {/* Checkbox Términos y Condiciones */}
                        <TouchableOpacity
                            style={styles.checkboxRow}
                            activeOpacity={0.7}
                            onPress={() => setAcceptedTerms(!acceptedTerms)}
                        >
                            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                                {acceptedTerms && (
                                    <Ionicons name="checkmark" size={14} color="#fff" />
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}>
                                Acepto los{" "}
                                <Text
                                    style={styles.checkboxLink}
                                    onPress={() => {
                                        setShowTermsModal(true);
                                    }}
                                >
                                    Términos y Condiciones
                                </Text>{" "}
                                para usar la app
                            </Text>
                        </TouchableOpacity>

                        {/* Botón Registrarse */}
                        <TouchableOpacity
                            style={[styles.registerButton, loading && { opacity: 0.7 }]}
                            activeOpacity={0.85}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.textOnPrimary} />
                            ) : (
                                <Text style={styles.registerButtonText}>Crear cuenta ahora</Text>
                            )}
                        </TouchableOpacity>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
                            <TouchableOpacity onPress={() => router.replace("/(auth)/login")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Text style={styles.footerLink}>Inicia Sesión</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>

            {/* ── MODAL TÉRMINOS Y CONDICIONES ── */}
            <Modal
                visible={showTermsModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowTermsModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Términos y Condiciones</Text>
                        </View>
                        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalText}>
                                ¡Bienvenido a Analitika! Al utilizar nuestra aplicación, aceptas las siguientes condiciones:
                                {"\n\n"}
                                1. Uso de la plataforma{"\n"}
                                Analitika proporciona herramientas para la gestión y seguimiento de enlaces en campañas de marketing. No se permite el uso de la plataforma para fines ilícitos, malintencionados o de spam.
                                {"\n\n"}
                                2. Privacidad y Seguridad de datos{"\n"}
                                Nos comprometemos a proteger la información que registres, incluyendo las métricas de tus campañas. No venderemos ni compartiremos tus datos con terceros sin tu consentimiento expreso.
                                {"\n\n"}
                                3. Responsabilidad del Usuario{"\n"}
                                Eres el único responsable del contenido de las campañas y de los enlaces que compartas a través de nuestra plataforma. Analitika no se responsabiliza por enlaces a sitios maliciosos creados por los usuarios.
                                {"\n\n"}
                                4. Disponibilidad del Servicio{"\n"}
                                Haremos nuestro mejor esfuerzo para garantizar que el servicio esté disponible 24/7, pero no nos responsabilizamos por caídas temporales del servidor o pérdidas de datos por fuerza mayor.
                                {"\n\n"}
                                5. Modificaciones{"\n"}
                                Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos de antemano sobre cualquier cambio significativo.
                            </Text>
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.modalAcceptButton}
                            onPress={() => {
                                setAcceptedTerms(true);
                                setShowTermsModal(false);
                            }}
                        >
                            <Text style={styles.modalAcceptText}>Aceptar Términos</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowTermsModal(false)}
                        >
                            <Text style={styles.modalCloseText}>Cerrar sin aceptar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPage, // Fondo blanco
    },

    /* ── HEADER ── */
    header: {
        height: height * 0.28 - 60,
        backgroundColor: colors.bgPage,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    blobTopLeft: {
        position: "absolute",
        top: -40,
        left: -30,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: colors.bgBlob,
    },
    logoWrapper: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    logoImage: {
        width: 300,
        height: 400,

    },
    backButton: {
        position: "absolute",
        left: spacing.lg,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.5)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
    },

    /* ── BOTTOM SHEET ── */
    sheet: {
        flex: 1,
        backgroundColor: colors.bgAccent, // Lavanda card background
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: spacing.xxl,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
        overflow: "hidden",
    },
    scrollContent: {
        paddingTop: spacing.xxl,
    },
    sheetHeader: {
        alignItems: "center",
        marginBottom: spacing.xxl,
    },
    title: {
        fontSize: typography.size4xl,
        fontWeight: typography.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.sizeMd,
        color: colors.textSecondary,
        textAlign: "center",
    },

    form: {
        width: "100%",
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: typography.sizeSm,
        fontWeight: typography.semibold,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        marginLeft: 4,
    },
    optional: {
        fontWeight: "normal",
        color: palette.purple3,
    },
    input: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: radii.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: Platform.OS === "ios" ? 16 : 14,
        fontSize: typography.sizeMd,
        color: colors.textPrimary,
    },

    /* Checkbox */
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.xl,
        marginTop: spacing.sm,
        paddingHorizontal: 4,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#CBD5E1",
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.md,
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkboxLabel: {
        flex: 1,
        fontSize: typography.sizeSm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    checkboxLink: {
        color: colors.primary,
        fontWeight: typography.bold,
    },

    /* Botón */
    registerButton: {
        backgroundColor: colors.primary,
        borderRadius: radii.pill,
        paddingVertical: 18,
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: spacing.xxl,
    },
    registerButtonText: {
        color: "#fff",
        fontSize: typography.sizeLg,
        fontWeight: typography.bold,
    },

    /* Footer */
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    footerText: {
        fontSize: typography.sizeMd,
        color: colors.textSecondary,
    },
    footerLink: {
        fontSize: typography.sizeMd,
        color: colors.primary,
        fontWeight: typography.bold,
    },

    /* Modal Términos y Condiciones */
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: colors.bgPage,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: spacing.xxl,
        maxHeight: height * 0.85,
    },
    modalHeader: {
        alignItems: "center",
        marginBottom: spacing.lg,
    },
    modalTitle: {
        fontSize: typography.sizeXl,
        fontWeight: typography.bold,
        color: colors.textPrimary,
        textAlign: "center",
    },
    modalScroll: {
        marginBottom: spacing.xl,
    },
    modalText: {
        fontSize: typography.sizeSm,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    modalAcceptButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: radii.pill,
        alignItems: "center",
        marginBottom: spacing.sm,
    },
    modalAcceptText: {
        color: "#fff",
        fontSize: typography.sizeMd,
        fontWeight: typography.bold,
    },
    modalCloseButton: {
        paddingVertical: 16,
        alignItems: "center",
    },
    modalCloseText: {
        color: colors.textSecondary,
        fontSize: typography.sizeMd,
        fontWeight: typography.bold,
    },
});
