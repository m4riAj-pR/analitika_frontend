import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import api from '../../src/services/api/client';

interface UserRoleGroup {
  id_user: number;
  email: string;
  role_name: string;
}

export default function AdminRoles() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<{ owners: UserRoleGroup[], managements: UserRoleGroup[] }>({ owners: [], managements: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response: any = await api.get('/analitika/admin/users-by-role');
      setData(response);
    } catch (error) {
      console.error('Error fetching users by role:', error);
    } finally {
      setLoading(false);
    }
  };

  const UserItem = ({ email }: { email: string }) => (
    <View style={styles.userCard}>
      <Text style={styles.userEmail}>{email}</Text>
      <TouchableOpacity style={styles.editButton}>
        <Feather name="edit-3" size={20} color="#000" />
      </TouchableOpacity>
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

      <Text style={styles.title}>Roles</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{data.owners.length} Owners</Text>
            {data.owners.map(user => <UserItem key={user.id_user} email={user.email} />)}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{data.managements.length} Managments</Text>
            {data.managements.map(user => <UserItem key={user.id_user} email={user.email} />)}
          </View>

        </ScrollView>
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
  scrollContent: { paddingHorizontal: 24, paddingBottom: 150 },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#E2D8F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  userEmail: {
    fontSize: 16,
    color: '#333',
    textDecorationLine: 'underline',
  },
  editButton: {
    padding: 4,
  },
});
