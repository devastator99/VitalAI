import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import Questionnaire from '~/components/Questionnaire';
import { useMutation, useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { Id } from '~/convex/_generated/dataModel';

export default function QuestionnaireScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const submitQuestionnaire = useMutation(api.users.submitQuestionnaire);
  const router = useRouter();
  const userCurrent = useQuery(api.users.getCurrentUser);

  const handleComplete = async (data: any) => {
    console.log("inside handlequestionnaireComplete");
    let navigated = false;
    console.log("userCurrent", userCurrent);
    try {
      setIsLoading(true);
      console.log("inside try block");

      await submitQuestionnaire(data);
      
      console.log("questionnaireData saved");
      
      // Check if this is an edit (user already exists) or new profile creation
      const isEditMode = userCurrent?.questionnaire?.completedAt;
      console.log("isEditMode", isEditMode);
      
      if (isEditMode) {
        console.log("editing");
        // If editing, go back to profile with edited parameter
        router.replace({
          pathname: "/(auth)/Profile",
          params: { edited: "true" }
        });
        navigated = true;
      } else {
        console.log("new user");
        // If new user, go to waiting screen
        router.replace("/(onboarding)/waiting");
        navigated = true;
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('There was an error saving your information. Please try again.');
    } finally {
      setIsLoading(false);
      // Fallback: If not navigated, force navigation to waiting
      if (!navigated) {
        router.replace("/(onboarding)/waiting");
      }
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