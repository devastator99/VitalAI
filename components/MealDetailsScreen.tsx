import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, type StyleProp, type ViewStyle, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, SlideInDown, ZoomIn, useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { ContextMenuSeparator } from '~/components/context-menu';
import Colors from '~/utils/Colors';

const MEAL_DETAILS = {
  '1': {
    title: 'Overnight Oats with Berries',
    image: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800',
    calories: 350,
    time: 'Breakfast',
    ingredients: [
      '1 cup rolled oats',
      '1 cup almond milk',
      '1 tbsp chia seeds',
      '1 tbsp honey',
      'Mixed berries',
      'Sliced almonds',
    ],
    instructions: [
      'Mix oats, almond milk, and chia seeds in a jar',
      'Add honey and stir well',
      'Cover and refrigerate overnight',
      'Top with fresh berries and almonds before serving',
    ],
    nutritionFacts: {
      protein: '12g',
      carbs: '45g',
      fats: '9g',
      fiber: '8g',
    },
  },
  '2': {
    title: 'Quinoa Salad',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    calories: 250,
    time: 'Lunch',
    ingredients: [
      '1 cup cooked quinoa',
      '1/2 cup cherry tomatoes, halved',
      '1/2 cucumber, diced',
      '1/4 cup feta cheese, crumbled',
      '2 tbsp olive oil',
      'Salt and pepper to taste',
    ],
    instructions: [
      'In a large bowl, combine quinoa, tomatoes, cucumber, and feta.',
      'Drizzle with olive oil and season with salt and pepper.',
      'Toss to combine and serve chilled.',
    ],
    nutritionFacts: {
      protein: '8g',
      carbs: '30g',
      fats: '10g',
      fiber: '5g',
    },
  },
  '3': {
    title: 'Grilled Chicken Tacos',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
    calories: 400,
    time: 'Dinner',
    ingredients: [
      '2 chicken breasts, grilled and sliced',
      '4 corn tortillas',
      '1 avocado, sliced',
      '1/2 cup salsa',
      '1/4 cup cilantro, chopped',
    ],
    instructions: [
      'Grill chicken breasts until cooked through and slice.',
      'Warm tortillas in a skillet.',
      'Assemble tacos with chicken, avocado, salsa, and cilantro.',
      'Serve immediately.',
    ],
    nutritionFacts: {
      protein: '30g',
      carbs: '40g',
      fats: '15g',
      fiber: '3g',
    },
  },
};

const AnimatedImage = Animated.Image;
const AnimatedView = Animated.View;

interface MealDetailsProps {
  id: string;
  style?: StyleProp<ViewStyle>;
  onClose: () => void;
}

export default function MealDetails({ id, style, onClose }: MealDetailsProps) {
  const meal = MEAL_DETAILS[id as keyof typeof MEAL_DETAILS];
  const fadeAnim = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);

  console.log(meal);
  console.log(id);
  console.log("MEAL_DETAILS");

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 500 });
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    contentTranslateY.value = withDelay(200, withTiming(0, { duration: 500 }));
  }, []);

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }]
  }));

  if (!meal) return null;

  return (
    <ScrollView style={[styles.container, style]}>
      <AnimatedImage
        source={{ uri: meal.image }}
        style={[styles.image, imageAnimatedStyle]}
      />
      
      <AnimatedView 
        style={styles.closeButton}
        entering={FadeInDown.delay(200).duration(500)}
      >
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </AnimatedView>

      <AnimatedView style={[styles.content, contentAnimatedStyle]}>
        <Text style={styles.title}>{meal.title}</Text>
        
        <View style={styles.nutritionGrid}>
          {Object.entries(meal.nutritionFacts).map(([key, value], index) => {
            const itemOpacity = useSharedValue(0);
            const itemScale = useSharedValue(0.8);
            
            useEffect(() => {
              itemOpacity.value = withDelay(index * 100, withTiming(1, { duration: 300 }));
              itemScale.value = withDelay(index * 100, withTiming(1, { duration: 300 }));
            }, []);

            const itemStyle = useAnimatedStyle(() => ({
              opacity: itemOpacity.value,
              transform: [{ scale: itemScale.value }]
            }));

            return (
              <AnimatedView
                key={key}
                style={[styles.nutritionItem, itemStyle]}
              >
                <Text style={styles.nutritionValue}>{value}</Text>
                <Text style={styles.nutritionLabel}>{key}</Text>
              </AnimatedView>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {meal.ingredients.map((ingredient, index) => (
            <Text key={index} style={styles.listItem}>• {ingredient}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {meal.instructions.map((instruction, index) => (
            <Text key={index} style={styles.listItem}>
              {index + 1}. {instruction}
            </Text>
          ))}
        </View>
      </AnimatedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: -40,
    backgroundColor: '#121212',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.mainBlue,
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#A0A0A0',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.mainBlue,
    marginBottom: 12,
  },
  listItem: {
    fontSize: 16,
    color: '#E0E0E0',
    marginBottom: 8,
    lineHeight: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 40,
    marginTop: -4,
  },
});