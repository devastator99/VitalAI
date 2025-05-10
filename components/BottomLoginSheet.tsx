import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Link, router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Button,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GoogleOneTap, useSignIn } from "@clerk/clerk-react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useOAuth } from "@clerk/clerk-expo";
import { useAuthRequest } from "expo-auth-session";
import { useWarmUpBrowser } from "~/utils/useWarmUpBrowser";
import * as Linking from "expo-linking";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { useLocalSearchParams } from "expo-router";

const BottomLoginSheet = () => {
  WebBrowser.maybeCompleteAuthSession();
  const { signIn } = useSignIn();
  useWarmUpBrowser();
  const { signUp: signUpParam } = useLocalSearchParams();

  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   clientId: '599657657682-dk6q7juah7efs1bpl1hiccgde251lfip.apps.googleusercontent.com',
  //   redirectUri: 'https://auth.expo.dev/nsaquib221122/CurA_base',
  // });

  // useEffect(() => {
  //   if (response?.type === 'success') {
  //     const { authentication } = response;
  //     console.log('Google Token:', authentication?.accessToken);
  //     Alert.alert('Login Success', `Access Token: ${authentication?.accessToken}`);
  //   }
  // }, [response]);

  // const { startSSOFlow } = useSSO();

  // const handlePress = React.useCallback(async () => {
  //   try {
  //     const { createdSessionId, setActive, signIn, signUp } =
  //       // await startSSOFlow({
  //       //   strategy: "oauth_google",
  //       //   redirectUrl: Linking.createURL("/dashboard", { scheme: "myapp" }),
  //       // });
  //     if (createdSessionId) {
  //       setActive!({ session: createdSessionId });
  //     } else {
  //       Alert.alert('yo man this is rigged');
  //     }
  //   } catch (err) {
  //     console.error("SSO error", err);
  //   }
  // }, []);

  const { bottom } = useSafeAreaInsets();

  const handleSignUp = () => {
    router.push("/login?signUp=true");
  };

  return (
    <View style={[styles.container, { paddingBottom: bottom }]}>
      <TouchableOpacity style={[styles.btn, styles.btnLight]}>
        <Ionicons name="logo-apple" size={14} style={styles.btnIcon} />
        <Text style={styles.btnLightText}>Continue with Apple</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {}}
        style={[styles.btn, styles.btnDark]}
      >
        <Ionicons
          name="logo-google"
          size={16}
          style={styles.btnIcon}
          color={"#fff"}
        />
        <Text style={styles.btnDarkText}>Continue with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.btnDark]}
        onPress={() => router.push("/login?signUp=true")}
      >
        <Ionicons
          name="mail"
          size={20}
          style={styles.btnIcon}
          color={"#fff"}
        />
        <Text style={styles.btnDarkText}>Sign up with email</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.btnOutline]}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.btnDarkText}>Log in</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#000",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 26,
    gap: 14,
  },
  btnLight: {
    backgroundColor: "#fff",
  },
  btnLightText: {
    color: "#000",
    fontSize: 20,
  },
  btnDark: {
    backgroundColor: "rgba(255, 234, 215 ,0.5)",
  },
  btnDarkText: {
    color: "#fff",
    fontSize: 20,
  },
  btnOutline: {
    borderWidth: 3,
    borderColor: "rgba(255, 204, 215 ,0.5)",
  },
  btnIcon: {
    paddingRight: 6,
  },
  btn: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 204, 255 ,0.5)",
  },
});
export default BottomLoginSheet;
