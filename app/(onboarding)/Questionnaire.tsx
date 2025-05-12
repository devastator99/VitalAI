import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import Questionnaire from '~/components/Questionnaire';
import { useMutation, useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { Id } from '~/convex/_generated/dataModel';

export default function QuestionnaireScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const saveUserInfo = useMutation(api.users.updateProfileDetails);
  const saveQuestionnaire = useMutation(api.users.updateUserProfile);
  const router = useRouter();
  const userCurrent = useQuery(api.users.getCurrentUser);

  const handleComplete = async (data: any) => {
    try {
      setIsLoading(true);
      
      // First, save the profile details
      const profileData = {
        name: data.name,
        profileDetails: {
          picture: data.profilePicture,
          height: parseFloat(data.height),
          weight: parseFloat(data.weight),
        }
      };
      
      await saveUserInfo(profileData);
      
      // Remove profile-specific fields from questionnaire data
      const { name, profilePicture, ...questionnaireData } = data;
      
      // Then save the questionnaire data
      await saveQuestionnaire({ 
        userId: userCurrent?._id as Id<"users">,
        questionnaire: questionnaireData 
      });
      
      // Navigate to waiting screen
      router.replace("/(onboarding)/waiting");
    } catch (error) {
      console.error('Error saving data:', error);
      alert('There was an error saving your information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Questionnaire 
        onComplete={handleComplete}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
}); 