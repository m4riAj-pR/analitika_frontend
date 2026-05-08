import CustomTabBar from '@/src/components/customtabbar';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="campaign" />
      <Tabs.Screen name="ranking" />
    </Tabs>
  );
}
