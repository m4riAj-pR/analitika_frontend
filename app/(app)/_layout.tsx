import { Stack, Redirect } from 'expo-router';
import { useAuthGuard } from '../../src/hooks/useAuthGuard';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../../src/theme/colors';

export default function AppLayout() {
  const { isValidating, isAuthorized, profile } = useAuthGuard();

  if (isValidating) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Token inválido o sin sesión → login
  if (!isAuthorized || !profile) {
    return <Redirect href="/(auth)/login" />;
  }

  // Super Admin → redirigir al panel de administración
  if (profile.id_role === 1) {
    return <Redirect href="/(admin)/companies" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="create" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
