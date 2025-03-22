import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

const UserDetailsForm = () => {
  // State for form fields and step tracking
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Animation function
  const animateForm = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Trigger animation on step change
  useEffect(() => {
    animateForm();
  }, [step]);

  // Handle "Next" or "Submit" button press
  const handleNext = () => {
    if (step === 1 && !name) {
      Alert.alert('Validation Error', 'Please enter your name.');
      return;
    }
    if (step === 2 && (!height || isNaN(Number(height)) || Number(height) < 50 || Number(height) > 250)) {
      Alert.alert('Validation Error', 'Please enter a valid height (50-250 cm).');
      return;
    }
    if (step === 3 && (!weight || isNaN(Number(weight)) || Number(weight) < 20 || Number(weight) > 300)) {
      Alert.alert('Validation Error', 'Please enter a valid weight (20-300 kg).');
      return;
    }
    if (step === 4 && (!age || isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120)) {
      Alert.alert('Validation Error', 'Please enter a valid age (1-120 years).');
      return;
    }
    if (step < 5) {
      setStep(step + 1);
    } else {
      Alert.alert('Success', 'Form submitted successfully!');
      // Add actual submission logic here (e.g., API call)
    }
  };

  // Render the current form step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Animated.View style={[styles.fieldContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View style={[styles.fieldContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your height"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
            />
          </Animated.View>
        );
      case 3:
        return (
          <Animated.View style={[styles.fieldContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your weight"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          </Animated.View>
        );
      case 4:
        return (
          <Animated.View style={[styles.fieldContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </Animated.View>
        );
      case 5:
        return (
          <Animated.View style={[styles.fieldContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.label}>Gender</Text>
            <Picker
              selectedValue={gender}
              style={styles.picker}
              onValueChange={(itemValue) => setGender(itemValue)}
            >
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={['#ff7e5f', '#feb47b']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Anubhooti!</Text>
          <Text style={styles.subtitle}>Please provide your details</Text>
        </View>
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View
              key={item}
              style={[
                styles.progressDot,
                { backgroundColor: item <= step ? '#00796b' : '#b2dfdb' },
              ]}
            />
          ))}
        </View>
        {renderStep()}
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{step < 5 ? 'Next' : 'Submit'}</Text>
          <Ionicons name="arrow-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796b',
  },
  subtitle: {
    fontSize: 16,
    color: '#004d40',
    marginTop: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  fieldContainer: {
    width: width * 0.8,
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#004d40',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 10,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00796b',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
});

export default UserDetailsForm;