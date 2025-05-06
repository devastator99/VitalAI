import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import ExerciseDetails from '~/components/ExerciseDetails';
import { StyleSheet, View } from 'react-native';
import Colors from '~/utils/Colors';

export default function ExerciseDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  if (!id) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ExerciseDetails id={id} onClose={() => router.replace("/(auth)/diet")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PitchBlack,
  },
}); 