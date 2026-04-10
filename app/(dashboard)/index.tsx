import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, palette, typography, spacing, radii } from "../../src/theme/colors";

export default function Dashboard() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoHalfCircle} />
                    <Text style={styles.logoText}>Analitika</Text>
                </View>
                <TouchableOpacity style={styles.profileButton}>
                    <Ionicons name="person" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Leads Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Visualizas tus leads</Text>
                    <View style={styles.barChartContainer}>
                        <View style={[styles.bar, { height: 160 }]} />
                        <View style={[styles.bar, { height: 110 }]} />
                        <View style={[styles.bar, { height: 70 }]} />
                        <View style={[styles.bar, { height: 40 }]} />
                    </View>
                </View>

                {/* Pie Chart Card */}
                <View style={styles.card}>
                    <View style={styles.pieChartContainer}>
                        <View style={styles.pieChartShapeWrapper}>
                             <View style={styles.pieChartShape} />
                        </View>
                    </View>
                </View>

                {/* Spacer for Floating TabBar */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPage,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },
    /* Logo */
    logoContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        position: "relative",
    },
    logoHalfCircle: {
        position: "absolute",
        left: -5,
        bottom: 0,
        width: 40,
        height: 40,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        backgroundColor: colors.bgBlob,
        zIndex: -1,
    },
    logoText: {
        fontSize: 26,
        fontWeight: "bold",
        color: colors.primary,
        letterSpacing: 0.5,
    },
    /* Profile */
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: palette.purple3,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
        gap: spacing.xl,
    },
    /* Cards */
    card: {
        backgroundColor: colors.bgAccent,
        borderRadius: 24,
        padding: spacing.xl,
        minHeight: 250,
    },
    cardTitle: {
        fontSize: typography.sizeLg,
        color: "#000000",
        fontWeight: typography.medium,
        marginBottom: spacing.xxl,
    },
    /* Bar Chart Placeholder */
    barChartContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 15,
        height: 160,
    },
    bar: {
        width: 40,
        backgroundColor: "#E2DDF0", // very light purple/grey
    },
    /* Pie Chart Placeholder */
    pieChartContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        minHeight: 180,
    },
    pieChartShapeWrapper: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: "#E2DDF0",
        overflow: "hidden",
        position: "relative",
    },
    pieChartShape: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 80,
        height: 80,
        backgroundColor: colors.bgAccent, // Cut out piece matching background
    },
});
