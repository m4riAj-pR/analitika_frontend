import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { authApi } from '../../src/services/api/auth';

export default function AdminProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    await authApi.logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <Ionicons name="person-circle" size={100} color={colors.primary} />
        <Text style={styles.adminName}>Super Admin</Text>
        <Text style={styles.adminRole}>Global Administrator</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#FFF" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 24 },
  header: { marginBottom: 40, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.primary },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#F3F0FA',
    borderRadius: 24,
    padding: 40,
    marginBottom: 40,
  },
  adminName: { fontSize: 22, fontWeight: '700', color: '#1E293B', marginTop: 15 },
  adminRole: { fontSize: 16, color: '#64748B', marginTop: 5 },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { color: '#FFF', fontSize: 18, fontWeight: '600', marginLeft: 10 },
});
