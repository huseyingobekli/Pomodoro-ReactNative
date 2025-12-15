import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isLight = (colorScheme ?? "light") === "light";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isLight ? "#0a7ea4" : Colors.dark.tint,
        tabBarInactiveTintColor: isLight
          ? "#666666"
          : Colors.dark.tabIconDefault,
        tabBarStyle: isLight
          ? {
              backgroundColor: "#ffffff",
              borderTopColor: "#d0d0d0",
            }
          : undefined,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Ekran",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "İstatistik",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="analytics" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ayarlar",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="settings" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
