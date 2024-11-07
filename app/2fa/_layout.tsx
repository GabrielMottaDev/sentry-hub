import { Tabs, useSegments } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { enableScreens } from 'react-native-screens';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Tabs
  const segments = useSegments();

  // if screen is in the home or live stack, hide the tab bar
  // const hide = segments.includes("home") || segments.includes("live");
  const hide = true;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarStyle: {
          display: hide ? 'none' : 'flex'
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
