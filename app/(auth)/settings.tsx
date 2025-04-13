import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "~/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Settings from '~/components/Settings';

export default function SettingsScreen() {
  // State for toggles and selections
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  // Handlers for toggles
  const toggleDarkMode = (value: any) => setIsDarkMode(value);
  const toggleNotifications = (value: any) => setNotificationsEnabled(value);
  const toggleAutoUpdate = (value: any) => setAutoUpdateEnabled(value);
  const insets = useSafeAreaInsets();

  // Simulated logout functiona
  const handleLogout = () => {
    Alert.alert("Logout", "You have been logged out.", [{ text: "OK" }]);
  };

  return (
    <Settings />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#4C669F", //"#4c669f"
  },
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingTop:40,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  section: {
    marginBottom: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  rowTitle: {
    fontSize: 16,
    color: "#fff",
  },
  rowValue: {
    fontSize: 16,
    color: "#ddd",
  },
  logoutButton: {
    backgroundColor: "#ff4d4d",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
