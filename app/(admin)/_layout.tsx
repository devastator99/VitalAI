import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

// app/(admin)/_layout.tsx
export default function AdminLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1A202C" }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#A0AEC0",
          tabBarInactiveTintColor: "#4A5568",
          tabBarStyle: {
            backgroundColor: "#2D3748",
            borderTopWidth: 1,
            borderTopColor: "#4A5568",
          },
        }}
      >
        {/* This now points to index.tsx */}
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Admin Dashboard",
            tabBarIcon: ({ color }) => (
              <Ionicons name="menu" size={20} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings" size={20} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
