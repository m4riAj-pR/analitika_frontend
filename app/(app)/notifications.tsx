import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows, radii, typography } from '../../src/theme/colors';
import { useTheme } from '../../src/ThemeContext';
import { useProfile } from '../../src/hooks/useProfile';
import { notificationsApi } from '../../src/services/api/notifications';

interface Notification {
  id_notification: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  channels?: string[];
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { colors: themeColors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response: any = await notificationsApi.getNotifications();
      const data = Array.isArray(response) ? response : (response?.response || []);
      setNotifications(data);
    } catch (error) {
      console.log('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id_notification === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo marcar como leída.');
    }
  };

  const handleTestCriticalAlert = async () => {
    try {
      setDispatching(true);
      await notificationsApi.sendCriticalAlert({
        title: 'Alerta Crítica: Cambio de Rendimiento',
        message: `Se detectó una variación relevante en el CTR de tu campaña. Copia enviada a ${profile?.email || 'tu correo'} y SMS a ${profile?.phone || 'tu teléfono'}.`,
        type: 'critical',
        channels: ['app', 'email', 'sms'],
        email_target: profile?.email,
        phone_target: profile?.phone,
      });

      Alert.alert(
        'Alerta Enviada Multicanal',
        `Notificación emitida con éxito por 3 vías:\n\n• 🔔 Alerta en App\n• 📧 Correo: ${profile?.email || 'Registrado'}\n• 📱 SMS: ${profile?.phone || 'Registrado'}`
      );
      fetchNotifications();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo emitir la alerta crítica.');
    } finally {
      setDispatching(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        { backgroundColor: themeColors.bgCard },
        !item.is_read && {
          backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
          borderLeftWidth: 4,
          borderLeftColor: themeColors.primary,
        },
      ]}
      onPress={() => markAsRead(item.id_notification)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: isDark ? '#0F172A' : '#F3F0FA' }]}>
        <Ionicons
          name={item.type === 'critical' ? 'alert-circle' : item.type === 'warning' ? 'warning' : 'notifications'}
          size={24}
          color={item.type === 'critical' || item.type === 'warning' ? '#EF4444' : themeColors.primary}
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: themeColors.textPrimary }, !item.is_read && { fontWeight: typography.bold }]}>
          {item.title}
        </Text>
        <Text style={[styles.message, { color: themeColors.textSecondary }]} numberOfLines={3}>
          {item.message}
        </Text>

        {/* Canales de envío integrados */}
        <View style={styles.channelsRow}>
          <View style={styles.channelTag}>
            <Ionicons name="notifications" size={11} color={themeColors.primary} />
            <Text style={styles.channelTagText}>App</Text>
          </View>
          <View style={styles.channelTag}>
            <Ionicons name="mail" size={11} color="#10B981" />
            <Text style={styles.channelTagText}>Email</Text>
          </View>
          <View style={styles.channelTag}>
            <Ionicons name="chatbox" size={11} color="#8B5CF6" />
            <Text style={styles.channelTagText}>SMS</Text>
          </View>
        </View>

        <Text style={[styles.date, { color: themeColors.textMuted }]}>
          {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {!item.is_read && <View style={[styles.dot, { backgroundColor: themeColors.primary }]} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: themeColors.bgPage }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Notificaciones</Text>
        <TouchableOpacity
          style={[styles.testAlertBtn, { backgroundColor: isDark ? '#334155' : '#EDE9FE' }]}
          onPress={handleTestCriticalAlert}
          disabled={dispatching}
        >
          {dispatching ? (
            <ActivityIndicator size="small" color={themeColors.primary} />
          ) : (
            <Ionicons name="send" size={16} color={themeColors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={themeColors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id_notification)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[themeColors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={64} color={themeColors.textMuted} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No tienes notificaciones registradas aún</Text>
            </View>
          }
        />
      )}
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
    paddingVertical: 14,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: typography.bold },
  testAlertBtn: { padding: 8, borderRadius: radii.md },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, paddingBottom: 100 },
  notificationCard: {
    flexDirection: 'row',
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
    ...shadows.card,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contentContainer: { flex: 1 },
  title: { fontSize: 15, fontWeight: typography.bold, marginBottom: 4 },
  message: { fontSize: 13, lineHeight: 18 },
  channelsRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  channelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  channelTagText: { fontSize: 10, fontWeight: typography.bold, color: '#64748B' },
  date: { fontSize: 11, marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8, marginTop: 4 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { fontSize: 14, marginTop: 12 },
});
