import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Animated, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Easing,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Plan {
  _id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  completed: boolean;
  time: string;
}

const dummyPlans: Plan[] = [
  { _id: '1', name: 'Avocado Toast', calories: 320, protein: 8, carbs: 34, completed: false, time: '08:00 AM' },
  { _id: '2', name: 'Grilled Salmon', calories: 420, protein: 35, carbs: 12, completed: false, time: '01:00 PM' },
  { _id: '3', name: 'Protein Shake', calories: 180, protein: 25, carbs: 10, completed: false, time: '04:30 PM' },
  { _id: '4', name: 'Chicken Salad', calories: 280, protein: 22, carbs: 18, completed: false, time: '07:00 PM' },
];

const DietPanel = () => {
  const [plans, setPlans] = useState(dummyPlans);
  const animatedValues = useRef(plans.map(() => new Animated.Value(0))).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate items in sequence
    Animated.stagger(100, animatedValues.map(av => 
      Animated.spring(av, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6
      })
    )).start();
  }, []);

  useEffect(() => {
    // Update progress animation
    const completedCount = plans.filter(p => p.completed).length;
    const progress = completedCount / plans.length;
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false
    }).start();
  }, [plans]);

  const toggleCompletion = (id: string) => {
    setPlans(prev => prev.map(plan => 
      plan._id === id ? { ...plan, completed: !plan.completed } : plan
    ));
  };

  const progressInterpolate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Nutrition</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View 
                style={[styles.progressBar, { width: progressInterpolate }]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progressAnim as unknown as number * 100)}% Complete
            </Text>
          </View>
        </View>

        <FlatList
          data={plans}
          keyExtractor={item => item._id}
          renderItem={({ item, index }) => (
            <Animated.View
              style={[
                styles.item,
                {
                  opacity: animatedValues[index],
                  transform: [
                    { translateY: animatedValues[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0]
                    })}
                  ]
                }
              ]}
            >
              <MealItem 
                plan={item} 
                onToggle={toggleCompletion}
              />
            </Animated.View>
          )}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const MealItem = ({ plan, onToggle }: { plan: Plan, onToggle: (id: string) => void }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => onToggle(plan._id));
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={handlePress}
    >
      <LinearGradient
        colors={['#ffffff10', '#ffffff05']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View style={styles.cardHeader}>
            <Text style={styles.time}>{plan.time}</Text>
            <View style={styles.checkButton}>
              {plan.completed ? (
                <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
              ) : (
                <View style={styles.circle} />
              )}
            </View>
          </View>
          
          <Text style={styles.mealName}>{plan.name}</Text>
          
          <View style={styles.nutritionRow}>
            <NutritionPill label="Calories" value={plan.calories} unit="kcal" />
            <NutritionPill label="Protein" value={plan.protein} unit="g" />
            <NutritionPill label="Carbs" value={plan.carbs} unit="g" />
          </View>
        </Animated.View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const NutritionPill = ({ label, value, unit }: { label: string, value: number, unit: string }) => (
  <View style={styles.pill}>
    <Text style={styles.pillValue}>{value}</Text>
    <Text style={styles.pillLabel}>{label}<Text style={styles.pillUnit}> {unit}</Text></Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBackground: {
    width: width - 48,
    height: 8,
    backgroundColor: '#ffffff20',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    color: '#ffffff90',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  item: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ffffff15',
    backgroundColor: '#ffffff05',
    backdropFilter: 'blur(10px)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  time: {
    color: '#ffffff90',
    fontSize: 14,
    fontWeight: '500',
  },
  checkButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ffffff50',
  },
  mealName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pill: {
    backgroundColor: '#ffffff10',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  pillValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  pillLabel: {
    color: '#ffffff80',
    fontSize: 12,
    fontWeight: '500',
  },
  pillUnit: {
    fontSize: 10,
  },
});

export default DietPanel;