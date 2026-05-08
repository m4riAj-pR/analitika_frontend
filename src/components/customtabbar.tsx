import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, typography } from '../theme/colors';

// Icono duo-icons:dashboard
const DuoDashboardIcon = ({ color, size = 26 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      fillRule="evenodd"
      d="M19 11a2 2 0 0 1 1.995 1.85L21 13v6a2 2 0 0 1-1.85 1.995L19 21h-4a2 2 0 0 1-1.995-1.85L13 19v-6a2 2 0 0 1 1.85-1.995L15 11zm0-8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
      opacity={0.3}
    />
    <Path
      fill={color}
      fillRule="evenodd"
      d="M9 3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
    />
    <Path
      fill={color}
      fillRule="evenodd"
      d="M9 15a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z"
      opacity={0.3}
    />
  </Svg>
);

// Icono Solar Ranking Bold Duotone
const SolarRankingIcon = ({ color, size = 30 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M11.146 3.023C11.526 2.34 11.716 2 12 2s.474.34.854 1.023l.098.176c.108.194.162.29.246.354c.085.064.19.088.4.135l.19.044c.738.167 1.107.25 1.195.532s-.164.577-.667 1.165l-.13.152c-.143.167-.215.25-.247.354s-.021.215 0 .438l.02.203c.076.785.114 1.178-.115 1.352c-.23.175-.576.015-1.267-.303l-.178-.082c-.197-.09-.295-.136-.399-.136s-.202.046-.399.136l-.178.082c-.691.318-1.037.478-1.267.303c-.23-.174-.191-.567-.115-1.352l.02-.203c.021-.223.032-.334 0-.438s-.104-.187-.247-.354l-.13-.152c-.503-.588-.755-.882-.667-1.165c.088-.282.457-.365 1.195-.532l.19-.044c.21-.047.315-.07.4-.135c.084-.064.138-.16.246-.354zM13 10h-2c-1.414 0-2.121 0-2.56.44C8 10.878 8 11.585 8 13v9h8v-9c0-1.414 0-2.121-.44-2.56C15.122 10 14.415 10 13 10"
    />
    <Path
      fill={color}
      opacity={0.5}
      d="M7.56 19.44C7.122 19 6.415 19 5 19s-2.121 0-2.56.44C2 19.878 2 20.585 2 22h6c0-1.414 0-2.121-.44-2.56M16 19v3h6v-3c0-1.414 0-2.121-.44-2.56C21.122 16 20.415 16 19 16s-2.121 0-2.56.44C16 16.878 16 17.585 16 19"
    />
  </Svg>
);

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

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const visibleRoutes = state.routes; // show all routes including account

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {visibleRoutes.map((route) => {
          const index = state.routes.findIndex(r => r.key === route.key);
          const isFocused = state.index === index;

          const onPress = () => {
            if (route.name === 'campaign') {
              navigation.navigate(route.name);
              return;
            }
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const routeName = route.name;
          let label = '';
          let isDashboard = false;
          let isCreate = false;
          let isTop = false;
          let isAccount = false;

          if (routeName === 'dashboard') {
            label = 'Dashboard';
            isDashboard = true;
          } else if (routeName === 'campaign') {
            label = 'Create';
            isCreate = true;
          } else if (routeName === 'ranking') {
            label = 'Top';
            isTop = true;
          } else if (routeName === 'account') {
            label = 'Perfil';
            isAccount = true;
          }

          if (isCreate) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.createTabItem}
                activeOpacity={0.8}
              >
                <View style={styles.createIconCircle}>
                  <View style={styles.plusVertical} />
                  <View style={styles.plusHorizontal} />
                </View>
                <Text style={styles.tabLabel}>{label}</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, isFocused && styles.iconWrapperFocused]}>
                {isDashboard ? (
                  <DuoDashboardIcon color="#fff" size={36} />
                ) : isTop ? (
                  <SolarRankingIcon color="#fff" size={36} />
                ) : isAccount ? (
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                    <IconamoonProfileFill color="#fff" size={22} />
                  </View>
                ) : (
                  <Ionicons
                    name="alert-circle-outline"
                    size={22}
                    color="#fff"
                  />
                )}
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
  },
  tabItem: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 60,
    height: 36,
    borderRadius: 18,
  },
  createTabItem: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    position: 'relative',
  },
  plusVertical: {
    width: 3.5,
    height: 18,
    backgroundColor: colors.primary,
    borderRadius: 2,
    position: 'absolute',
  },
  plusHorizontal: {
    width: 18,
    height: 3.5,
    backgroundColor: colors.primary,
    borderRadius: 2,
    position: 'absolute',
  },
  tabLabel: {
    color: '#fff',
    fontSize: 10,
    marginTop: 1,
    fontWeight: typography.medium,
  },
  tabLabelFocused: {
    fontWeight: typography.bold,
  },
});
