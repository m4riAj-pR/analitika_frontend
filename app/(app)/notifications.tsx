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
import { colors, shadows } from '../../src/theme/colors';
import { useTheme } from '../../src/ThemeContext';
import { notificationsApi } from '../../src/services/api/notifications';

interface Notification {
  id_notification: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { colors: themeColors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response: any = await notificationsApi.getNotifications();
      // Ajuste para manejar la estructura de respuesta (podría venir en .response o directo)
      const data = Array.isArray(response) ? response : (response?.response || []);
      setNotifications(data);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las notificaciones.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id_notification === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo marcar como leída.");
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
      style={[styles.notificationCard, { backgroundColor: themeColors.bgCard }, !item.is_read && { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderLeftWidth: 4, borderLeftColor: themeColors.primary }]}
      onPress={() => markAsRead(item.id_notification)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: isDark ? '#0F172A' : '#F3F0FA' }]}>
        <Ionicons 
          name={item.type === 'warning' ? 'alert-circle' : 'notifications'} 
          size={24} 
          color={item.type === 'warning' ? '#EF4444' : themeColors.primary} 
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: themeColors.textPrimary }, !item.is_read && { color: isDark ? '#FFF' : '#0F172A', fontWeight: '700' }]}>{item.title}</Text>
        <Text style={[styles.message, { color: themeColors.textSecondary }]} numberOfLines={3}>{item.message}</Text>
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
        <View style={{ width: 40 }} />
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
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No tienes notificaciones aún</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, paddingBottom: 100 },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    ...shadows.card,
  },
  unreadCard: {
    backgroundColor: '#F1F5F9',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F0FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contentContainer: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: '#334155', marginBottom: 4 },
  unreadText: { color: '#0F172A', fontWeight: '700' },
  message: { fontSize: 14, color: '#64748B', lineHeight: 20 },
  date: { fontSize: 12, color: '#94A3B8', marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginLeft: 10 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#64748B', marginTop: 15 },
});
