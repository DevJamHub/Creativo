// Bottom tabs with Creativo's custom floating tab bar.

import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/navigation/TabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="network" />
      <Tabs.Screen name="repository" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
