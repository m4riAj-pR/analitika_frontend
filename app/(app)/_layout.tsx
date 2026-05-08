import { Stack, Redirect } from 'expo-router';
import { useProfile } from '../../src/hooks/useProfile';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../../src/theme/colors';

export default function AppLayout() {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Si no hay perfil o es un Super Admin (que debería estar en /(admin)), redirigir
  // Permitir roles 2 (Owner) y 3 (Management)
  if (!profile) {
    return <Redirect href="/(auth)/login" />;
  }

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
