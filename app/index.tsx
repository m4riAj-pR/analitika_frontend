import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, palette, typography } from "../src/theme/colors";
import { useTheme } from "../src/ThemeContext";
import { me } from "../src/services/api/auth";

export default function Index() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors: themeColors, isDark } = useTheme();

  const step1Opacity = useRef(new Animated.Value(0)).current;
  const step2Opacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      try {
        // Intentamos validar el token actual con el servidor
        // Si el token es inválido o expiró, authService.me() lanzará un error 401
        // y el cliente API limpiará automáticamente el almacenamiento.
        const user = await me();
        
        // Redirección basada en el rol
        let nextRoute = "/(auth)/login";
        if (user) {
          if (user.id_role === 1) {
            nextRoute = "/(admin)/companies";
          } else {
            nextRoute = "/(app)/(tabs)/dashboard";
          }
        }

        Animated.sequence([
          // Animación de Logo
          Animated.timing(step1Opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.delay(1000),
          Animated.timing(step1Opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          // Animación de Texto de Bienvenida
          Animated.timing(step2Opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.delay(1500),
          // Salida de pantalla
          Animated.timing(screenOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          router.replace(nextRoute as any);
        });
      } catch (error: any) {
        // Si hay un error de autenticación (401), el cliente ya limpió el token.
        // Si es otro error (como red), me() internamente intenta devolver el caché.
        console.log("Session validation failed or no session:", error?.message);
        router.replace("/(auth)/login");
      }
    };

    checkSessionAndRedirect();
  }, [router, step1Opacity, step2Opacity, screenOpacity]);

  return (
    <Animated.View style={[styles.mainWrapper, { opacity: screenOpacity, backgroundColor: themeColors.primary }]}>
      {/* Paso 2: Plantilla Actual */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: step2Opacity,
            backgroundColor: themeColors.bgPage,
            paddingTop: insets.top,
          },
        ]}
      >
        <View style={styles.topLeftShape}>
          <View style={styles.topLeftShapeInner} />
        </View>

        <View style={styles.middleRightShape} />

        <View style={styles.bottomLeftShape}>
          <View style={styles.bottomLeftShapeInner} />
        </View>

        <View style={styles.bottomRightShape} />

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: themeColors.textPrimary }]}>Bienvenid@ a{"\n"}Analitika!</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Una app para seguimiento y{"\n"}
            consulta de estadisticas para{"\n"}
            campañas digitales
          </Text>
        </View>
      </Animated.View>

      {/* Paso 1: Fondo Morado con Logo */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: step1Opacity,
            backgroundColor: themeColors.primary,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Image
          source={require("../assets/images/icon_negative.png")}
          style={{ width: 300, height: 300 }}
          resizeMode="contain"
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: colors.primary, // Prevents flashing white behind step 1
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    zIndex: 10,
  },
  title: {
    fontSize: typography.size4xl,
    fontWeight: "bold",
    color: colors.textPrimary,
    textAlign: "center",
    lineHeight: 38,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: typography.sizeLg,
    color: colors.textBody,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
  },
  /* Top Left Shape */
  topLeftShape: {
    position: "absolute",
    top: -50,
    left: 30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.bgBlob,
    overflow: "hidden",
    zIndex: 1,
  },
  topLeftShapeInner: {
    position: "absolute",
    top: -30,
    left: "40%",
    width: 160,
    height: 160,
    backgroundColor: palette.purple3,
    transform: [{ rotate: "15deg" }],
  },
  /* Middle Right Shape */
  middleRightShape: {
    position: "absolute",
    top: "38%",
    right: 20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.bgBlob,
    zIndex: 0,
  },
  /* Bottom Left Shape */
  bottomLeftShape: {
    position: "absolute",
    bottom: 180,
    left: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.bgBlob,
    overflow: "hidden",
    zIndex: 1,
  },
  bottomLeftShapeInner: {
    position: "absolute",
    bottom: "40%",
    right: -20,
    width: 130,
    height: 130,
    backgroundColor: palette.purple3,
    transform: [{ rotate: "25deg" }],
  },
  /* Bottom Right Shape */
  bottomRightShape: {
    position: "absolute",
    bottom: -30,
    right: 40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.bgBlob,
    zIndex: 1,
  },
});
