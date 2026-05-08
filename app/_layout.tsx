import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../src/ThemeContext";
import { StatusBar } from "expo-status-bar";

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
        <ThemeProvider>
            <RootStack />
        </ThemeProvider>
    );
}