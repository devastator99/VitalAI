import { useLocalSearchParams, useRouter } from 'expo-router';
import MealDetailsScreen from '~/components/MealDetailsScreen';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Colors from '~/utils/Colors';
import IconCircle from '~/components/IconCircle';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MealDetailsRoute() {
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
          <Text style={styles.titleWhite}>Meal </Text>
          <Text style={styles.titleBlue}>Details</Text>
        </View>
        <View style={{ width: 50 }} />
      </View>
      <MealDetailsScreen id={id} style={styles.content} />
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
  content: {
    flex: 1,
  },
}); 