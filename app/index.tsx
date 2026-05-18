import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Image, Platform, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
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
        {/* Diagrama tipo Torta (Pie Chart) - Superior Izquierda */}
        <View style={styles.blobTopLeft}>
          <Svg height="160" width="160" viewBox="0 0 100 100">
            <Path d="M50,50 L50,0 A50,50 0 0,1 100,50 Z" fill={palette.purple1} opacity={0.15} />
            <Path d="M50,50 L100,50 A50,50 0 0,1 50,100 Z" fill={palette.purple2} opacity={0.1} />
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
          style={{ width: 325, height: 325 }}
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
  /* Diagramas decorativos */
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
    transform: [{ rotate: "-15deg" }],
  },
  blobMidRight: {
    position: "absolute",
    bottom: 60,
    right: -10,
    width: 100,
    height: 80,
    transform: [{ rotate: "10deg" }],
  },
  blobTopCenter: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    width: 100,
    height: 60,
  },
});
