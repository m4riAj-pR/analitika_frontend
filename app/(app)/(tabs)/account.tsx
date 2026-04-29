import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '../../../src/hooks/useProfile';
import { authApi } from '../../../src/services/api/auth';
import { removeToken } from '../../../src/services/api/client';
import { companiesApi } from '../../../src/services/api/companies';
import { colors, palette, radii, shadows, spacing, typography } from '../../../src/theme/colors';

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { profile, loading, saving, updateProfile } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyLoading, setCompanyLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    const loadCompany = async () => {
      const companyId = Number(profile?.id_company);

      if (!companyId) {
        setCompanyName('Empresa no encontrada');
        return;
      }

      try {
        setCompanyLoading(true);
        const response: any = await companiesApi.getAll();
        const companies = Array.isArray(response)
          ? response
          : response?.response || [];

        const company = companies.find((item: any) => Number(item.id_company) === companyId);
        setCompanyName(company?.name || 'Empresa no encontrada');
      } catch (error) {
        console.log('Error loading company for account:', error);
        setCompanyName('Empresa no encontrada');
      } finally {
        setCompanyLoading(false);
      }
    };

    loadCompany();
  }, [profile?.id_company]);

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          try { await authApi.logout(); } catch { }
          await removeToken();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
      });
      setIsEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  if (loading && !profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const fullName = profile?.first_name || profile?.last_name
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : 'Usuario';

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        {!isEditing && (
          <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
            <Ionicons name="pencil" size={16} color={colors.primary} />
            <Text style={styles.editBtnText}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CARD PRINCIPAL */}
      <View style={[styles.profileCard, shadows.card]}>
        
        {/* AVATAR TOP ABSOLUTE */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={54} color={colors.primary} />
          </View>
        </View>

        {isEditing ? (
          <View style={styles.formContainer}>
            <Text style={styles.cardTitle}>Editar Información</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={formData.first_name}
                onChangeText={(t) => setFormData({ ...formData, first_name: t })}
                placeholder="Tu nombre"
                placeholderTextColor={palette.purple3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Apellido</Text>
              <TextInput
                style={styles.input}
                value={formData.last_name}
                onChangeText={(t) => setFormData({ ...formData, last_name: t })}
                placeholder="Tu apellido"
                placeholderTextColor={palette.purple3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(t) => setFormData({ ...formData, phone: t })}
                placeholder="Ej. +57 300 000 0000"
                keyboardType="phone-pad"
                placeholderTextColor={palette.purple3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email <Text style={styles.readOnlyText}>(Solo lectura)</Text></Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={profile?.email || ''}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Empresa <Text style={styles.readOnlyText}>(Solo lectura)</Text></Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={companyLoading ? 'Cargando...' : companyName || 'Empresa no encontrada'}
                editable={false}
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsEditing(false)}
                disabled={saving}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.infoContainer}>
            <Text style={styles.userName}>{fullName}</Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>Administrador</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="mail" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Correo Electrónico</Text>
                <Text style={styles.infoValue}>{profile?.email || 'ejemplo@correo.com'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="call" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{profile?.phone || 'No registrado'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="business" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Empresa</Text>
                <Text style={styles.infoValue}>
                  {companyLoading ? 'Cargando...' : companyName || 'Empresa no encontrada'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {!isEditing && (
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      )}

    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPage,
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl * 2,
    alignItems: 'center',
  },
  
  /* HEADER */
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
    marginBottom: 60, // Espacio para que la tarjeta flote sobre el fondo
  },
  headerTitle: {
    fontSize: typography.size2xl,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    gap: 6,
  },
  editBtnText: {
    fontSize: typography.sizeSm,
    fontWeight: typography.bold,
    color: colors.primary,
  },

  /* CARD PRINCIPAL */
  profileCard: {
    width: '100%',
    backgroundColor: colors.bgCard,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: 60, // Espacio para el avatar superpuesto
    position: 'relative',
    marginBottom: spacing.xl,
  },
  
  /* AVATAR */
  avatarContainer: {
    position: 'absolute',
    top: -50,
    alignSelf: 'center',
    padding: 6,
    backgroundColor: colors.bgPage,
    borderRadius: 100,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },

  /* VISTA INFO MODO LECTURA */
  infoContainer: {
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    fontSize: typography.sizeXl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  badgeContainer: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    marginBottom: spacing.lg,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: typography.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: typography.sizeSm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: typography.sizeMd,
    color: colors.textPrimary,
    fontWeight: typography.medium,
  },

  /* MODO EDICIÓN */
  formContainer: {
    width: '100%',
  },
  cardTitle: {
    fontSize: typography.sizeLg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizeSm,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  readOnlyText: {
    fontWeight: 'normal',
    color: palette.purple3,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    fontSize: typography.sizeMd,
    color: colors.textPrimary,
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    color: palette.purple3,
  },
  formActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radii.pill,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontSize: typography.sizeMd,
    fontWeight: typography.bold,
  },
  saveBtn: {
    flex: 1.5,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radii.pill,
    ...shadows.card,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: typography.sizeMd,
    fontWeight: typography.bold,
  },

  /* LOGOUT BUTTON */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    width: '100%',
    gap: spacing.sm,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: typography.sizeLg,
    fontWeight: typography.bold,
  },
});
