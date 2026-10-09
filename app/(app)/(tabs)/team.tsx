import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '@/src/hooks/useProfile';
import { usersApi, personsApi } from '@/src/services/api';
import { colors, radii, shadows, spacing, typography } from '@/src/theme/colors';
import { useTheme } from '@/src/ThemeContext';
import AccountAvatar from '@/src/components/AccountAvatar';

export default function TeamManagementScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useProfile();
  const { colors: themeColors, isDark } = useTheme();

  const isOwner = profile?.id_role === 1 || profile?.id_role === 2;
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal para agregar empleado
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
  });

  const fetchManagers = useCallback(async () => {
    if (!isOwner) return;
    try {
      setLoading(true);
      const allUsers: any = await usersApi.getUsers();
      const list = Array.isArray(allUsers) ? allUsers : (allUsers?.response || []);
      // Filtrar solo Managers (rol 3) o del equipo de la empresa
      const filtered = list.filter((u: any) => u.id_role === 3);
      setManagers(filtered);
    } catch (err) {
      console.log('Error fetching team:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isOwner]);

  useFocusEffect(
    useCallback(() => {
      fetchManagers();
    }, [fetchManagers])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchManagers();
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name.trim() || !newEmployee.email.trim() || !newEmployee.password.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa los datos del nuevo empleado.');
      return;
    }

    try {
      setAdding(true);
      // 1. Crear persona
      const personRes: any = await personsApi.createPerson({
        name: newEmployee.name.trim(),
        lastname: newEmployee.lastname.trim(),
        email: newEmployee.email.trim(),
        phone: '',
      });

      if (personRes && (personRes.id_person || personRes.id)) {
        const personId = personRes.id_person || personRes.id;
        // 2. Crear usuario con rol 3 (Management)
        await usersApi.createUser({
          id_person: personId,
          id_role: 3,
          id_company: profile?.id_company || 1,
          password_hash: newEmployee.password,
        });

        Alert.alert('Éxito', 'Empleado (Management) registrado correctamente.');
        setShowAddModal(false);
        setNewEmployee({ name: '', lastname: '', email: '', password: '' });
        fetchManagers();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo registrar al empleado.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteEmployee = (id_user: number, name: string) => {
    Alert.alert(
      'Revocar Acceso',
      `¿Estás seguro de que deseas revocar el acceso a "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Revocar',
          style: 'destructive',
          onPress: async () => {
            try {
              await usersApi.deleteUser(id_user);
              fetchManagers();
            } catch (err) {
              Alert.alert('Error', 'No se pudo revocar el acceso al usuario.');
            }
          },
        },
      ]
    );
  };

  const filteredManagers = managers.filter(m => {
    const q = searchQuery.toLowerCase();
    const nameStr = `${m.name || ''} ${m.lastname || ''} ${m.email || ''}`.toLowerCase();
    return nameStr.includes(q);
  });

  if (!isOwner) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: themeColors.bgPage, justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <View style={[styles.restrictedCircle, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
          <Ionicons name="shield-checkmark-outline" size={48} color={themeColors.primary} />
        </View>
        <Text style={[styles.restrictedTitle, { color: themeColors.textPrimary }]}>Acceso Exclusivo de Propietario</Text>
        <Text style={[styles.restrictedSub, { color: themeColors.textSecondary }]}>
          La gestión de empleados y asignación de roles está reservada al administrador principal de la cuenta.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: themeColors.bgPage }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: themeColors.primary }]}>Gestión de Equipo</Text>
          <Text style={[styles.headerSub, { color: themeColors.textSecondary }]}>
            Colaboradores y Managements
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addTopBtn, { backgroundColor: themeColors.primary }]}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="person-add" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.addTopBtnText}>Añadir</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBox, { backgroundColor: themeColors.bgCard, borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
          <Ionicons name="search" size={20} color={themeColors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.textPrimary }]}
            placeholder="Buscar por nombre o correo..."
            placeholderTextColor={themeColors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={themeColors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Lista */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[themeColors.primary]} />}
      >
        <View style={styles.statsSummary}>
          <View style={[styles.summaryCard, { backgroundColor: themeColors.bgCard }]}>
            <Ionicons name="people" size={24} color={themeColors.primary} />
            <Text style={[styles.summaryNum, { color: themeColors.textPrimary }]}>{managers.length}</Text>
            <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>Managements Activos</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: themeColors.bgCard }]}>
            <Ionicons name="key" size={24} color="#10B981" />
            <Text style={[styles.summaryNum, { color: themeColors.textPrimary }]}>Rol 3</Text>
            <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>Permisos de Operación</Text>
          </View>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={themeColors.primary} style={{ marginTop: 40 }} />
        ) : filteredManagers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={56} color={themeColors.textMuted} />
            <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>Sin colaboradores asignados</Text>
            <Text style={[styles.emptySub, { color: themeColors.textSecondary }]}>
              {searchQuery ? 'No se encontraron resultados para la búsqueda.' : 'Crea tu primer empleado para colaborar en el seguimiento de campañas.'}
            </Text>
          </View>
        ) : (
          filteredManagers.map((m) => (
            <View key={m.id_user} style={[styles.userCard, { backgroundColor: themeColors.bgCard }, shadows.card]}>
              <View style={[styles.avatarCircle, { backgroundColor: isDark ? '#334155' : '#EDE9FE' }]}>
                <Text style={[styles.avatarInitial, { color: themeColors.primary }]}>
                  {(m.name?.[0] || 'M').toUpperCase()}
                </Text>
              </View>

              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: themeColors.textPrimary }]} numberOfLines={1}>
                  {m.name || 'Empleado'} {m.lastname || ''}
                </Text>
                <Text style={[styles.userEmail, { color: themeColors.textSecondary }]} numberOfLines={1}>
                  {m.email}
                </Text>
                <View style={[styles.roleBadge, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                  <View style={styles.roleDot} />
                  <Text style={[styles.roleBadgeText, { color: themeColors.textSecondary }]}>Management</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.revokeBtn}
                onPress={() => handleDeleteEmployee(m.id_user, m.name || m.email)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal Nuevo Empleado */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: themeColors.bgCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.primary }]}>Registrar Empleado</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={themeColors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>Nombre *</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary, borderColor: themeColors.borderInput }]}
                  placeholder="Nombre del colaborador"
                  placeholderTextColor={themeColors.textMuted}
                  value={newEmployee.name}
                  onChangeText={(t) => setNewEmployee({ ...newEmployee, name: t })}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>Apellido</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary, borderColor: themeColors.borderInput }]}
                  placeholder="Apellido"
                  placeholderTextColor={themeColors.textMuted}
                  value={newEmployee.lastname}
                  onChangeText={(t) => setNewEmployee({ ...newEmployee, lastname: t })}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>Correo Electrónico *</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary, borderColor: themeColors.borderInput }]}
                  placeholder="correo@empresa.com"
                  placeholderTextColor={themeColors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={newEmployee.email}
                  onChangeText={(t) => setNewEmployee({ ...newEmployee, email: t })}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>Contraseña Inicial *</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: themeColors.bgInput, color: themeColors.textPrimary, borderColor: themeColors.borderInput }]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={themeColors.textMuted}
                  secureTextEntry
                  value={newEmployee.password}
                  onChangeText={(t) => setNewEmployee({ ...newEmployee, password: t })}
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: themeColors.primary }, adding && { opacity: 0.7 }]}
              onPress={handleAddEmployee}
              disabled={adding}
            >
              {adding ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Crear Empleado</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: typography.bold },
  headerSub: { fontSize: 13, marginTop: 2 },
  addTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  addTopBtnText: { color: '#fff', fontSize: 14, fontWeight: typography.bold },
  searchSection: { paddingHorizontal: 20, marginBottom: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontSize: 14 },
  scrollContent: { paddingHorizontal: 20 },
  statsSummary: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: radii.lg,
    alignItems: 'flex-start',
  },
  summaryNum: { fontSize: 22, fontWeight: typography.bold, marginVertical: 4 },
  summaryLabel: { fontSize: 12 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: typography.bold, marginTop: 14 },
  emptySub: { fontSize: 13, textAlign: 'center', marginTop: 6, maxWidth: 260 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: radii.lg,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarInitial: { fontSize: 18, fontWeight: typography.bold },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: typography.bold },
  userEmail: { fontSize: 13, marginTop: 2 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    marginTop: 6,
  },
  roleDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  roleBadgeText: { fontSize: 11, fontWeight: typography.medium },
  revokeBtn: {
    padding: 8,
    borderRadius: radii.sm,
  },
  restrictedCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  restrictedTitle: { fontSize: 20, fontWeight: typography.bold, textAlign: 'center' },
  restrictedSub: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: { borderRadius: radii.xl, padding: 20 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: typography.bold },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: typography.medium, marginBottom: 6 },
  fieldInput: {
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  submitBtn: {
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: typography.bold },
});
