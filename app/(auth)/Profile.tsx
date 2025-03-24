import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
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
      <LinearGradient colors={["#0f0f0f", "#1a1a1a"]} style={styles.gradient}>
        <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 20 }]}>
          {/* Profile Photo Section */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.avatarContainer}>
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.avatar}
                />
              ) : (
                <Ionicons name="person-outline" size={50} color="#81b0ff" />
              )}
              <View style={styles.cameraIcon}>
                <Ionicons name="camera-outline" size={20} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{user.name || "Profile"}</Text>
            <Text style={styles.subtitle}>Fitness Enthusiast</Text>
          </View>

          {/* Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            {user.profileDetails?.height && (
              <View style={styles.row}>
                <View style={styles.iconContainer}>
                  <Ionicons name="body-outline" size={20} color="#fff" />
                </View>
                <Text style={styles.rowText}>
                  {user.profileDetails.height} cm
                </Text>
              </View>
            )}
            {user.profileDetails?.weight && (
              <View style={styles.row}>
                <View style={styles.iconContainer}>
                  <Ionicons name="barbell-outline" size={20} color="#fff" />
                </View>
                <Text style={styles.rowText}>
                  Weight: {user.profileDetails.weight} kg
                </Text>
              </View>
            )}
            {user.profileDetails?.email && (
              <View style={styles.row}>
                <View style={styles.iconContainer}>
                  <Ionicons name="mail-outline" size={20} color="#fff" />
                </View>
                <Text style={styles.rowText}>{user.profileDetails.email}</Text>
              </View>
            )}
            {user.profileDetails?.phone && (
              <View style={styles.row}>
                <View style={styles.iconContainer}>
                  <Ionicons name="call-outline" size={20} color="#fff" />
                </View>
                <Text style={styles.rowText}>{user.profileDetails.phone}</Text>
              </View>
            )}
          </View>

          {/* Edit Button */}
          <TouchableOpacity style={styles.editButton}>
            <LinearGradient colors={["#81b0ff", "#4d79ff"]} style={styles.buttonGradient}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </LinearGradient>
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
    padding: 25,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2e2e2e",
    borderWidth: 2,
    borderColor: "#81b0ff",
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: "#81b0ff",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  avatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
    position: 'absolute',
    top: 2,
    left: 2,
    resizeMode: 'cover'
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
    fontSize: 32,
    fontWeight: '800',
    color: "#f0f0f0",
    marginTop: 15,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#888',
    fontSize: 16,
    marginTop: 5,
  },
  section: {
    marginBottom: 30,
    backgroundColor: "#1a1a1a",
    borderRadius: 15,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: "#81b0ff",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2e2e2e",
  },
  iconContainer: {
    backgroundColor: '#81b0ff33',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  rowText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 10,
  },
  editButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
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