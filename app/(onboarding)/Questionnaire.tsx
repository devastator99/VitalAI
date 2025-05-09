import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Questionnaire from '~/components/Questionnaire';
import { useMutation } from 'convex/react';
import { api } from '~/convex/_generated/api';
import Colors from '~/utils/Colors';

export default function QuestionnaireScreen() {
  const router = useRouter();
  const updateUserProfile = useMutation(api.users.updateUserProfile);

  const handleQuestionnaireComplete = async (data: any) => {
    try {
      // Save questionnaire data to user profile
      await updateUserProfile({
        questionnaire: {
          ...data,
          completedAt: new Date().toISOString()
        }
      });
      
      // Navigate to waiting screen
      router.replace('/waiting');
    } catch (error) {
      console.error('Error saving questionnaire data:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Questionnaire onComplete={handleQuestionnaireComplete} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PitchBlack,
  },
}); 