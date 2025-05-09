import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '~/utils/Colors';
import { useRouter } from 'expo-router';

export const EmptyHabitState = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00000000', '#00254d33']}
        style={styles.gradientContainer}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="leaf-outline" size={80} color={Colors.mainBlue} />
        </View>
        
        <Text style={styles.title}>No Habits Yet</Text>
        <Text style={styles.subtitle}>
          Start your journey to better habits today
        </Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(details)/createHabit')}
        >
          <LinearGradient
            colors={[Colors.mainBlue + 'dd', '#00254d']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.buttonText}>Create Your First Habit</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.tipsContainer}>
          <View style={styles.tipRow}>
            <Ionicons name="bulb-outline" size={20} color={Colors.mainBlue} />
            <Text style={styles.tipText}>Track daily activities</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="trophy-outline" size={20} color={Colors.mainBlue} />
            <Text style={styles.tipText}>Build lasting habits</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="trending-up-outline" size={20} color={Colors.mainBlue} />
            <Text style={styles.tipText}>Monitor your progress</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PitchBlack,
  },
  gradientContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#ffffff08',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.mainBlue + '33',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: Colors.mainBlue + '33',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  tipsContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff08',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffffff15',
  },
  tipText: {
    color: '#ccc',
    fontSize: 16,
    flex: 1,
  },
});
