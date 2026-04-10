import { Tabs } from "expo-router";
import CustomTabBar from "../../src/components/customtabbar";

export default function DashboardLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
        }}
      />
      <Tabs.Screen
        name="top"
        options={{
          title: "Top",
        }}
      />
    </Tabs>
  );
}
