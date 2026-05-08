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
import api from '../../src/services/api/client';

interface CompanyAdmin {
  id_company: number;
  nombre_empresa: string;
  owners: number;
  managements: number;
}

export default function AdminCompanies() {
  const insets = useSafeAreaInsets();
  const [companies, setCompanies] = useState<CompanyAdmin[]>([]);
  const [loading, setLoading] = useState(true);

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

  const renderItem = ({ item }: { item: CompanyAdmin }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.companyHeader} activeOpacity={0.8}>
        <Text style={styles.companyName}>{item.nombre_empresa}</Text>
        <Ionicons name="chevron-down" size={24} color="#FFF" />
      </TouchableOpacity>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>{item.owners} Owners</Text>
        <Text style={styles.statsText}>{item.managements} managments</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <Image 
            source={require('../../assets/images/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity style={styles.avatarButton}>
          <Ionicons name="person-circle" size={42} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Companies</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
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
  listContent: { paddingHorizontal: 24, paddingBottom: 120 },
  cardContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  companyHeader: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 12,
  },
  companyName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: '#D8C9F1',
    padding: 15,
    marginTop: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 2,
  },
});
