import { useSignIn, useSignUp } from "@clerk/clerk-expo";
import { SignUpResource, SignInResource } from "@clerk/types";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from "react-native";
import Colors from "~/utils/Colors";
import { api } from "~/convex/_generated/api";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
// import MaskedView from '@react-native-masked-view/masked-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lock, Mail, Eye, EyeOff, Check, X, AlertCircle, ChevronLeft } from 'lucide-react-native';

interface PhoneCodeFactor {
  strategy: 'phone_code';
  phoneNumberId: string;
}

const { width, height } = Dimensions.get('window');

const login = () => {
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const router = useRouter();
  const createUserbyclerkId = useMutation(api.users.createUserbyclerkID);
  const insets = useSafeAreaInsets();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bgAnim1 = useRef(new Animated.Value(0)).current;
  const bgAnim2 = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    code: "",
  });
  const [focused, setFocused] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputFocusAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  // New state for validation
  const [validations, setValidations] = useState({
    email: { valid: false, message: '' },
    password: { valid: false, message: '', strength: 0 },
    phone: { valid: false, message: '' }
  });

  // Reset form when switching modes
  useEffect(() => {
    setFormData({ email: "", phone: "", password: "", code: "" });
    setVerifying(false);
    
    // More subtle animation with smoother easing
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: isSignUp ? -10 : 10, // Reduced movement distance
          duration: 150,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.98, // More subtle scale
          duration: 150,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.in(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [isSignUp, authMethod]);

  // Enhanced animations
  useEffect(() => {
    // First animation - subtle horizontal drift
    Animated.loop(
      Animated.timing(bgAnim1, {
        toValue: 1,
        duration: 25000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true
      })
    ).start();
    
    // Second animation - gentle vertical drift
    Animated.loop(
      Animated.timing(bgAnim2, {
        toValue: 1,
        duration: 30000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true
      })
    ).start();
    
    // Shimmer effect for borders
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false
        })
      ])
    ).start();
  }, []);

  // More refined pulse animation - reduced from 1.03 to 1.01 to prevent overflow
  useEffect(() => {
    const pulseSequence = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.01,
        duration: 1500,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ]);
    
    Animated.loop(pulseSequence).start();
  }, []);

  // Entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(value);
      setValidations(prev => ({
        ...prev,
        email: {
          valid: isValid,
          message: isValid ? '' : 'Please enter a valid email address'
        }
      }));
    } 
    else if (field === 'password') {
      const hasMinLength = value.length >= 8;
      const hasUpperCase = /[A-Z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      
      let strength = 0;
      if (hasMinLength) strength += 1;
      if (hasUpperCase) strength += 1;
      if (hasNumber) strength += 1;
      if (hasSpecial) strength += 1;
      
      const isValid = value.length >= 8;
      
      setValidations(prev => ({
        ...prev,
        password: {
          valid: isValid,
          message: isValid ? '' : 'Password must be at least 8 characters',
          strength
        }
      }));
    }
    else if (field === 'phone') {
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      const isValid = phoneRegex.test(value.replace(/[\s-]/g, ''));
      setValidations(prev => ({
        ...prev,
        phone: {
          valid: isValid,
          message: isValid ? '' : 'Please enter a valid phone number'
        }
      }));
    }
  };

  const handleFocus = (field: string) => {
    setFocused(field);
  };

  const handleBlur = () => {
    setFocused(null);
  };

  const showError = (err: any) => {
    const errorMessage = err.errors?.[0]?.message || "Authentication failed";
    Alert.alert("Error", errorMessage);
  };

  const handleAuthSubmit = async () => {
    if (loading) return;
    
    // Button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    setLoading(true);
    try {
      if (authMethod === "email") {
        await handleEmailFlow();
      } else {
        await handlePhoneFlow();
      }
    } catch (err: any) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailFlow = async () => {
    if (isSignUp) {
      await signUp?.create({
        emailAddress: formData.email,
        password: formData.password,
      });
      await signUp?.prepareEmailAddressVerification();
      setVerifying(true);
    } else {
      const result = await signIn?.create({
        identifier: formData.email,
        password: formData.password,
      });
      
      if (result?.status === "complete") {
        await setSignInActive?.({ session: result.createdSessionId });
      }
    }
  };

  const handlePhoneFlow = async () => {
    if (isSignUp) {
      await signUp?.create({ phoneNumber: formData.phone });
      await signUp?.preparePhoneNumberVerification();
      setVerifying(true);
    } else {
      const { supportedFirstFactors } = await signIn?.create({
        identifier: formData.phone,
      }) || {};
      
      const phoneFactor = supportedFirstFactors?.find(
        (f) => f.strategy === "phone_code"
      ) as PhoneCodeFactor;

      if (phoneFactor) {
        await signIn?.prepareFirstFactor({
          strategy: "phone_code",
          phoneNumberId: phoneFactor.phoneNumberId,
        });
        setVerifying(true);
      }
    }
  };

  const handleVerification = async () => {
    if (loading || formData.code.length < 6) return;
    
    setLoading(true);
    try {
      if (authMethod === "email") {
        const result = await signUp?.attemptEmailAddressVerification({
          code: formData.code,
        });

        if (result?.status === "complete") {
          await createUserbyclerkId({
            userId: result.createdUserId!,
            role: "user",
            busy: false,
            profileDetails: {
              email: formData.email
            }
          });
          await setSignUpActive?.({ session: result.createdSessionId });
          router.replace("/");
        }
      } else {
        const result = isSignUp
          ? (await signUp?.attemptPhoneNumberVerification({ code: formData.code })) as SignUpResource
          : await signIn?.attemptFirstFactor({
              strategy: "phone_code",
              code: formData.code,
            }) as SignInResource;

        if (result?.status === "complete") {
          await (isSignUp ? setSignUpActive : setSignInActive)?.({
            session: result.createdSessionId,
          });
          
          if (isSignUp) {
            await createUserbyclerkId({
              userId: (result as SignUpResource).createdUserId!,
              role: "user",
              busy: false,
              profileDetails: {
                phone: formData.phone
              }
            });
            router.replace("/(onboarding)/Questionnaire");
          } else {
            router.replace("/");
          }
        }
      }
    } catch (err: any) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = authMethod === "email"
    ? !(formData.email && (isSignUp ? formData.password : true))
    : !formData.phone;

  const isVerifyButtonDisabled = formData.code.length < 6;

  // Animation translations
  const translateX1 = bgAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width]
  });
  
  const translateY1 = bgAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [-height/2, height/2]
  });
  
  const translateX2 = bgAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [width, -width]
  });
  
  const translateY2 = bgAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [height/2, -height/2]
  });

  const animateInputFocus = (focused: boolean) => {
    Animated.spring(inputFocusAnim, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      damping: 15,
      mass: 1,
      stiffness: 120,
    }).start();
  };

  const handlePressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      damping: 15,
      mass: 1,
      stiffness: 150,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      mass: 1,
      stiffness: 150,
    }).start();
  };

  // Get validation colors for password strength - using Colors.mainBlue
  const getStrengthColor = (strength: number) => {
    switch(strength) {
      case 0: return '#FF4B55';
      case 1: return '#FF4B55';
      case 2: return '#FFA726';
      case 3: return Colors.mainBlue;
      case 4: return '#43A047';
      default: return '#FF4B55';
    }
  };
  
  const getStrengthText = (strength: number) => {
    switch(strength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return 'Very Weak';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      <View style={styles.animatedBackground}>
        <LinearGradient
          colors={[Colors.PitchBlack, '#14142B']}
          style={StyleSheet.absoluteFill}
        />
        
        <Animated.View style={[
          styles.animatedBubble,
          {
            transform: [
              { translateX: translateX1 },
              { translateY: translateY1 }
            ]
          }
        ]} />
        
        <Animated.View style={[
          styles.animatedBubble,
          styles.animatedBubble2,
          {
            transform: [
              { translateX: translateX2 },
              { translateY: translateY2 }
            ]
          }
        ]} />
      </View>
      
      {/* Main Container */}
      <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft color="white" size={24} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {isSignUp ? "Create Account" : "Welcome back"}
          </Text>
          
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }}>
            <View style={styles.segmentContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.03)']}
                style={styles.segmentBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.authMethodContainer}>
                {["email", "phone"].map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.authMethodButton,
                      authMethod === method && styles.activeAuthMethod,
                    ]}
                    onPress={() => setAuthMethod(method as "email" | "phone")}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={authMethod === method ? 
                        [Colors.mainBlue + '40', Colors.mainBlue + '20'] : 
                        ['transparent', 'transparent']}
                      style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
                    />
                    <FontAwesome5
                      name={method === 'email' ? 'envelope' : 'mobile-alt'}
                      size={16}
                      color={authMethod === method ? Colors.mainBlue : '#ffffff66'}
                    />
                    <Text style={[
                      styles.authMethodText,
                      authMethod === method && styles.activeAuthMethodText
                    ]}>
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Form Fields */}
              <View style={styles.formContainer}>
                {verifying ? (
                  <>
                    <Text style={styles.instructions}>
                      Verification code sent to{'\n'}
                      <Text style={styles.highlightText}>
                        {authMethod === "email" ? formData.email : formData.phone}
                      </Text>
                    </Text>
                    <View style={[
                      styles.codeInputContainer,
                      focused === 'code' && styles.inputFocused
                    ]}>
                      <TextInput
                        placeholder="••••••"
                        placeholderTextColor="#ffffff66"
                        value={formData.code}
                        onChangeText={(text) => handleInputChange("code", text)}
                        style={styles.codeInput}
                        keyboardType="number-pad"
                        maxLength={6}
                        onFocus={() => handleFocus('code')}
                        onBlur={handleBlur}
                      />
                      <LinearGradient
                        colors={['rgba(79, 158, 248, 0.3)', 'rgba(140, 112, 255, 0.3)']}
                        style={[
                          styles.inputGlow,
                          { opacity: focused === 'code' ? 1 : 0 }
                        ]}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    {authMethod === "email" && (
                      <Animated.View 
                        style={[
                          styles.inputWrapper,
                          {
                            transform: [{
                              scale: inputFocusAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.02]
                              })
                            }]
                          }
                        ]}
                      >
                        <View style={[
                          styles.inputContainer,
                          focused === 'email' && styles.inputFocused,
                          formData.email.length > 0 && (validations.email.valid 
                            ? styles.validInput 
                            : styles.invalidInput)
                        ]}>
                          <FontAwesome5 name="envelope" size={16} color={focused === 'email' ? Colors.mainBlue : '#ffffff66'} style={styles.inputIcon} />
                          <TextInput
                            placeholder="Email address"
                            placeholderTextColor="#ffffff60"
                            value={formData.email}
                            onChangeText={(text) => handleInputChange("email", text)}
                            style={styles.inputField}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onFocus={() => animateInputFocus(true)}
                            onBlur={() => animateInputFocus(false)}
                          />
                          {formData.email.length > 0 && (
                            <View style={styles.validationIconContainer}>
                              {validations.email.valid ? (
                                <Check color="#66BB6A" size={18} />
                              ) : (
                                <X color="#FF4B55" size={18} />
                              )}
                            </View>
                          )}
                          <LinearGradient
                            colors={[Colors.mainBlue + '40', Colors.mainBlue + '20']}
                            style={[
                              styles.inputGlow,
                              { opacity: focused === 'email' ? 1 : 0 }
                            ]}
                          />
                        </View>
                        {!validations.email.valid && formData.email.length > 0 && (
                          <Text style={styles.validationMessage}>
                            {validations.email.message}
                          </Text>
                        )}
                      </Animated.View>
                    )}

                    {authMethod === "phone" && (
                      <Animated.View 
                        style={[
                          styles.inputWrapper,
                          {
                            transform: [{
                              scale: inputFocusAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.02]
                              })
                            }]
                          }
                        ]}
                      >
                        <View style={[
                          styles.inputContainer,
                          focused === 'phone' && styles.inputFocused,
                          formData.phone.length > 0 && (validations.phone.valid 
                            ? styles.validInput 
                            : styles.invalidInput)
                        ]}>
                          <FontAwesome5
                            name="mobile-alt"
                            size={16}
                            color={focused === 'phone' ? Colors.mainBlue : '#ffffff66'}
                            style={styles.inputIcon}
                          />
                          <TextInput
                            placeholder="Phone number"
                            placeholderTextColor="#ffffff66"
                            value={formData.phone}
                            onChangeText={(text) => handleInputChange("phone", text)}
                            style={styles.inputField}
                            keyboardType="phone-pad"
                            onFocus={() => animateInputFocus(true)}
                            onBlur={() => animateInputFocus(false)}
                          />
                          {formData.phone.length > 0 && (
                            <View style={styles.validationIconContainer}>
                              {validations.phone.valid ? (
                                <Check color="#66BB6A" size={18} />
                              ) : (
                                <X color="#FF4B55" size={18} />
                              )}
                            </View>
                          )}
                          <LinearGradient
                            colors={[Colors.mainBlue + '40', Colors.mainBlue + '20']}
                            style={[
                              styles.inputGlow,
                              { opacity: focused === 'phone' ? 1 : 0 }
                            ]}
                          />
                        </View>
                        {!validations.phone.valid && formData.phone.length > 0 && (
                          <Text style={styles.validationMessage}>
                            {validations.phone.message}
                          </Text>
                        )}
                      </Animated.View>
                    )}

                    {authMethod === "email" && (
                      <Animated.View 
                        style={[
                          styles.inputWrapper,
                          {
                            transform: [{
                              scale: inputFocusAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.02]
                              })
                            }]
                          }
                        ]}
                      >
                        <View style={[
                          styles.inputContainer,
                          focused === 'password' && styles.inputFocused,
                          formData.password.length > 0 && (validations.password.valid 
                            ? styles.validInput 
                            : styles.invalidInput)
                        ]}>
                          <FontAwesome5 name="lock" size={16} color={focused === 'password' ? Colors.mainBlue : '#ffffff66'} style={styles.inputIcon} />
                          <TextInput
                            placeholder="Password"
                            placeholderTextColor="#ffffff60"
                            value={formData.password}
                            onChangeText={(text) => handleInputChange("password", text)}
                            style={styles.inputField}
                            secureTextEntry={!isPasswordVisible}
                            onFocus={() => animateInputFocus(true)}
                            onBlur={() => animateInputFocus(false)}
                          />
                          <TouchableOpacity 
                            style={styles.inputIcon}
                            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                          >
                            {isPasswordVisible ? (
                              <EyeOff color="#ffffff80" size={16} />
                            ) : (
                              <Eye color="#ffffff80" size={16} />
                            )}
                          </TouchableOpacity>
                        </View>
                        
                        {formData.password.length > 0 && (
                          <View style={styles.passwordStrength}>
                            <View style={styles.strengthMeter}>
                              {[1, 2, 3, 4].map((index) => (
                                <View 
                                  key={index}
                                  style={[
                                    styles.strengthSegment,
                                    { backgroundColor: validations.password.strength >= index 
                                      ? getStrengthColor(validations.password.strength)
                                      : 'rgba(255, 255, 255, 0.1)' 
                                    }
                                  ]}
                                />
                              ))}
                            </View>
                            <Text style={[
                              styles.strengthText,
                              { color: getStrengthColor(validations.password.strength) }
                            ]}>
                              {getStrengthText(validations.password.strength)}
                            </Text>
                          </View>
                        )}
                      </Animated.View>
                    )}
                  </>
                )}
              </View>
            </View>

            {/* Submit Button */}
            <Animated.View style={{ 
              transform: [{ scale: pulseAnim }],
              marginTop: 30,
            }}>
              <TouchableOpacity
                onPress={verifying ? handleVerification : handleAuthSubmit}
                disabled={(verifying ? isVerifyButtonDisabled : isButtonDisabled) || loading}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                  styles.authButtonContainer,
                  (verifying ? isVerifyButtonDisabled : isButtonDisabled) && styles.disabledButton
                ]}
                activeOpacity={0.95}
              >
                <LinearGradient
                  colors={[Colors.mainBlue, Colors.mainBlue + 'CC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.authButton}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <Animated.View 
                        style={[
                          styles.loadingDot,
                          {transform: [{scale: pulseAnim}]}
                        ]} 
                      />
                    </View>
                  ) : (
                    <>
                      <Text style={styles.buttonText}>
                        {verifying 
                          ? 'Verify Code' 
                          : (isSignUp ? 'Create Account' : 'Sign In')
                        }
                      </Text>
                      <Ionicons name="arrow-forward" size={20} color="white" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Privacy indicator */}
            <View style={styles.privacyContainer}>
              <FontAwesome5 name="shield-alt" size={12} color="#9aa0c0" />
              <Text style={styles.privacyText}>Secure, encrypted connection</Text>
            </View>

            {/* Switch Account Mode */}
            <TouchableOpacity
              style={styles.switchModeContainer}
              onPress={() => setIsSignUp(!isSignUp)}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryText}>
                {isSignUp ? 'Already have an account? ' : 'Need an account? '}
                <Text style={styles.highlightText}>
                  {isSignUp ? 'Sign In' : 'Create Account'}
                </Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.PitchBlack,
  },
  animatedBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  animatedBubble: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    backgroundColor: Colors.mainBlue + '08',
  },
  animatedBubble2: {
    width: width * 2,
    height: width * 2,
    backgroundColor: Colors.mainBlue + '05',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    marginBottom: 30,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  content: {
    paddingBottom: 50,
    flexGrow: 1,
    justifyContent: 'center',
  },
  segmentContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  segmentBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
  },
  authMethodContainer: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
  },
  authMethodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 10,
    overflow: 'hidden',
  },
  activeAuthMethod: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  authMethodText: {
    color: '#ffffff80',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  activeAuthMethodText: {
    color: '#fff',
    fontWeight: '600',
  },
  formContainer: {
    padding: 24,
  },
  inputWrapper: {
    marginBottom: 20,
    borderRadius: 16,
  },
  inputWrapperFocused: {
    transform: [{ scale: 1.02 }],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  validInput: {
    borderColor: 'rgba(102, 187, 106, 0.3)',
  },
  invalidInput: {
    borderColor: 'rgba(255, 75, 85, 0.3)',
  },
  inputFocused: {
    borderColor: 'rgba(79, 158, 248, 0.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  inputIcon: {
    padding: 18,
    width: 56,
    textAlign: 'center',
  },
  inputField: {
    flex: 1,
    height: 60,
    color: 'white',
    fontSize: 16,
    paddingRight: 18,
    letterSpacing: 0.3,
  },
  validationIconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGlow: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    right: -20,
    height: 40,
    borderRadius: 20,
    opacity: 0,
  },
  validationMessage: {
    color: '#FF4B55',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 12,
  },
  passwordStrength: {
    marginTop: 12,
    marginHorizontal: 4,
  },
  strengthMeter: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    marginBottom: 6,
    gap: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  strengthText: {
    fontSize: 12,
    textAlign: 'right',
  },
  codeInputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 20,
    overflow: 'hidden',
  },
  codeInput: {
    height: 60,
    paddingHorizontal: 20,
    color: '#4f9ef8',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 8,
  },
  authButtonContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.mainBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  instructions: {
    color: '#ffffff99',
    textAlign: 'center',
    lineHeight: 26,
    fontSize: 15,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  highlightText: {
    color: Colors.mainBlue,
    fontWeight: '600',
  },
  secondaryText: {
    color: '#ffffff80',
    fontSize: 15,
    marginTop: 24,
    letterSpacing: 0.2,
  },
  switchModeContainer: {
    marginTop: 20,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.4,
  },
  loadingContainer: {
    height: 20,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: 'white',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  privacyText: {
    color: '#9aa0c0',
    fontSize: 12,
    letterSpacing: 0.2,
  },
});

export default login;