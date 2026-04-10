import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, palette, radii, sharedStyles, spacing, typography } from "../../src/theme/colors";

const { width, height } = Dimensions.get("window");

export default function Login() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

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

                {/* Top Right Shape */}
                <View style={styles.topRightShape}>
                    <View style={styles.topRightShapeInner} />
                </View>

                {/* Logo Text Title */}
                <View style={styles.logoContainer}>
                    <Image source={require("../../assets/images/icon.png")} style={styles.logoImage} resizeMode="contain" />
                </View>
            </View>

            <View style={styles.bottomSheet}>
                <Text style={styles.title}>Inicio de Sesion</Text>

                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Correo Electronico o nombre de la empresa *"
                        placeholderTextColor={palette.purple2}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña *"
                        placeholderTextColor={palette.purple2}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[sharedStyles.primaryButton, styles.loginButton]}
                        onPress={() => router.replace("/(dashboard)")}
                    >
                        <Text style={sharedStyles.primaryButtonText}>Iniciar Sesion</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.dividerContainer}>
                    <View style={sharedStyles.dividerLine} />
                    <View style={[sharedStyles.dividerDot, { backgroundColor: "transparent", borderColor: colors.primary, borderWidth: 1 }]} />
                    <View style={sharedStyles.dividerLine} />
                </View>

                <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                    <Text style={styles.footerText}>
                        ¿No tienes cuenta ?, <Text style={styles.linkText}>Registrate Gratis</Text>
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
    headerContainer: {
        flex: 0.45,
        backgroundColor: colors.bgPage,
        justifyContent: "flex-end",
        position: "relative",
        overflow: "hidden", // Just to contain background blobs
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
    /* Top Right Shape */
    topRightShape: {
        position: "absolute",
        top: "15%",
        right: -30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.bgBlob,
        overflow: "hidden",
        zIndex: 1,
    },
    topRightShapeInner: {
        position: "absolute",
        bottom: -30,
        right: "0%",
        width: 120,
        height: 120,
        backgroundColor: palette.purple3,
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
        marginBottom: 40,
        zIndex: 10,
    },
    logoImage: {
        width: 300,
        height: 300,
        marginTop: 180,
    },
    /* Bottom Sheet */
    bottomSheet: {
        flex: 0.55,
        backgroundColor: colors.bgAccent,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: spacing.xxl,
        paddingTop: spacing.xxxl,
        paddingBottom: spacing.xxl,
    },
    title: {
        fontSize: typography.size3xl,
        fontWeight: "bold",
        color: colors.primary,
        textAlign: "center",
        marginBottom: spacing.xxxl,
    },
    formContainer: {
        gap: spacing.xl,
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
    loginButton: {
        marginTop: spacing.xl, // specific spacing adjustments 
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
    },
    linkText: {
        color: "#2D9CFF", // Exact blue from the image, bypassing theme since it wasn't defined
        fontWeight: typography.bold,
    },
});
