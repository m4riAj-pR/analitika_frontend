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
import { usersApi, personsApi } from '../../src/services/api';
import { removeToken } from '../../src/services/api/client';
import { colors, palette, radii, shadows, spacing, typography } from '../../src/theme/colors';
import AccountAvatar from '../../src/components/AccountAvatar';
import { useTheme } from '../../src/ThemeContext';

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, toggleTheme, colors: themeColors, isDark } = useTheme();

  const { profile, loading, saving, updateProfile } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  // Gestión de empleados (solo para Owners)
  const [isManagementEnabled, setIsManagementEnabled] = useState(false);
  const [managers, setManagers] = useState<any[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newManager, setNewManager] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
      });

      if (profile.id_role === 2) {
        fetchManagers();
      }
    }
  }, [profile]);

  const fetchManagers = async () => {
    try {
      setLoadingManagers(true);
      const allUsers: any = await usersApi.getUsers();
      // Filtrar solo los managers (rol 3) de la misma empresa
      const filtered = allUsers.filter((u: any) => u.id_role === 3);
      setManagers(filtered);
    } catch (err) {
      Alert.alert("Error", "No se pudieron cargar los empleados.");
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleAddManager = async () => {
    if (!newManager.name || !newManager.email || !newManager.password) {
      Alert.alert('Campos requeridos', 'Por favor completa los campos obligatorios.');
      return;
    }

    try {
      setLoadingManagers(true);
      // 1. Crear persona
      const personRes: any = await personsApi.createPerson({
        name: newManager.name.trim(),
        lastname: newManager.lastname.trim(),
        email: newManager.email.trim(),
        phone: '',
      });

      if (personRes && personRes.id_person) {
        // 2. Crear usuario con rol 3 (Management)
        await usersApi.createUser({
          id_person: personRes.id_person,
          id_role: 3,
          id_company: profile.id_company,
          password_hash: newManager.password, // El backend hace el hash
        });

        Alert.alert('Éxito', 'Manager registrado correctamente.');
        setShowAddModal(false);
        setNewManager({ name: '', lastname: '', email: '', password: '' });
        fetchManagers();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo registrar al manager.');
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleDeleteManager = (id_user: number) => {
    Alert.alert('Eliminar Manager', '¿Estás seguro de que quieres eliminar a este empleado?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Eliminar', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await usersApi.deleteUser(id_user);
            fetchManagers();
          } catch (err) {
            Alert.alert('Error', 'No se pudo eliminar al usuario.');
          }
        }
      }
    ]);
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
            <Text style={[styles.userName, { color: themeColors.textPrimary }]}>{fullName}</Text>
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
              <View>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Correo Electrónico</Text>
                <Text style={[styles.infoValue, { color: themeColors.textPrimary }]}>{profile?.email || 'ejemplo@correo.com'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIconBox, { backgroundColor: isDark ? '#1E293B' : '#EDE9FE' }]}>
                <Ionicons name="call" size={20} color={themeColors.primary} />
              </View>
              <View>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Teléfono</Text>
                <Text style={[styles.infoValue, { color: themeColors.textPrimary }]}>{profile?.phone || 'No registrado'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIconBox, { backgroundColor: isDark ? '#1E293B' : '#EDE9FE' }]}>
                <Ionicons name="business" size={20} color={themeColors.primary} />
              </View>
              <View>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Empresa</Text>
                <Text style={[styles.infoValue, { color: themeColors.textPrimary }]}>
                  {profile?.company_name || 'Empresa no encontrada'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

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

      {/* SECCIÓN GESTIÓN DE EMPLEADOS (Solo para Owners) */}
      {profile?.id_role === 2 && (
        <View style={[styles.managementSection, { backgroundColor: themeColors.bgCard }]}>
          <View style={styles.managementHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>Gestión de Empleados</Text>
              <Text style={[styles.sectionSubtitle, { color: themeColors.textSecondary }]}>Permitir añadir managements</Text>
            </View>
            <Switch
              value={isManagementEnabled}
              onValueChange={setIsManagementEnabled}
              trackColor={{ false: '#CBD5E1', true: themeColors.primary }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : isManagementEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          {isManagementEnabled && (
            <View style={[styles.managementList, { borderTopColor: isDark ? '#334155' : '#F1F5F9' }]}>
              <View style={styles.listHeader}>
                <Text style={[styles.listTitle, { color: themeColors.textPrimary }]}>Managements ({managers.length})</Text>
                <TouchableOpacity 
                  style={[styles.addBtn, { backgroundColor: themeColors.primary }]}
                  onPress={() => setShowAddModal(true)}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.addBtnText}>Añadir</Text>
                </TouchableOpacity>
              </View>

              {loadingManagers ? (
                <ActivityIndicator color={themeColors.primary} style={{ marginVertical: 20 }} />
              ) : managers.length === 0 ? (
                <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No hay managers registrados aún.</Text>
              ) : (
                managers.map((m) => (
                  <View key={m.id_user} style={[styles.managerItem, { backgroundColor: isDark ? '#334155' : '#F8FAFC' }]}>
                    <View style={[styles.managerAvatar, { backgroundColor: isDark ? '#475569' : '#DDD6FE' }]}>
                      <Text style={[styles.managerAvatarText, { color: themeColors.primary }]}>
                        {(m.name?.[0] || 'M').toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.managerInfo}>
                      <Text style={[styles.managerName, { color: themeColors.textPrimary }]}>{m.name || 'Manager'}</Text>
                      <Text style={[styles.managerEmail, { color: themeColors.textSecondary }]}>{m.email}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => handleDeleteManager(m.id_user)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      )}

      {/* MODAL PARA AÑADIR MANAGER */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.bgCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.primary }]}>Nuevo Management</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={themeColors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.modalInputGroup}>
                <Text style={[styles.modalLabel, { color: themeColors.textSecondary }]}>Nombre</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary, borderColor: themeColors.borderInput }]}
                  value={newManager.name}
                  onChangeText={(t) => setNewManager({...newManager, name: t})}
                  placeholder="Nombre del empleado"
                  placeholderTextColor={themeColors.textMuted}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={[styles.modalLabel, { color: themeColors.textSecondary }]}>Apellido</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary, borderColor: themeColors.borderInput }]}
                  value={newManager.lastname}
                  onChangeText={(t) => setNewManager({...newManager, lastname: t})}
                  placeholder="Apellido"
                  placeholderTextColor={themeColors.textMuted}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={[styles.modalLabel, { color: themeColors.textSecondary }]}>Email</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary, borderColor: themeColors.borderInput }]}
                  value={newManager.email}
                  onChangeText={(t) => setNewManager({...newManager, email: t})}
                  placeholder="correo@ejemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={themeColors.textMuted}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={[styles.modalLabel, { color: themeColors.textSecondary }]}>Contraseña Inicial</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary, borderColor: themeColors.borderInput }]}
                  value={newManager.password}
                  onChangeText={(t) => setNewManager({...newManager, password: t})}
                  placeholder="Mínimo 6 caracteres"
                  secureTextEntry
                  placeholderTextColor={themeColors.textMuted}
                />
              </View>

              <TouchableOpacity 
                style={[styles.modalSubmitBtn, { backgroundColor: themeColors.primary }, loadingManagers && { opacity: 0.7 }]}
                onPress={handleAddManager}
                disabled={loadingManagers}
              >
                {loadingManagers ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Registrar Empleado</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
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
});
