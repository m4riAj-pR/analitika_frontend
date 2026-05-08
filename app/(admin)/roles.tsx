import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AccountAvatar from '../../src/components/AccountAvatar';
import api from '../../src/services/api/client';
import { colors, radii, shadows, typography } from '../../src/theme/colors';
import { useTheme } from '../../src/ThemeContext';

interface UserRoleGroup {
  id_user: number;
  email: string;
  id_role: number;
  role_name: string;
}

export default function AdminRoles() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { companyId, companyName } = useLocalSearchParams();
  const { colors: themeColors, isDark } = useTheme();

  console.log("ROLES PARAMS:", { companyId, companyName });

  const [data, setData] = useState<{ owners: UserRoleGroup[], managements: UserRoleGroup[] }>({
    owners: [],
    managements: []
  });
  const [loading, setLoading] = useState(true);

  // Estado para edición
  const [selectedUser, setSelectedUser] = useState<UserRoleGroup | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [companyId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const url = companyId
        ? `/analitika/admin/users-by-role?id_company=${companyId}`
        : '/analitika/admin/users-by-role';

      console.log("FETCHING USERS FROM URL:", url);
      const response: any = await api.get(url);
      setData(response || { owners: [], managements: [] });
    } catch (error) {
      console.error('Error fetching users by role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (newRoleId: number) => {
    if (!selectedUser) return;

    if (selectedUser.id_role === newRoleId) {
      setSelectedUser(null);
      return;
    }

    try {
      setUpdating(true);
      await api.put(`/analitika/admin/users/${selectedUser.id_user}/role`, { id_role: newRoleId });
      Alert.alert('Éxito', 'Rol actualizado correctamente');
      setSelectedUser(null);
      fetchUsers(); // Recargar lista
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo actualizar el rol');
    } finally {
      setUpdating(false);
    }
  };

  const UserItem = ({ user }: { user: UserRoleGroup }) => (
    <View style={[styles.userCard, { backgroundColor: themeColors.bgCard, borderColor: isDark ? '#334155' : '#F1F3F5' }]}>
      <View style={styles.userInfo}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#334155' : '#F3F0FA' }]}>
          <Text style={[styles.avatarText, { color: themeColors.primary }]}>{user.email.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.userTextContainer}>
          <Text style={[styles.userEmail, { color: themeColors.textPrimary }]} numberOfLines={1}>{user.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: isDark ? '#0F172A' : '#F8F9FA' }]}>
            <Text style={[styles.roleBadgeText, { color: themeColors.textMuted }]}>{user.role_name}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.editButton, { backgroundColor: isDark ? '#334155' : '#F3F0FA' }]}
        onPress={() => setSelectedUser(user)}
      >
        <Feather name="edit-2" size={18} color={themeColors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: themeColors.bgPage }]}>
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => router.push('/(admin)/profile')}
        >
          <AccountAvatar size={42} />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: themeColors.primary }]}>Roles</Text>
        {companyName && (
          <View style={[styles.filterBadge, { backgroundColor: themeColors.bgCard, borderColor: isDark ? '#334155' : '#F1F3F5' }]}>
            <Ionicons name="business" size={12} color={themeColors.primary} />
            <Text style={[styles.filterText, { color: themeColors.primary }]} numberOfLines={1}>{companyName}</Text>
            <TouchableOpacity onPress={() => router.setParams({ companyId: '', companyName: '' })}>
              <Ionicons name="close-circle" size={16} color={themeColors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={themeColors.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: themeColors.primary }]} />
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Owners ({data.owners.length})</Text>
            </View>
            {data.owners.length > 0 ? (
              data.owners.map(user => <UserItem key={user.id_user} user={user} />)
            ) : (
              <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>No hay usuarios con este rol</Text>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: colors.secondary }]} />
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Management ({data.managements.length})</Text>
            </View>
            {data.managements.length > 0 ? (
              data.managements.map(user => <UserItem key={user.id_user} user={user} />)
            ) : (
              <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>No hay usuarios con este rol</Text>
            )}
          </View>

        </ScrollView>
      )}

      {/* MODAL DE EDICIÓN DE ROL */}
      <Modal
        visible={!!selectedUser}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.bgCard }]}>
            <Text style={[styles.modalTitle, { color: themeColors.primary }]}>Gestionar Acceso</Text>
            <Text style={[styles.modalSubtitle, { color: themeColors.textSecondary }]}>Selecciona el nuevo nivel de permisos para {selectedUser?.email}</Text>

            {updating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={themeColors.primary} />
                <Text style={[styles.updatingText, { color: themeColors.primary }]}>Actualizando rol...</Text>
              </View>
            ) : (
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[styles.roleOption, { backgroundColor: isDark ? '#1E293B' : '#F8F9FA' }, selectedUser?.id_role === 2 && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }]}
                  onPress={() => handleUpdateRole(2)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionHeader}>
                    <MaterialCommunityIcons
                      name="shield-account"
                      size={24}
                      color={selectedUser?.id_role === 2 ? '#FFF' : themeColors.primary}
                    />
                    <Text style={[styles.roleOptionText, { color: themeColors.primary }, selectedUser?.id_role === 2 && styles.activeOptionText]}>Owner</Text>
                  </View>
                  <Text style={[styles.optionDesc, { color: themeColors.textSecondary }, selectedUser?.id_role === 2 && styles.activeOptionText]}>
                    Acceso total a la configuración y gestión de la empresa.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleOption, { backgroundColor: isDark ? '#1E293B' : '#F8F9FA' }, selectedUser?.id_role === 3 && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }]}
                  onPress={() => handleUpdateRole(3)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionHeader}>
                    <MaterialCommunityIcons
                      name="account-cog"
                      size={24}
                      color={selectedUser?.id_role === 3 ? '#FFF' : themeColors.primary}
                    />
                    <Text style={[styles.roleOptionText, { color: themeColors.primary }, selectedUser?.id_role === 3 && styles.activeOptionText]}>Management</Text>
                  </View>
                  <Text style={[styles.optionDesc, { color: themeColors.textSecondary }, selectedUser?.id_role === 3 && styles.activeOptionText]}>
                    Gestión operativa y visualización de analíticas.
                  </Text>
                </TouchableOpacity>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setSelectedUser(null)}
                  >
                    <Text style={[styles.cancelButtonText, { color: themeColors.textSecondary }]}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFAFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    height: 80,
  },
  logoWrapper: {
    flex: 1,
    marginLeft: -10,
  },
  logoImage: {
    width: 180,
    height: 180,
  },
  avatarButton: {
    padding: 4,
    borderRadius: 22,
    backgroundColor: '#FFF',
    ...shadows.card,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: typography.size3xl,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    ...shadows.card,
    maxWidth: '65%',
  },
  filterText: {
    fontSize: typography.sizeSm,
    color: colors.primary,
    fontWeight: typography.semibold,
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  sectionTitle: {
    fontSize: typography.sizeLg,
    fontWeight: typography.bold,
    color: '#1A1A1A',
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    ...shadows.card,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F0FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  userTextContainer: {
    flex: 1,
    gap: 2,
  },
  userEmail: {
    fontSize: typography.sizeMd,
    color: '#333',
    fontWeight: typography.semibold,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#F8F9FA',
  },
  roleBadgeText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F0FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: typography.sizeSm,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 5, 40, 0.7)',
    justifyContent: 'flex-end', // Slide from bottom feel
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    ...shadows.card,
  },
  modalTitle: {
    fontSize: typography.size2xl,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: typography.sizeSm,
    color: colors.textBody,
    marginBottom: 28,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  updatingText: {
    fontSize: typography.sizeMd,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  optionsContainer: {
    width: '100%',
    gap: 16,
  },
  roleOption: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  roleOptionText: {
    fontSize: typography.sizeLg,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  activeOptionText: {
    color: '#FFF',
  },
  optionDesc: {
    fontSize: typography.sizeSm,
    color: '#666',
    marginLeft: 36,
    lineHeight: 18,
  },
  modalActions: {
    marginTop: 10,
  },
  cancelButton: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.sizeMd,
    color: '#666',
    fontWeight: typography.semibold,
  },
});
