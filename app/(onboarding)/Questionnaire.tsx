import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import Questionnaire from '~/components/Questionnaire';
import { useMutation } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';

export default function QuestionnaireScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const saveUserInfo = useMutation(api.users.updateProfileDetails);
  const saveQuestionnaire = useMutation(api.users.updateUserProfile);
  const router = useRouter();
  const { user } = useUser();

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
      
      // Then save the questionnaire data
      await saveQuestionnaire({ 
        questionnaire: data 
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