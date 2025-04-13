import { useSignIn, useSignUp } from "@clerk/clerk-expo";
import { SignUpResource ,SignInResource} from "@clerk/types";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ScrollView,
  SafeAreaView,
} from "react-native";
import Colors from "~/utils/Colors";
import { api } from "~/convex/_generated/api";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

interface PhoneCodeFactor {
  strategy: 'phone_code';
  phoneNumberId: string;
}

const login = () => {
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const router = useRouter();
  const createUserbyclerkId = useMutation(api.users.createUserbyclerkID);
  
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

  // Reset form when switching modes
  useEffect(() => {
    setFormData({ email: "", phone: "", password: "", code: "" });
    setVerifying(false);
  }, [isSignUp, authMethod]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const showError = (err: any) => {
    const errorMessage = err.errors?.[0]?.message || "Authentication failed";
    Alert.alert("Error", errorMessage);
  };

  const handleAuthSubmit = async () => {
    if (loading) return;
    
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
      console.log('in here');
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
      console.log("result write complete")
      
      if (result?.status === "complete") {
        console.log("result status complete")
        await setSignInActive?.({ session: result.createdSessionId });
        // router.replace("/");
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
      console.log("inside handle verification")
      if (authMethod === "email") {
        const result = await signUp?.attemptEmailAddressVerification({
          code: formData.code,
        });

        console.log('status write complete')
        console.log("result -- >")
        console.log(result)

        if (result?.status === "complete") {
          console.log('status is complete here in verification')
          await createUserbyclerkId({
            userId:result.createdUserId!,
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
            }) as  SignInResource;

          console.log('result frm verification;phone : ');
          console.log(result);

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
            router.replace("/(onboarding)/InfoForm");
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.PitchBlack, '#001a33', Colors.PitchBlack]}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.headerSection}>
            <TouchableOpacity>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.headerSection, styles.headerCenter]}>
            <Text style={styles.headerTitle}>
              {isSignUp ? "Create Account" : "Welcome Back"}
            </Text>
          </View>
          
          <View style={[styles.headerSection, styles.headerRight]}>
            <TouchableOpacity>
              <Ionicons source="user-circle" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <LinearGradient
            colors={['#ffffff08', '#00254d33']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.authCard}
          >
            <View style={styles.authMethodContainer}>
              {["email", "phone"].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.authMethodButton,
                    authMethod === method && styles.activeAuthMethod,
                  ]}
                  onPress={() => setAuthMethod(method as "email" | "phone")}
                >
                  <FontAwesome5
                    name={method === 'email' ? 'envelope' : 'mobile-alt'}
                    size={18}
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

            {verifying ? (
              <>
                <Text style={styles.instructions}>
                  Verification code sent to {'\n'}
                  <Text style={styles.highlightText}>
                    {authMethod === "email" ? formData.email : formData.phone}
                  </Text>
                </Text>
                <View style={styles.codeInputContainer}>
                  <TextInput
                    placeholder="••••••"
                    placeholderTextColor="#ffffff66"
                    value={formData.code}
                    onChangeText={(text) => handleInputChange("code", text)}
                    style={styles.codeInput}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </>
            ) : (
              <>
                {authMethod === "email" && (
                  <View style={styles.inputContainer}>
                    <FontAwesome5 name="envelope" size={16} color="#ffffff66" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Email address"
                      placeholderTextColor="#ffffff66"
                      value={formData.email}
                      onChangeText={(text) => handleInputChange("email", text)}
                      style={styles.inputField}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                )}

                {authMethod === "phone" && (
                  <View style={styles.inputContainer}>
                    <FontAwesome5 name="mobile-alt" size={16} color="#ffffff66" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Phone number"
                      placeholderTextColor="#ffffff66"
                      value={formData.phone}
                      onChangeText={(text) => handleInputChange("phone", text)}
                      style={styles.inputField}
                      keyboardType="phone-pad"
                    />
                  </View>
                )}

                {authMethod === "email" && (
                  <View style={styles.inputContainer}>
                    <FontAwesome5 name="lock" size={16} color="#ffffff66" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor="#ffffff66"
                      value={formData.password}
                      onChangeText={(text) => handleInputChange("password", text)}
                      style={styles.inputField}
                      secureTextEntry
                    />
                  </View>
                )}
              </>
            )}

            <LinearGradient
              colors={[Colors.mainBlue + 'dd', '#00254d']}
              style={[
                styles.authButton,
                (verifying ? isVerifyButtonDisabled : isButtonDisabled) && styles.disabledButton
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity
                onPress={verifying ? handleVerification : handleAuthSubmit}
                disabled={(verifying ? isVerifyButtonDisabled : isButtonDisabled) || loading}
                style={styles.authTouchable}
              >
                <Text style={styles.buttonText}>
                  {verifying ? 'Verify Code' : (isSignUp ? 'Continue' : 'Sign In')}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </LinearGradient>
          </LinearGradient>

          <TouchableOpacity
            style={styles.switchModeContainer}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.secondaryText}>
              {isSignUp ? 'Already have an account? ' : 'Need an account? '}
              <Text style={styles.highlightText}>
                {isSignUp ? 'Sign In' : 'Create Account'}
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 19,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff15',
  },
  headerSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCenter: {
    justifyContent: 'center',
  },
  headerRight: {
    justifyContent: 'flex-end',
  },
  headerTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  authCard: {
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffffff15',
    overflow: 'hidden',
    padding: 20,
  },
  authMethodContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  authMethodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff08',
    gap: 8,
  },
  activeAuthMethod: {
    backgroundColor: '#00254d',
    borderWidth: 1,
    borderColor: Colors.mainBlue + '66',
  },
  authMethodText: {
    color: '#ffffff99',
    fontSize: 14,
    fontWeight: '500',
  },
  activeAuthMethodText: {
    color: Colors.mainBlue,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#ffffff08',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffffff15',
  },
  inputIcon: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#ffffff15',
  },
  inputField: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    color: 'white',
    fontSize: 16,
  },
  codeInputContainer: {
    backgroundColor: '#ffffff08',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffffff15',
    marginBottom: 20,
  },
  codeInput: {
    height: 50,
    paddingHorizontal: 20,
    color: Colors.mainBlue,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  authButton: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.mainBlue + '66',
  },
  authTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  instructions: {
    color: '#ffffff99',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  highlightText: {
    color: Colors.mainBlue,
    fontWeight: '500',
  },
  secondaryText: {
    color: '#ffffff99',
    textAlign: 'center',
    fontSize: 14,
  },
  switchModeContainer: {
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
});

export default login;