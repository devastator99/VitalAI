import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimHeader from "~/components/AnimHeader";
import ScreenTransitionView from "~/components/ScreenTransitionView";

export default function Profile() {
  const user = useQuery(api.users.getCurrentUser);
  const profilePicture = user?.profileDetails?.picture;
  const imageUrl = useQuery(api.files.getImageUrl, 
    profilePicture ? { storageId: profilePicture } : "skip"
  );

  const MemoizedAvatarImage = React.memo(
    ({ uri, style }: { uri: string; style: any }) => (
      <Image source={{ uri }} style={style} />
    )
  );
  const insets = useSafeAreaInsets();
  console.log(profilePicture);
  
  useEffect(() => {
    if (imageUrl) {
    console.log(imageUrl);
    }
  }, [imageUrl]);

  
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
    <ScreenTransitionView style={{ flex: 1 }}>
      <AnimHeader
        title="Profile"
        buttons={[]}
        onButtonSelect={() => {}}
        rightIcons={[
          { 
            icon: "settings-outline", 
            onPress: () => console.log("Open settings") 
          }
        ]}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <TouchableOpacity style={styles.avatarContainer}>
              {profilePicture ? (
                imageUrl ? (
                  <MemoizedAvatarImage
                    uri={imageUrl as string}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.loadingIndicator}>
                    <ActivityIndicator size="small" color="#00BFFF" />
                  </View>
                )
              ) : (
                <Ionicons name="person-outline" size={50} color="#00BFFF" />
              )}
              <View style={styles.cameraIcon}>
                <Ionicons name="camera-outline" size={20} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{user.name || "User"}</Text>
            <Text style={styles.subtitle}>Fitness Enthusiast</Text>
          </View>

          {/* Details Section */}
          <LinearGradient
            colors={["#00BFFF33", "#1a1a1a"]}
            style={styles.section}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.sectionTitle}>Personal Details</Text>
            
            {user.profileDetails?.height && (
              <DetailRow
                icon="body-outline"
                label="Height"
                value={`${user.profileDetails.height} cm`}
              />
            )}
            
            {user.profileDetails?.weight && (
              <DetailRow
                icon="barbell-outline"
                label="Weight"
                value={`${user.profileDetails.weight} kg`}
              />
            )}
            
            {user.profileDetails?.email && (
              <DetailRow
                icon="mail-outline"
                label="Email"
                value={user.profileDetails.email}
              />
            )}
            
            {user.profileDetails?.phone && (
              <DetailRow
                icon="call-outline"
                label="Phone"
                value={user.profileDetails.phone}
              />
            )}
          </LinearGradient>

          {/* Edit Button */}
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => console.log("Edit profile")}
          >
            <LinearGradient
              colors={["#00BFFF", "#0066FF"]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </AnimHeader>
    </ScreenTransitionView>
  );
}

const DetailRow = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
  <View style={styles.row}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon as any} size={20} color="#00BFFF" />
    </View>
    <View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#4682b4",
  },
  gradient: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1a1a1a",
    borderWidth: 2,
    borderColor: "#00BFFF",
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: "#00BFFF",
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
    backgroundColor: "#00BFFF",
    borderRadius: 15,
    padding: 5,
  },
  headerTitle: {
    fontSize: 28,
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
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#00BFFF33',
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
    fontSize: 20,
    fontWeight: '800',
    color: "#00BFFF",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2e2e2e",
  },
  iconContainer: {
    backgroundColor: '#00BFFF33',
    borderRadius: 10,
    padding: 10,
    marginRight: 15,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 16,
    color: "#fff",
    fontWeight: '600',
  },
  editButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#00BFFF33',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
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
  loadingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});