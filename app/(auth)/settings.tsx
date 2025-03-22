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

  // Simulated logout function
  const handleLogout = () => {
    Alert.alert("Logout", "You have been logged out.", [{ text: "OK" }]);
  };

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={[styles.gradient]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="settings-outline" size={30} color="#fff" />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={() => Alert.alert("Edit Profile", "Edit Profile clicked!")}
          >
            <Text style={styles.rowTitle}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push("/(auth)/ai")}
          >
            <Text style={styles.rowTitle}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              thumbColor={isDarkMode ? "#fff" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Auto-Update</Text>
            <Switch
              value={autoUpdateEnabled}
              onValueChange={toggleAutoUpdate}
              thumbColor={autoUpdateEnabled ? "#fff" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>
        </View>

        {/* Language & Region Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language & Region</Text>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Language</Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Edit Profile", "Edit Profile clicked!")
              }
            >
              <Text style={styles.rowValue}>{selectedLanguage}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Region</Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Edit Profile", "Edit Profile clicked!")
              }
            >
              <Text style={styles.rowValue}>United States</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={() => Alert.alert("Edit Profile", "Edit Profile clicked!")}
          >
            <Text style={styles.rowTitle}>App Version</Text>
            <Text style={styles.rowValue}>v1.0.0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.row}
            onPress={() => Alert.alert("Edit Profile", "Edit Profile clicked!")}
          >
            <Text style={styles.rowTitle}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.row}
            onPress={() => Alert.alert("Edit Profile", "Edit Profile clicked!")}
          >
            <Text style={styles.rowTitle}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
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
