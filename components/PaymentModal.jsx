import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, NativeModules, NativeEventEmitter, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api"
import RazorpayWebView from './RazorpayWebView';
import CachedImage from './CachedImage';
import FastImage from "@d11/react-native-fast-image";

const PaymentModal = ({ visible, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isPaying, setIsPaying] = useState(false);
  const buttonScale = useSharedValue(1);
  const CreateOrder = useAction(api.razorpay.createOrder);
  const VerifyPayment = useAction(api.razorpay.verifyPayment);
  const [showWebView, setShowWebView] = useState(false);
  const [webViewOrderId, setWebViewOrderId] = useState('');
  const [checkoutHTML, setCheckoutHTML] = useState('');

  useEffect(() => {
    const { RazorpayEventEmitter } = NativeModules;
    if (RazorpayEventEmitter) {
      const razorpayEmitter = new NativeEventEmitter(RazorpayEventEmitter);
      const paymentSuccessSubscription = razorpayEmitter.addListener('Razorpay::PAYMENT_SUCCESS', (data) => {
        console.log('Payment success:', data);
      });
      const paymentErrorSubscription = razorpayEmitter.addListener('Razorpay::PAYMENT_ERROR', (error) => {
        console.log('Payment error:', error);
      });

      return () => {
        paymentSuccessSubscription.remove();
        paymentErrorSubscription.remove();
      };
    } else {
      console.error('RazorpayEventEmitter is not available.');
    }
  }, []);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const handlePayPress = async () => {
    try {
      const orderId = await CreateOrder({ amount: 500 });
      const checkoutPage = await getCheckoutPage({ orderId });
      setCheckoutHTML(checkoutPage);
      setShowWebView(true);
    } catch (error) {
      Alert.alert("Error", "Failed to create order");
    } finally {
      setIsPaying(false);
    }
  };

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  const handleWebViewClose = async (success, paymentData) => {
    setShowWebView(false);
    if (success) {
      try {
        const isValid = await VerifyPayment({
          orderId: paymentData.orderId,
          paymentId: paymentData.paymentId,
          signature: paymentData.signature
        });
        
        if (isValid) {
          Alert.alert("Success", "Payment verified successfully!");
          onClose(true);
        } else {
          Alert.alert("Error", "Payment verification failed.");
          onClose(false);
        }
      } catch (error) {
        Alert.alert("Error", "Verification failed: " + error.message);
        onClose(false);
      }
    } else {
      onClose(false);
    }
  };

  return (
    <>
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.modal}>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>×</Text>
            </Pressable>

            <Text style={styles.title}>Diabetes Care Pro Plan</Text>
            <Text style={styles.subtitle}>$29.99/month</Text>

            <View style={styles.features}>
              <View style={styles.featureItem}>
                <CachedImage
                  source={require('../assets/images/pngegg.png')}
                  style={styles.icon}
                />
                <Text style={styles.featureText}>24/7 Glucose Monitoring</Text>
              </View>
              <View style={styles.featureItem}>
                <CachedImage
                  source={require('../assets/images/pngegg.png')}
                  style={styles.icon}
                />
                <Text style={styles.featureText}>Personalized Diet Plans</Text>
              </View>
              <View style={styles.featureItem}>
                <CachedImage
                  source={require('../assets/images/pngegg.png')}
                  style={styles.icon}
                />
                <Text style={styles.featureText}>Expert Consultations</Text>
              </View>
            </View>

            <View style={styles.paymentMethods}>
              <Pressable
                style={[
                  styles.methodButton,
                  paymentMethod === 'card' && styles.selectedMethod,
                ]}
                onPress={() => setPaymentMethod('card')}
              >
                <CachedImage
                  source={require('../assets/images/pngegg.png')}
                  style={styles.methodIcon}
                />
                <Text style={styles.methodText}>Credit/Debit Card</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.methodButton,
                  paymentMethod === 'paypal' && styles.selectedMethod,
                ]}
                onPress={() => setPaymentMethod('paypal')}
              >
                <CachedImage
                  source={require('../assets/images/pngegg.png')}
                  style={styles.methodIcon}
                />
                <Text style={styles.methodText}>PayPal</Text>
              </Pressable>
            </View>

            <Animated.View style={[animatedStyles, { width: '100%' }]}>
              <Pressable
                onPress={handlePayPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isPaying}
                style={styles.payButton}
              >
                <LinearGradient
                  colors={['#4A90E2', '#6B46E5']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                >
                  {isPaying ? (
                    // <DotLottieReact
                    //   src={loadingg}
                    //   autoPlay
                    //   style={styles.loader}
                    // />
                    <Text>LoAdInGg</Text>
                  ) : (
                    <Text style={styles.payButtonText}>Pay Now</Text>
                  )}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
      <RazorpayWebView
        visible={showWebView}
        onClose={handleWebViewClose}
        orderDetails={{ checkoutPage: checkoutHTML }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#4A5568',
    marginBottom: 24,
  },
  features: {
    width: '100%',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#4A5568',
  },
  paymentMethods: {
    width: '100%',
    marginBottom: 24,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedMethod: {
    borderColor: '#4A90E2',
    backgroundColor: '#F8FAFC',
  },
  methodIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  methodText: {
    fontSize: 16,
    color: '#2D3748',
  },
  payButton: {
    borderRadius: 14,
    overflow: 'hidden',
    height: 56,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  closeIcon: {
    fontSize: 24,
    color: '#718096',
  },
  loader: {
    width: 40,
    height: 40,
  },
});

export default PaymentModal;