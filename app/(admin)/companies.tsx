import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '../../src/theme/colors';
import { useTheme } from '../../src/ThemeContext';
import api from '../../src/services/api/client';
import AccountAvatar from '../../src/components/AccountAvatar';
import { useRouter } from 'expo-router';

interface CompanyAdmin {
  id_company: number;
  nombre_empresa: string;
  owners: number;
  managements: number;
}

export default function AdminCompanies() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors: themeColors, isDark } = useTheme();
  const [companies, setCompanies] = useState<CompanyAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response: any = await api.get('/analitika/admin/companies');
      setCompanies(Array.isArray(response) ? response : (response?.response || []));
    } catch (error) {
      console.error('Error fetching admin companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderItem = ({ item }: { item: CompanyAdmin }) => {
    const isExpanded = expandedId === item.id_company;

    return (
      <View style={[styles.cardContainer, { backgroundColor: isDark ? '#1E293B' : '#F8F9FA', borderColor: isDark ? '#334155' : '#F1F3F5' }, isExpanded && { borderColor: themeColors.primary, backgroundColor: themeColors.bgCard }]}>
        <TouchableOpacity 
          style={[styles.companyHeader, isExpanded && { borderBottomColor: isDark ? '#334155' : '#F1F3F5' }]} 
          activeOpacity={0.8}
          onPress={() => toggleExpand(item.id_company)}
        >
          <Text style={[styles.companyName, { color: themeColors.textPrimary }, isExpanded && { color: themeColors.primary, fontWeight: '700' }]}>
            {item.nombre_empresa}
          </Text>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color={isExpanded ? themeColors.primary : themeColors.textMuted} 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={[styles.statsContainer, { backgroundColor: isDark ? '#0F172A' : '#FAF9FE' }]}>
            <View style={styles.statsInfo}>
              <Text style={[styles.statsText, { color: themeColors.textSecondary }]}>{item.owners} Owners</Text>
              <Text style={[styles.statsText, { color: themeColors.textSecondary }]}>{item.managements} managments</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.manageButton, { backgroundColor: themeColors.primary }]}
              onPress={() => router.push({ pathname: '/(admin)/roles', params: { companyId: item.id_company, companyName: item.nombre_empresa } })}
            >
              <Text style={styles.manageButtonText}>Gestionar Usuarios</Text>
              <Ionicons name="people-outline" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: themeColors.bgPage }]}>
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <Image 
            source={isDark ? require('../../assets/images/icon_negative.png') : require('../../assets/images/icon.png')}
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

      <Text style={[styles.title, { color: themeColors.primary }]}>Empresas</Text>

      {loading ? (
        <ActivityIndicator size="large" color={themeColors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={companies}
          keyExtractor={(item) => String(item.id_company)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    height: 100,
  },
  logoWrapper: {
    flex: 1,
    marginLeft: -15,
  },
  logoImage: {
    width: 180,
    height: 250,
  },
  avatarButton: { padding: 4 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    paddingHorizontal: 24,
    marginBottom: 25,
  },
  listContent: { paddingHorizontal: 24, paddingBottom: 150 },
  cardContainer: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: '#F8F9FA', // Color base más suave
    borderWidth: 1.5,
    borderColor: '#F1F3F5',
  },
  cardExpandedBorder: {
    borderColor: '#AD8DF2',
    backgroundColor: '#FFF',
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  companyHeaderActive: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  companyName: {
    color: '#495057',
    fontSize: 18,
    fontWeight: '600',
  },
  companyNameActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  statsContainer: {
    padding: 20,
    backgroundColor: '#FAF9FE',
  },
  statsInfo: {
    marginBottom: 15,
  },
  statsText: {
    fontSize: 15,
    color: '#666',
    marginVertical: 3,
    fontWeight: '500',
  },
  manageButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 5,
  },
  manageButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
