import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../src/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function RootStack() {
    const { isDark } = useTheme();
    return (
        <>
            <StatusBar style={isDark ? "light" : "dark"} />
            <Stack screenOptions={{ headerShown: false }} />
        </>
    );
}

export default function Layout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <RootStack />
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}