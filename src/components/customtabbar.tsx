import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, palette, typography } from '../theme/colors';

// Simple mapping from route name to icon name
const getIconName = (routeName: string) => {
  switch (routeName) {
    case 'dashboard':
      return 'grid';
    case 'campaign':
      return 'megaphone';
    case 'ranking':
      return 'podium';
    case 'account':
      return 'person-circle-outline';
    default:
      return 'ellipse';
  }
};

const getLabel = (routeName: string) => {
  switch (routeName) {
    case 'dashboard':
      return 'Dashboard';
    case 'campaign':
      return 'Campañas';
    case 'ranking':
      return 'Top';
    case 'account':
      return 'Cuenta';
    default:
      return routeName;
  }
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
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

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const routeName = route.name;
          const label = getLabel(routeName);
          const iconName = getIconName(routeName) as any;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabItem,
                isFocused && styles.tabItemFocused
              ]}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={"#ffffff"}
              />
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
    backgroundColor: colors.primary,  // Deep purple
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabItemFocused: {
    backgroundColor: palette.purple3, // Lighter background for active tab
  },
  tabLabel: {
    color: "#ffffff",
    fontSize: typography.sizeXs,
    marginTop: 2,
    fontWeight: typography.medium,
  },
  tabLabelFocused: {
    fontWeight: typography.bold,
  },
});
