import { Tabs, Redirect } from 'expo-router';
import { useAuthGuard } from '../../src/hooks/useAuthGuard';
import React from 'react';
import { ActivityIndicator, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import Svg, { Path } from 'react-native-svg';

const IconamoonProfileFill = ({ color, size = 26 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 7a4 4 0 1 1 8 0a4 4 0 0 1-8 0m0 6a5 5 0 0 0-5 5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3a5 5 0 0 0-5-5z"
    />
  </Svg>
);

function AdminTabBar({ state, navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName: any = 'grid';
          let label = 'Empresas';

          if (route.name === 'companies') {
            iconName = 'business';
            label = 'Empresas';
          } else if (route.name === 'roles') {
            iconName = 'users-cog';
            label = 'Roles';
          } else if (route.name === 'profile') {
            iconName = 'person';
            label = 'Perfil';
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.tabItem, isFocused && styles.tabItemFocused]}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={label}
            >
              {route.name === 'roles' ? (
                <FontAwesome5 name="users-cog" size={24} color="#FFF" />
              ) : route.name === 'profile' ? (
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                  <IconamoonProfileFill color="#fff" size={22} />
                </View>
              ) : (
                <MaterialIcons name={iconName} size={28} color="#FFF" />
              )}
              <Text style={styles.tabLabel}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function AdminLayout() {
  const { isValidating, isAuthorized, profile } = useAuthGuard();

  if (isValidating) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Sin sesión → login. Sesión válida pero sin rol Super Admin → su panel de campañas.
  if (!isAuthorized || !profile) {
    return <Redirect href="/(auth)/login" />;
  }
  if (profile.id_role !== 1) {
    return <Redirect href="/(app)/(tabs)/dashboard" />;
  }

  return (
    <Tabs
      tabBar={(props) => <AdminTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="companies" />
      <Tabs.Screen name="roles" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tabItemFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  tabLabel: {
    color: '#FFF',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
});
