import { useLocalSearchParams, useRouter } from 'expo-router';
import ExerciseDetails from '~/components/ExerciseDetails';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Colors from '~/utils/Colors';
import IconCircle from '~/components/IconCircle';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Suspense } from 'react';
import { ActivityIndicator } from 'react-native';

// Loading component for Suspense fallback
const LoadingIndicator = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={Colors.mainBlue} />
    <Text style={styles.loadingText}>Loading exercise details...</Text>
  </View>
);

export default function ExerciseDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  if (!id) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginLeft: 16, paddingEnd: 10 }}
        >
          <IconCircle name="chevron-back-sharp" size={17} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.titleWhite}>Exercise </Text>
          <Text style={styles.titleBlue}>Details</Text>
        </View>
        <View style={{ width: 50 }} />
      </View>
      
      <Suspense fallback={<LoadingIndicator />}>
        <ExerciseDetails id={id}/>
      </Suspense>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PitchBlack,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.PitchBlack,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWhite: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '400',
  },
  titleBlue: {
    color: Colors.mainBlue,
    fontSize: 20,
    fontWeight: '400',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.white,
    marginTop: 16,
    fontSize: 16,
  },
}); 