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
} from "react-native";
import Colors from "~/constants/Colors";
import { api } from "~/convex/_generated/api";

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
        router.replace("/");
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={70}
      style={styles.container}
    >
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>
            {isSignUp ? "Create Account" : "Sign In"}
          </Text>
          <Switch
            value={isSignUp}
            onValueChange={setIsSignUp}
            trackColor={{ false: Colors.primary, true: Colors.primary }}
          />
        </View>

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
              <Text
                style={[
                  styles.authMethodText,
                  authMethod === method && styles.activeAuthMethodText,
                ]}
              >
                {method.charAt(0).toUpperCase() + method.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {verifying ? (
          <>
            <Text style={styles.instructions}>
              Enter verification code sent to{" "}
              {authMethod === "email" ? formData.email : formData.phone}
            </Text>
            <TextInput
              placeholder="6-digit code"
              value={formData.code}
              onChangeText={(text) => handleInputChange("code", text)}
              style={styles.inputField}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity
              style={[
                styles.button, 
                styles.primaryButton,
                isVerifyButtonDisabled && styles.disabledButton
              ]}
              onPress={handleVerification}
              disabled={isVerifyButtonDisabled || loading}
            >
              <Text style={styles.buttonText}>Verify Code</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {authMethod === "email" && (
              <TextInput
                placeholder="Email address"
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
                style={styles.inputField}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}

            {authMethod === "phone" && (
              <TextInput
                placeholder="Phone number"
                value={formData.phone}
                onChangeText={(text) => handleInputChange("phone", text)}
                style={styles.inputField}
                keyboardType="phone-pad"
              />
            )}

            {authMethod === "email" && (
              <TextInput
                placeholder="Password"
                value={formData.password}
                onChangeText={(text) => handleInputChange("password", text)}
                style={styles.inputField}
                secureTextEntry
              />
            )}

            <TouchableOpacity
              style={[
                styles.button, 
                styles.primaryButton,
                isButtonDisabled && styles.disabledButton
              ]}
              onPress={handleAuthSubmit}
              disabled={isButtonDisabled || loading}
            >
              <Text style={styles.buttonText}>
                {isSignUp ? "Continue" : "Sign In"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.switchModeText}
          onPress={() => setVerifying(false)}
        >
          <Text style={styles.secondaryText}>
            {verifying ? "Resend code" : "Switch method"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  switchLabel: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
  },
  authMethodContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  authMethodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  activeAuthMethod: {
    backgroundColor: Colors.primary,
  },
  authMethodText: {
    textAlign: "center",
    color: Colors.brown,
  },
  activeAuthMethodText: {
    color: "#fff",
    fontWeight: "bold",
  },
  inputField: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.green,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  instructions: {
    color: Colors.grey,
    marginBottom: 20,
    textAlign: "center",
  },
  secondaryText: {
    color: Colors.primary,
    textAlign: "center",
    marginTop: 15,
  },
  switchModeText: {
    marginTop: 20,
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