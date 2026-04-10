import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, palette, radii, sharedStyles, spacing, typography } from "../../src/theme/colors";

export default function Register() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [form, setForm] = useState({
        nombres: "",
        apellidos: "",
        empresa: "",
        email: "",
        password: "",
    });
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
                {/* Top Left Shape */}
                <View style={styles.topLeftShape}>
                    <View style={styles.topLeftShapeInner} />
                </View>

                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={28} color={colors.primary} />
                </TouchableOpacity>

                {/* Logo Text Title */}
                <View style={styles.logoContainer}>
                    <Image source={require("../../assets/images/icon.png")} style={styles.logoImage} resizeMode="contain" />
                </View>
            </View>

            <View style={styles.bottomSheet}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Text style={styles.title}>Crear Cuenta</Text>

                    <View style={styles.formContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombres*"
                            placeholderTextColor={palette.purple2}
                            value={form.nombres}
                            onChangeText={(text) => setForm({ ...form, nombres: text })}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Apellidos*"
                            placeholderTextColor={palette.purple2}
                            value={form.apellidos}
                            onChangeText={(text) => setForm({ ...form, apellidos: text })}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Nombre de la empresa"
                            placeholderTextColor={palette.purple2}
                            value={form.empresa}
                            onChangeText={(text) => setForm({ ...form, empresa: text })}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Correo Electronico *"
                            placeholderTextColor={palette.purple2}
                            value={form.email}
                            onChangeText={(text) => setForm({ ...form, email: text })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña *"
                            placeholderTextColor={palette.purple2}
                            value={form.password}
                            onChangeText={(text) => setForm({ ...form, password: text })}
                            secureTextEntry
                        />

                        {/* Checkbox Terminos */}
                        <View style={styles.checkboxContainer}>
                            <TouchableOpacity
                                style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}
                                onPress={() => setAcceptedTerms(!acceptedTerms)}
                            >
                                {acceptedTerms && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                            </TouchableOpacity>
                            <Text style={styles.checkboxLabel}>
                                Acepta los <Text style={styles.linkTextInline}>Terminos y Condiciones</Text> para usar la app *
                            </Text>
                        </View>

                        <TouchableOpacity 
                            style={[sharedStyles.primaryButton, styles.registerButton]}
                            onPress={() => router.replace("/(dashboard)")}
                        >
                            <Text style={sharedStyles.primaryButtonText}>Registrarse</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.dividerContainer}>
                        <View style={sharedStyles.dividerLine} />
                        <View style={[sharedStyles.dividerDot, { backgroundColor: "transparent", borderColor: colors.primary, borderWidth: 1 }]} />
                        <View style={sharedStyles.dividerLine} />
                    </View>

                    <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                        <Text style={styles.footerText}>
                            ¿Ya tienes Cuenta ?, <Text style={styles.linkText}>Inicia Sesión</Text>
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
        backgroundColor: colors.bgPage,
    },
    headerContainer: {
        flex: 0.2, // Smaller header than login to fit the large form
        backgroundColor: colors.bgPage,
        justifyContent: "flex-end",
        position: "relative",
    },
    /* Top Left Shape */
    topLeftShape: {
        position: "absolute",
        top: -40,
        left: 20,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.bgBlob,
        overflow: "hidden",
        zIndex: 1,
    },
    topLeftShapeInner: {
        position: "absolute",
        top: -20,
        left: "40%",
        width: 140,
        height: 140,
        backgroundColor: palette.purple3,
        transform: [{ rotate: "15deg" }],
    },
    /* Back Button */
    backButton: {
        position: "absolute",
        top: 60,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    /* Logo */
    logoContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        zIndex: 10,
    },
    logoImage: {
        width: 150,
        height: 150,
    },
    /* Bottom Sheet */
    bottomSheet: {
        flex: 0.8,
        backgroundColor: colors.bgAccent,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: spacing.xxl,
        paddingTop: spacing.xxxl,
    },
    scrollContent: {
        paddingBottom: spacing.xxxl,
    },
    title: {
        fontSize: typography.size3xl,
        fontWeight: "bold",
        color: colors.primary,
        textAlign: "center",
        marginBottom: spacing.xxl,
    },
    formContainer: {
        gap: spacing.lg,
    },
    input: {
        backgroundColor: colors.bgInput,
        borderRadius: radii.md,
        paddingHorizontal: spacing.xl,
        paddingVertical: 18,
        fontSize: typography.sizeMd,
        color: colors.primary,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    /* Checkbox */
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
        paddingHorizontal: 5,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: radii.sm,
        backgroundColor: colors.bgInput,
        borderWidth: 1,
        borderColor: colors.borderDivider,
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.md,
    },
    checkboxActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkboxLabel: {
        flex: 1,
        fontSize: typography.sizeSm,
        color: colors.textBody,
        lineHeight: 20,
    },
    linkTextInline: {
        color: "#2D9CFF",
    },
    registerButton: {
        marginTop: spacing.md,
    },
    /* Divider */
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: spacing.xl,
        paddingHorizontal: spacing.xl,
    },
    /* Footer */
    footerText: {
        ...sharedStyles.footerText,
        color: colors.textBody,
        marginBottom: 20,
    },
    linkText: {
        color: "#2D9CFF",
        fontWeight: typography.bold,
    },
});
