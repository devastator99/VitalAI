// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Play, Sparkles } from 'lucide-react-native';
// import NextSessionModal from './NextMeal';

// const NextSessionModalDemo: React.FC = () => {
//   const [modalVisible, setModalVisible] = useState(false);

//   const handleNavigate = (screenName: 'HabitTracker' | 'Plans' | 'Profile' | 'Chat') => {
//     Alert.alert('Navigation', `Navigating to ${screenName}`);
//   };

//   const sampleMeal = {
//     title: 'Mediterranean Quinoa Bowl',
//     imageUri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
//     time: 'in 1 hour 30 min'
//   };

//   const sampleExercise = {
//     title: 'HIIT Cardio Blast',
//     imageUri: 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=800',
//     reps: '4 rounds × 45 sec'
//   };

//   return (
//     <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
//       <SafeAreaView style={styles.container}>
//         <View style={styles.content}>
//           <View style={styles.header}>
//             <Sparkles size={32} color="#fff" />
//             <Text style={styles.title}>NextSessionModal Demo</Text>
//             <Text style={styles.subtitle}>
//               Tap the button below to see the beautiful modal in action
//             </Text>
//           </View>

//           <TouchableOpacity
//             style={styles.demoButton}
//             onPress={() => setModalVisible(true)}
//             activeOpacity={0.9}
//           >
//             <LinearGradient
//               colors={['#ff6b6b', '#ee5a24']}
//               style={styles.buttonGradient}
//             >
//               <Play size={24} color="#fff" />
//               <Text style={styles.buttonText}>Show Modal</Text>
//             </LinearGradient>
//           </TouchableOpacity>

//           <View style={styles.features}>
//             <Text style={styles.featuresTitle}>Features</Text>
//             <View style={styles.featureList}>
//               <Text style={styles.featureItem}>• Beautiful blur and gradient effects</Text>
//               <Text style={styles.featureItem}>• Skeleton loading placeholders</Text>
//               <Text style={styles.featureItem}>• Smooth animations and haptic feedback</Text>
//               <Text style={styles.featureItem}>• Responsive design with max width</Text>
//               <Text style={styles.featureItem}>• Custom navigation callbacks</Text>
//               <Text style={styles.featureItem}>• FastImage integration</Text>
//             </View>
//           </View>
//         </View>

//         <NextSessionModal
//           visible={modalVisible}
//           onClose={() => setModalVisible(false)}
//           meal={sampleMeal}
//           exercise={sampleExercise}
//           onNavigate={handleNavigate}
//         />
//       </SafeAreaView>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   content: {
//     flex: 1,
//     padding: 20,
//     justifyContent: 'center',
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 40,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginTop: 16,
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: 'rgba(255, 255, 255, 0.8)',
//     textAlign: 'center',
//     lineHeight: 24,
//   },
//   demoButton: {
//     borderRadius: 25,
//     overflow: 'hidden',
//     marginBottom: 40,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.3,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   buttonGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 16,
//     paddingHorizontal: 32,
//     gap: 12,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   features: {
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.2)',
//   },
//   featuresTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 16,
//   },
//   featureList: {
//     gap: 8,
//   },
//   featureItem: {
//     fontSize: 14,
//     color: 'rgba(255, 255, 255, 0.9)',
//     lineHeight: 20,
//   },
// });

// export default NextSessionModalDemo;