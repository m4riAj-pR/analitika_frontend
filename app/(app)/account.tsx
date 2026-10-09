import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '../../src/hooks/useProfile';
import { authApi } from '../../src/services/api/auth';
import { usersApi } from '../../src/services/api';
import { removeToken } from '../../src/services/api/client';
import { colors, palette, radii, shadows, spacing, typography } from '../../src/theme/colors';
import AccountAvatar from '../../src/components/AccountAvatar';
import { useTheme } from '../../src/ThemeContext';

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, toggleTheme, colors: themeColors, isDark } = useTheme();

  const { profile, loading, saving, updateProfile } = useProfile();
  const isOwner = profile?.id_role === 1 || profile?.id_role === 2;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  // Cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleChangePassword = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      setChangingPassword(true);
      await usersApi.updateUser(profile.id_user, {
        password_hash: passwordForm.newPassword,
        id_person: profile.id_person,
        id_role: profile.id_role,
        username: profile.email.split('@')[0],
      });
      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
      setShowPasswordModal(false);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo actualizar la contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

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
      style={[styles.container, { paddingTop: insets.top, backgroundColor: themeColors.bgPage }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: themeColors.primary }]}>Mi Perfil</Text>
        {!isEditing && (
          <TouchableOpacity 
            style={[styles.editBtn, { backgroundColor: isDark ? '#1E293B' : '#EDE9FE' }]} 
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="pencil" size={16} color={themeColors.primary} />
            <Text style={[styles.editBtnText, { color: themeColors.primary }]}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CARD PRINCIPAL */}
      <View style={[styles.profileCard, shadows.card, { backgroundColor: themeColors.bgCard }]}>
        
        {/* AVATAR TOP ABSOLUTE */}
        <View style={[styles.avatarContainer, { backgroundColor: themeColors.bgPage }]}>
          <AccountAvatar size={100} />
        </View>

        {isEditing ? (
          <View style={styles.formContainer}>
            <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>Editar Información</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>Nombre</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary, borderColor: themeColors.borderInput }]}
                value={formData.first_name}
                onChangeText={(t) => setFormData({ ...formData, first_name: t })}
                placeholder="Tu nombre"
                placeholderTextColor={themeColors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>Apellido</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary, borderColor: themeColors.borderInput }]}
                value={formData.last_name}
                onChangeText={(t) => setFormData({ ...formData, last_name: t })}
                placeholder="Tu apellido"
                placeholderTextColor={themeColors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>Teléfono</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary, borderColor: themeColors.borderInput }]}
                value={formData.phone}
                onChangeText={(t) => setFormData({ ...formData, phone: t })}
                placeholder="Ej. +57 300 000 0000"
                keyboardType="phone-pad"
                placeholderTextColor={themeColors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>Email <Text style={styles.readOnlyText}>(Solo lectura)</Text></Text>
              <TextInput
                style={[styles.input, styles.inputDisabled, { backgroundColor: isDark ? '#334155' : '#F1F5F9', color: themeColors.textMuted }]}
                value={profile?.email || ''}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>Empresa <Text style={styles.readOnlyText}>(Solo lectura)</Text></Text>
              <TextInput
                style={[styles.input, styles.inputDisabled, { backgroundColor: isDark ? '#334155' : '#F1F5F9', color: themeColors.textMuted }]}
                value={profile?.company_name || 'Empresa no encontrada'}
                editable={false}
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
                onPress={() => setIsEditing(false)}
                disabled={saving}
              >
                <Text style={[styles.cancelBtnText, { color: themeColors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: themeColors.primary }, saving && { opacity: 0.7 }]}
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
            <Text style={[styles.userName, { color: themeColors.textPrimary }]} numberOfLines={2}>{fullName}</Text>
            <View style={[styles.badgeContainer, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
              <Text style={[styles.badgeText, { color: themeColors.textSecondary }]}>
                {profile?.role_name || (profile?.id_role === 1 ? 'Super Admin' : profile?.id_role === 2 ? 'Owner' : profile?.id_role === 3 ? 'Management' : 'Usuario')}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]} />

            <View style={styles.infoRow}>
              <View style={[styles.infoIconBox, { backgroundColor: isDark ? '#1E293B' : '#EDE9FE' }]}>
                <Ionicons name="mail" size={20} color={themeColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Correo Electrónico</Text>
                <Text style={[styles.infoValue, { color: themeColors.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">{profile?.email || 'ejemplo@correo.com'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIconBox, { backgroundColor: isDark ? '#1E293B' : '#EDE9FE' }]}>
                <Ionicons name="call" size={20} color={themeColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Teléfono</Text>
                <Text style={[styles.infoValue, { color: themeColors.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">{profile?.phone || 'No registrado'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIconBox, { backgroundColor: isDark ? '#1E293B' : '#EDE9FE' }]}>
                <Ionicons name="business" size={20} color={themeColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Empresa</Text>
                <Text style={[styles.infoValue, { color: themeColors.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
                  {profile?.company_name || 'Empresa no encontrada'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* SECCIÓN SEGURIDAD */}
      {!isEditing && (
        <View style={[styles.managementSection, { backgroundColor: themeColors.bgCard }]}>
          <View style={styles.managementHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>Seguridad</Text>
              <Text style={[styles.sectionSubtitle, { color: themeColors.textSecondary }]}>Actualiza tu acceso</Text>
            </View>
            <TouchableOpacity 
              style={[styles.editBtn, { backgroundColor: isDark ? '#1E293B' : '#EDE9FE' }]} 
              onPress={() => setShowPasswordModal(true)}
            >
              <Ionicons name="lock-closed" size={16} color={themeColors.primary} />
              <Text style={[styles.editBtnText, { color: themeColors.primary }]}>Cambiar Clave</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* SECCIÓN CONFIGURACIÓN (NUEVA - MODO OSCURO) */}
      <View style={[styles.managementSection, { backgroundColor: themeColors.bgCard }]}>
        <View style={styles.managementHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>Configuración</Text>
            <Text style={[styles.sectionSubtitle, { color: themeColors.textSecondary }]}>Modo Oscuro</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#CBD5E1', true: themeColors.primary }}
            thumbColor={Platform.OS === 'ios' ? '#fff' : isDark ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* MODAL CAMBIO DE CONTRASEÑA */}
      <Modal visible={showPasswordModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.bgCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.primary }]}>Cambiar contraseña</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color={themeColors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.modalInputGroup}>
                <Text style={[styles.modalLabel, { color: themeColors.textSecondary }]}>Nueva Contraseña</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary, borderColor: themeColors.borderInput }]}
                  value={passwordForm.newPassword}
                  onChangeText={(t) => setPasswordForm({...passwordForm, newPassword: t})}
                  placeholder="Mínimo 6 caracteres"
                  secureTextEntry
                  placeholderTextColor={themeColors.textMuted}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={[styles.modalLabel, { color: themeColors.textSecondary }]}>Confirmar Contraseña</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary, borderColor: themeColors.borderInput }]}
                  value={passwordForm.confirmPassword}
                  onChangeText={(t) => setPasswordForm({...passwordForm, confirmPassword: t})}
                  placeholder="Repite la contraseña"
                  secureTextEntry
                  placeholderTextColor={themeColors.textMuted}
                />
              </View>

              <TouchableOpacity 
                style={[styles.modalSubmitBtn, { backgroundColor: themeColors.primary }, changingPassword && { opacity: 0.7 }]}
                onPress={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Actualizar Contraseña</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    fontSize: 28,
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

  /* GESTIÓN DE EMPLEADOS */
  managementSection: {
    width: '100%',
    backgroundColor: colors.bgCard,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  managementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizeLg,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  sectionSubtitle: {
    fontSize: typography.sizeSm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  managementList: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: spacing.lg,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  listTitle: {
    fontSize: typography.sizeMd,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    gap: 4,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: typography.bold,
  },
  managerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
  },
  managerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  managerAvatarText: {
    color: colors.primary,
    fontWeight: typography.bold,
    fontSize: 16,
  },
  managerInfo: {
    flex: 1,
  },
  managerName: {
    fontSize: typography.sizeMd,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  managerEmail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  deleteBtn: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginVertical: 20,
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  modalForm: {
    marginBottom: spacing.xxl,
  },
  modalInputGroup: {
    marginBottom: spacing.lg,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  modalSubmitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radii.pill,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.card,
  },
  modalSubmitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: typography.bold,
  },

  /* CUENTAS PUBLICITARIAS */
  connectMetaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
  },
  connectMetaBtnText: {
    color: '#fff',
    fontSize: typography.sizeSm,
    fontWeight: typography.semibold,
  },
  adEmptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  adEmptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  adEmptyTitle: {
    fontSize: typography.sizeMd,
    fontWeight: typography.bold,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  adEmptySubtitle: {
    fontSize: typography.sizeSm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  adEmptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    ...shadows.card,
  },
  adEmptyCtaText: {
    color: '#fff',
    fontSize: typography.sizeSm,
    fontWeight: typography.bold,
  },
  adConnectionsList: {
    borderTopWidth: 1,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  adConnectionCard: {
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  adConnectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  providerBadge: {
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
  },
  providerBadgeText: {
    fontSize: typography.sizeXs,
    fontWeight: typography.bold,
    letterSpacing: 0.5,
  },
  adStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
  },
  adStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  adStatusText: {
    fontSize: typography.sizeXs,
    fontWeight: typography.bold,
  },
  adAccountName: {
    fontSize: typography.sizeMd,
    fontWeight: typography.bold,
    marginTop: spacing.xs,
  },
  adAccountId: {
    fontSize: typography.sizeXs,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  syncText: {
    fontSize: typography.sizeXs,
  },
  syncErrorMessage: {
    fontSize: typography.sizeXs,
    marginTop: 4,
    fontStyle: 'italic',
  },
  adCardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: spacing.sm,
  },
  syncBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.xs + 2,
  },
  syncBtnText: {
    fontSize: typography.sizeSm,
    fontWeight: typography.semibold,
  },
  disconnectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    borderRadius: radii.md,
    paddingVertical: spacing.xs + 2,
  },
  disconnectBtnText: {
    color: '#EF4444',
    fontSize: typography.sizeSm,
    fontWeight: typography.semibold,
  },
});
