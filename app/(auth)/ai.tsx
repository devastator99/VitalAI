import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import PaymentModal from '../../components/PaymentModal'; // Adjust the path as needed

const ai = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Diabetes Care Plan</Text>
      
      <Pressable
        style={styles.subscribeButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
      </Pressable>

      <PaymentModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F7FAFC',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 40,
  },
  subscribeButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    elevation: 3,
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ai;