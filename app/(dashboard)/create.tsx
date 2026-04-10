import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, typography } from "../../src/theme/colors";

export default function CreateScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Create Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bgPage },
    text: { color: colors.textPrimary, fontSize: typography.sizeXl, fontWeight: "bold" },
});
