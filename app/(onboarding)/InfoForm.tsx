import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "@clerk/clerk-expo";
import Animated, {
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
} from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Id } from "~/convex/_generated/dataModel";

interface FormData {
  name: string;
  profileDetails: {
    picture?: Id<"_storage">;
    height: number;
    weight: number;
  };
}

export default function InfoForm() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [canSubmit, setCanSubmit] = useState(false);
  const [bmi, setBmi] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    profileDetails: {
      height: 0,
      weight: 0,
    },
  });
  const saveUserInfo = useMutation(api.users.updateProfileDetails);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const saveImage = useMutation(api.files.saveProfilePicture);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const curruser = useQuery(api.users.getCurrentUser);
  const profilePicture = curruser?.profileDetails?.picture;
  const imageUrl = useQuery(
    api.files.getImageUrl,
    profilePicture ? { storageId: profilePicture } : "skip"
  );

  useEffect(() => {
    if (user?.id && !userId) {
      setUserId(user.id);
    }
  }, [user]);

  const userStatusResult = useQuery(
    api.users.getStatus,
    userId ? { userId } : "skip"
  );

  useEffect(() => {
    const { height, weight } = formData.profileDetails;
    setCanSubmit(height > 0 && weight > 0);
  }, [formData.profileDetails]);

  useEffect(() => {
    const { height, weight } = formData.profileDetails;
    if (height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      const calculatedBmi = weight / (heightInMeters * heightInMeters);
      setBmi(parseFloat(calculatedBmi.toFixed(1))); // Round to 1 decimal place
    } else {
      setBmi(null); // Reset BMI if inputs are invalid
    }
  }, [formData.profileDetails.height, formData.profileDetails.weight]);

  const handleSelectImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;

      try {
        const postUrl = await generateUploadUrl();
        const fileData = await fetch(uri);
        if (!fileData.ok) {
          console.error("Error loading file from URI:", fileData);
          throw new Error("Failed to load image from URI");
        }
        const blob = await fileData.blob();
        const uploadResult = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": "image/jpeg" },
          body: blob,
        });

        if (!uploadResult.ok) {
          throw new Error("Failed to upload image to Convex");
        }

        const { storageId } = await uploadResult.json();
        await saveImage({ picastorageId: storageId });
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Error uploading image. Please try again.");
      }
    }
  };

  const handleSubmit = async () => {
    try {
      await saveUserInfo(formData);
      if (userStatusResult === undefined) return;
      userStatusResult
        ? router.replace("/(auth)/(drawer)/(ai-chat)/new")
        : router.push("/(onboarding)/waiting");
    } catch (error) {
      console.error("Error saving user info:", error);
      alert("Error saving profile. Please try again.");
    }
  };

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.gradient}>
      <View style={styles.container}>
        {step === 1 ? (
          <Animated.View
            entering={SlideInRight}
            exiting={SlideOutLeft}
            style={styles.stepContainer}
          >
            <Text style={styles.title}>What's your name?</Text>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              placeholder="Enter your full name"
              placeholderTextColor="#ffffff90"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              style={styles.input}
            />
            <TouchableOpacity
              style={[styles.button, !formData.name && styles.disabledButton]}
              onPress={() => setStep(2)}
              disabled={!formData.name}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View
            entering={SlideInLeft}
            exiting={SlideOutRight}
            style={styles.stepContainer}
          >
            <Text style={styles.title}>Almost there!</Text>
            <Text style={styles.label}>Profile Photo</Text>
            <Image
              source={
                imageUrl
                  ? { uri: imageUrl }
                  : require("../../assets/images/asuka-2239.gif")
              }
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={[styles.button, styles.imageButton]}
              onPress={handleSelectImage}
            >
              <Text style={styles.buttonText}>
                {imageUrl ? "Change Photo" : "Upload Photo"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              placeholder="Enter your height"
              placeholderTextColor="#ffffff90"
              value={formData.profileDetails.height?.toString()}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  profileDetails: {
                    ...formData.profileDetails,
                    height: Number(text),
                  },
                })
              }
              style={styles.input}
              keyboardType="numeric"
            />
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              placeholder="Weight (kg)"
              placeholderTextColor="#ffffff90"
              value={formData.profileDetails.weight?.toString()}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  profileDetails: {
                    ...formData.profileDetails,
                    weight: Number(text),
                  },
                })
              }
              style={styles.input}
              keyboardType="numeric"
            />
            <View style={styles.bmiContainer}>
              <Text style={styles.bmiLabel}>Your BMI</Text>
              <Text style={styles.bmiValue}>{bmi !== null ? bmi : "--"}</Text>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setStep(1)}
              >
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, !canSubmit && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={!canSubmit}
              >
                <Text style={styles.buttonText}>Complete Profile</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  stepContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    color: "white",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  button: {
    backgroundColor: "#4c51bf",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginTop: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#718096",
  },
  secondaryButton: {
    backgroundColor: "#4a5568",
  },
  imageButton: {
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bmiContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bmiLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  bmiValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "white",
  },
});
