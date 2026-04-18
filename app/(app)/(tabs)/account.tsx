import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../../../src/theme/colors';

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleLogout = () => {
    // TODO: limpiar sesión y redirigir al login
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi cuenta</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={64} color={colors.primary} />
        </View>
      </View>

      {/* Nombre + editar */}
      <View style={styles.nameRow}>
        <Text style={styles.userName}>Nombre Usuario</Text>
        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="create-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Email */}
      <Text style={styles.email}>ejemploemail@gmail.com</Text>

      {/* Botón cerrar sesión */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Cerrar Sesion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPage,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  /* ── Header ── */
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxxl,
    paddingTop: spacing.md,
  },
  backBtn: {
    width: 36,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.size2xl,
    fontWeight: typography.bold,
    color: colors.primary,
  },

  /* ── Avatar ── */
  avatarWrapper: {
    marginBottom: spacing.xl,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Nombre ── */
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: typography.sizeXl,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  editBtn: {
    padding: 4,
  },

  /* ── Email ── */
  email: {
    fontSize: typography.sizeMd,
    color: colors.textBody,
    marginBottom: spacing.xxxl * 1.5,
  },

  /* ── Logout ── */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    gap: spacing.sm,
    width: '100%',
  },
  logoutIcon: {
    marginRight: 2,
  },
  logoutText: {
    color: '#fff',
    fontSize: typography.sizeLg,
    fontWeight: typography.bold,
  },
});
