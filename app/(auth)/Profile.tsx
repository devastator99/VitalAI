import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenTransitionView from "~/components/ScreenTransitionView";
import { router, Stack, useLocalSearchParams } from "expo-router";
import Colors from "~/utils/Colors";
import { BlurView } from "expo-blur";
import IconCircle from "~/components/IconCircle";
import CachedImage from "~/components/CachedImage";
import { useUser } from "~/store";
const { width, height } = Dimensions.get('window');

export default function Profile() {
  const { user } = useUser();
  const { edited } = useLocalSearchParams();
  const [showNotification, setShowNotification] = useState(false);
  const notificationOpacity = React.useRef(new Animated.Value(0)).current;
  
  const profilePicture = user?.profileDetails?.picture;
  const imageUrl = useQuery(api.files.getImageUrl,
    profilePicture ? { storageId: profilePicture } : "skip"
  );
  
  // Show notification when returning from editing profile
  useEffect(() => {
    if (edited === "true") {
      setShowNotification(true);
      
      // Fade in
      Animated.timing(notificationOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Auto hide after 3 seconds
      const timer = setTimeout(() => {
        Animated.timing(notificationOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowNotification(false);
        });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [edited]);

  if (user === undefined) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.mainBlue} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (user === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.gradient}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={50} color="#FF4B55" />
            <Text style={styles.errorText}>Failed to load profile</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => router.replace("/(auth)/Profile")}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate BMI if height and weight are available
  const height = user.profileDetails?.height;
  const weight = user.profileDetails?.weight;
  let bmi = null;
  if (height && weight && height > 0 && weight > 0) {
    const heightInMeters = height / 100;
    bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
  }

  // Get workout stats from questionnaire data
  const workoutStats = {
    count: 0,
    achievements: 0,
    daysActive: 0
  };
  
  if (user.questionnaire?.workouts?.doWorkouts) {
    workoutStats.count = Math.floor(Math.random() * 30) + 5; // Sample data
    workoutStats.daysActive = user.questionnaire.workouts.days?.length || 0;
    workoutStats.achievements = Math.floor(Math.random() * 10); // Sample data
  }
  
  return (
    <ScreenTransitionView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: Colors.white, fontSize: 20, fontWeight: "600" }}>
                Your{" "}
              </Text>
              <Text style={{ color: Colors.mainBlue, fontSize: 20, fontWeight: "600" }}>
                Profile
              </Text>
            </View>
          ),
          headerStyle: {
            backgroundColor: Colors.PitchBlack,
          },
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push("/(details)/settings")}
              style={{ marginRight: 16 }}
            >
              <IconCircle name="settings-outline" size={17} />
            </TouchableOpacity>
          ),
          headerTintColor: Colors.white,
        }}
      />

      <View style={styles.container}>
        {/* Top Background */}
        <View style={styles.topBackground}>
          <LinearGradient
            colors={[Colors.mainBlue + '40', Colors.PitchBlack]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
        
        <ScrollView 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarOuterContainer}>
              <LinearGradient
                colors={[Colors.mainBlue, '#5f9eaf']}
                style={styles.avatarGradientBorder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <TouchableOpacity style={styles.avatarContainer}>
                  {profilePicture ? (
                    imageUrl ? (
                      <CachedImage source={imageUrl as string} style={styles.avatar} />
                    ) : (
                      <View style={styles.loadingIndicator}>
                        <ActivityIndicator size="small" color={Colors.mainBlue} />
                      </View>
                    )
                  ) : (
                    <View style={styles.emptyAvatarContainer}>
                      <Ionicons name="person" size={50} color="#ffffff80" />
                    </View>
                  )}
                </TouchableOpacity>
              </LinearGradient>
              {/* <TouchableOpacity style={styles.cameraIcon}>
                <LinearGradient
                  colors={[Colors.mainBlue, '#5f9eaf']}
                  style={styles.cameraGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="camera" size={18} color="white" />
                </LinearGradient>
              </TouchableOpacity> */}
            </View>
            
            <Text style={styles.headerTitle}>{user.name || "User"}</Text>
            <Text style={styles.subtitle}>
              {user.questionnaire?.primaryGoal ? 
                `Goal: ${user.questionnaire.primaryGoal}` : 
                "Fitness Enthusiast"}
            </Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsContainer}>
            {[
              { label: 'Workouts', value: `${workoutStats.count}` },
              { label: 'Achievements', value: `${workoutStats.achievements}` },
              { label: 'Days Active', value: `${workoutStats.daysActive}` }
            ].map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
          
          {/* Conditional rendering based on questionnaire data */}
          {user.questionnaire ? (
            <>
              {/* Goal & Health Section */}
              <BlurView intensity={20} tint="dark" style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Goals & Health</Text>
                  <TouchableOpacity>
                    <Ionicons name="fitness-outline" size={18} color={Colors.mainBlue} />
                  </TouchableOpacity>
                </View>
                
                {user.questionnaire.primaryGoal && (
                  <DetailRow
                    icon="flag-outline"
                    label="Primary Goal"
                    value={user.questionnaire.primaryGoal}
                  />
                )}
                
                {user.questionnaire.activityLevel && (
                  <DetailRow
                    icon="pulse-outline"
                    label="Activity Level"
                    value={user.questionnaire.activityLevel}
                  />
                )}
                
                {bmi && (
                  <DetailRow
                    icon="body-outline"
                    label="BMI"
                    value={bmi}
                  />
                )}
                
                {user.questionnaire.dietStyle && (
                  <DetailRow
                    icon="restaurant-outline"
                    label="Diet Style"
                    value={user.questionnaire.dietStyle}
                  />
                )}
              </BlurView>

              {/* Details Section */}
              <BlurView intensity={20} tint="dark" style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Personal Details</Text>
                  <TouchableOpacity onPress={() => console.log("Edit details")}>
                    <Ionicons name="pencil" size={18} color={Colors.mainBlue} />
                  </TouchableOpacity>
                </View>
                
                {user.questionnaire.gender && (
                  <DetailRow
                    icon="male-female-outline"
                    label="Gender"
                    value={user.questionnaire.gender}
                  />
                )}
                
                {user.questionnaire.age && (
                  <DetailRow
                    icon="calendar-outline"
                    label="Age"
                    value={`${user.questionnaire.age} years`}
                  />
                )}
                
                {user.profileDetails?.height && (
                  <DetailRow
                    icon="arrow-up-sharp"
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
                
                {user.questionnaire.occupation && (
                  <DetailRow
                    icon="briefcase-outline"
                    label="Occupation"
                    value={user.questionnaire.occupation}
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
              </BlurView>

              {/* Workout Section */}
              {user.questionnaire.workouts?.doWorkouts && (
                <BlurView intensity={20} tint="dark" style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Workout Preferences</Text>
                    <TouchableOpacity>
                      <Ionicons name="barbell-outline" size={18} color={Colors.mainBlue} />
                    </TouchableOpacity>
                  </View>
                  
                  {user.questionnaire.workouts.type && (
                    <DetailRow
                      icon="fitness-outline"
                      label="Workout Type"
                      value={user.questionnaire.workouts.type}
                    />
                  )}
                  
                  {user.questionnaire.workouts.duration && (
                    <DetailRow
                      icon="time-outline"
                      label="Duration"
                      value={user.questionnaire.workouts.duration}
                    />
                  )}
                  
                  {user.questionnaire.workouts.days && user.questionnaire.workouts.days.length > 0 && (
                    <DetailRow
                      icon="calendar-outline"
                      label="Workout Days"
                      value={user.questionnaire.workouts.days.join(', ')}
                    />
                  )}
                  
                  {user.questionnaire.workouts.time && (
                    <DetailRow
                      icon="alarm-outline"
                      label="Preferred Time"
                      value={user.questionnaire.workouts.time}
                    />
                  )}
                </BlurView>
              )}

              {/* Diet Section */}
              {(user.questionnaire.dietStyle || user.questionnaire.foodsToAvoid) && (
                <BlurView intensity={20} tint="dark" style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Diet Preferences</Text>
                    <TouchableOpacity>
                      <Ionicons name="nutrition-outline" size={18} color={Colors.mainBlue} />
                    </TouchableOpacity>
                  </View>
                  
                  {user.questionnaire.dietStyle && (
                    <DetailRow
                      icon="restaurant-outline"
                      label="Diet Style"
                      value={user.questionnaire.dietStyle}
                    />
                  )}
                  
                  {user.questionnaire.spiceLevel && (
                    <DetailRow
                      icon="flame-outline"
                      label="Spice Level"
                      value={user.questionnaire.spiceLevel}
                    />
                  )}
                  
                  {user.questionnaire.homeCuisine && (
                    <DetailRow
                      icon="home-outline"
                      label="Home Cuisine"
                      value={user.questionnaire.homeCuisine}
                    />
                  )}
                  
                  {user.questionnaire.cookingLevel && (
                    <DetailRow
                      icon="restaurant-outline"
                      label="Cooking Level"
                      value={user.questionnaire.cookingLevel}
                    />
                  )}
                </BlurView>
              )}
            </>
          ) : (
            // Show EmptyState when no questionnaire data is available
            <EmptyState />
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => router.push("/(onboarding)/Questionnaire")}
            >
              <LinearGradient
                colors={[Colors.mainBlue, Colors.mainBlue + 'CC']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="create-outline" size={18} color="white" style={{marginRight: 8}} />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            {/* <TouchableOpacity style={styles.shareButton}>
              <BlurView intensity={30} tint="dark" style={styles.shareButtonContent}>
                <Ionicons name="share-social-outline" size={18} color="white" style={{marginRight: 8}} />
                <Text style={styles.shareButtonText}>Share Progress</Text>
              </BlurView>
            </TouchableOpacity> */}
          </View>
        </ScrollView>
      </View>
    </ScreenTransitionView>
  );
}

const DetailRow = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
  <View style={styles.row}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon as any} size={18} color={Colors.mainBlue} />
    </View>
    <View style={styles.rowTextContainer}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  </View>
);

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Ionicons name="person-circle-outline" size={70} color={Colors.mainBlue} />
    <Text style={styles.emptyTitle}>Complete Your Profile</Text>
    <Text style={styles.emptyText}>
      You haven't completed the questionnaire yet. Fill it out to get personalized recommendations.
    </Text>
    <TouchableOpacity 
      style={styles.emptyButton}
      onPress={() => router.push("/(onboarding)/Questionnaire")}
    >
      <LinearGradient
        colors={[Colors.mainBlue, Colors.mainBlue + 'CC']}
        style={styles.emptyButtonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.emptyButtonText}>Complete Questionnaire</Text>
      </LinearGradient>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.PitchBlack,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.PitchBlack,
  },
  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.25,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 20,
  },
  avatarOuterContainer: {
    marginBottom: 15,
  },
  avatarGradientBorder: {
    width: 122,
    height: 122,
    borderRadius: 61,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  avatarContainer: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: '#1E1E2E',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1E1E2E',
  },
  avatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  emptyAvatarContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1E1E2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    zIndex: 10,
  },
  cameraGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.mainBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: "#ffffff",
    marginTop: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#9aa0c0',
    fontSize: 16,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 30, 46, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9aa0c0',
    letterSpacing: 0.5,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconContainer: {
    backgroundColor: 'rgba(30, 30, 46, 0.8)',
    borderRadius: 12,
    padding: 10,
    marginRight: 16,
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTextContainer: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 13,
    color: "#9aa0c0",
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  rowValue: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  fitnessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  fitnessItem: {
    alignItems: 'center',
  },
  fitnessIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 46, 0.8)',
    marginBottom: 10,
  },
  fitnessValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  fitnessLabel: {
    fontSize: 12,
    color: '#9aa0c0',
    letterSpacing: 0.3,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  editButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: Colors.mainBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: 'center',
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  shareButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  shareButtonContent: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: 'center',
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#ffffff",
    marginTop: 12,
    letterSpacing: 0.3,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#FF4B55",
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  retryText: {
    color: "#ffffff",
    fontSize: 16,
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
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 15, 25, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    margin: 24,
    marginTop: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#ffffffcc',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  emptyButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});