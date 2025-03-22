import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Profile() {
  const user = useQuery(api.users.getCurrentUser);
  const profilePicture = user?.profileDetails?.picture;
  const imageUrl = useQuery(api.files.getImageUrl, 
    profilePicture ? { storageId: profilePicture } : "skip"
  );
  const insets = useSafeAreaInsets();

  if (user === undefined) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={["#4682b4", "#5f9ea0"]} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (user === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={["#4682b4", "#5f9ea0"]} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load profile.</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
      <LinearGradient colors={["#4682b4", "#5f9ea0"]} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Profile Photo Section */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.avatarContainer}>
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.avatar}
                />
              ) : (
                <Ionicons name="person-outline" size={50} color="#4682b4" />
              )}
              <View style={styles.cameraIcon}>
                <Ionicons name="camera-outline" size={20} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{user.name || "Profile"}</Text>
          </View>

          {/* Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            {user.profileDetails?.height && (
              <View style={styles.row}>
                <Ionicons name="body-outline" size={20} color="#fff" />
                <Text style={styles.rowText}>
                  Height: {user.profileDetails.height} cm
                </Text>
              </View>
            )}
            {user.profileDetails?.weight && (
              <View style={styles.row}>
                <Ionicons name="barbell-outline" size={20} color="#fff" />
                <Text style={styles.rowText}>
                  Weight: {user.profileDetails.weight} kg
                </Text>
              </View>
            )}
            {user.profileDetails?.email && (
              <View style={styles.row}>
                <Ionicons name="mail-outline" size={20} color="#fff" />
                <Text style={styles.rowText}>{user.profileDetails.email}</Text>
              </View>
            )}
            {user.profileDetails?.phone && (
              <View style={styles.row}>
                <Ionicons name="call-outline" size={20} color="#fff" />
                <Text style={styles.rowText}>{user.profileDetails.phone}</Text>
              </View>
            )}
          </View>

          {/* Edit Button */}
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#4682b4",
  },
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4682b4",
    borderRadius: 15,
    padding: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
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
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  rowText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: "#81b0ff",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#fff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#ff4d4d",
  },
});