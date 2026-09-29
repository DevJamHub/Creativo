// Bottom tabs: Dashboard · Feed · (Upload) · Friends · Profile, drawn by Creativo's own tab bar.

import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/views/navigation/TabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="network" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
