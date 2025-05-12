import { useFonts } from "expo-font";
import {
  router,
  Slot,
  SplashScreen,
  useRouter,
  useSegments,
  usePathname,
} from "expo-router";
import { Stack } from "expo-router/stack";
import React, { useEffect, useState, useRef } from "react";
import {
  ClerkLoaded,
  ClerkProvider,
  useAuth,
  useUser,
} from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Platform, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { tokenCache } from "~/cache";
import Constants from "expo-constants";
import { ChatProvider } from "~/utils/ChatContext";
import { api } from "~/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  Theme,
  ThemeProvider,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from '@rn-primitives/portal';
import { setBackgroundColorAsync } from "expo-system-ui";
import { useAppStore } from "~/store";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

const publishableKey =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing Clerk Publishable Key");
}

const convex = new ConvexReactClient(
  Constants.expoConfig?.extra?.EXPO_PUBLIC_CONVEX_URL!
);

SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  // 2. Font loading
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // 3. Auth and routing hooks
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const segments = useSegments();
  const router = useRouter();

  const {userId, setUserId, isAdmin, setIsAdmin, isApproved, setIsApproved, detailsFilled, setDetailsFilled, setUser} = useAppStore();

  const userIdInitialized = useRef(false);

  // 5. User status queries
  const safeUserId = userId || undefined;
  
  // Fetch complete user data from backend
  const userData = useQuery(api.users.getCurrentUser);
  
  // Fallback query if getCurrentUser returns null
  const userByIdData = useQuery(
    api.users.getuserbyId,
    safeUserId ? { userId: safeUserId } : "skip"
  );
  
  const checkAdminResult = useQuery(api.users.isAdmin, {
    userId: safeUserId ? safeUserId : "skip",
  });
  const userStatusResult = useQuery(api.users.getStatus, {
    userId: safeUserId ? safeUserId : "skip",
  });
  const infoSubmitted = useQuery(api.users.infoStatus, {
    userId: safeUserId ? safeUserId : "skip",
  }); 

  // 7. Handle font errors
  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  // 8. Splash screen management
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // 9. User ID initialization
  useEffect(() => {
    if (user?.id && !userIdInitialized.current) {
      setUserId(user.id);
      userIdInitialized.current = true;
    }
  }, [user]);
  
  // Set user data in store when available
  useEffect(() => {
    // If we have user data from getCurrentUser, use that
    if (userData) {
      console.log("Setting user from getCurrentUser");
      setUser(userData);
    } 
    // Otherwise, if we have user data from getuserbyId, use that as fallback
    else if (!userData && userByIdData) {
      console.log("Setting user from userByIdData");
      setUser(userByIdData);
    }
  }, [userData, userByIdData, setUser]);

  // 10. User status updates - fixed for type safety
  useEffect(() => {
    if (!authLoaded || !isSignedIn || !userId) return;

    if (checkAdminResult !== undefined && checkAdminResult !== null) {
      setIsAdmin(checkAdminResult);
    }

    if (userStatusResult !== undefined && userStatusResult !== null) {
      setIsApproved(userStatusResult);
    }

    if (infoSubmitted !== undefined) {
      setDetailsFilled(infoSubmitted);
    }
  }, [
    authLoaded,
    isSignedIn,
    userId,
    checkAdminResult,
    userStatusResult,
    infoSubmitted,
  ]);

  // this solves the issue of the background color being white in keyboardavoidingview
  setBackgroundColorAsync("black");

  useEffect(() => {
    if (!authLoaded || isAdmin === undefined || isApproved === undefined)
      return;

    console.log("Current path:", pathname);

    if (isSignedIn) {
      if (isAdmin) {
        // Allow access to admin routes and roleselect
        const isAdminRoute =
          pathname?.startsWith("/(admin)") || pathname === "/roleselect";
        if (!isAdminRoute) {
          console.log("Redirecting admin to roleselect");
          router.replace("/roleselect");
        }
      } else {
        console.log("infoSubmitted-->");
        console.log(infoSubmitted);
        if (!infoSubmitted && pathname !== "/(onboarding)/Questionnaire") {
          router.replace("/(onboarding)/Questionnaire");
        } else {
          // Handle regular user routing
          const targetRoute = isApproved
            ? "/(auth)/(drawer)/(ai-chat)/new"
            : "/(onboarding)/waiting";

          if (pathname !== targetRoute) {
            console.log("Redirecting user to:", targetRoute);
            router.replace(targetRoute);
          }
        }
      }
    } else {
      // Handle unauthorized access
      if (pathname !== "/" && pathname !== "/login") {
        console.log("Redirecting unauthorized user to root");
        router.replace("/");
      }
    }
  }, [authLoaded, isSignedIn, isAdmin, isApproved, userId]);

  // 13. Loading state
  if (!fontsLoaded || !authLoaded) {
    return <Slot />;
  }

  // 14. Screen configurations
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="login"
        options={{
          presentation: "modal",
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="roleselect"
        options={{
          headerShown: false,
          presentation: "transparentModal",
          animation: "fade",
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      <Stack.Screen name="(details)" options={{ headerShown: false }} />
    </Stack>
  );
};

const RootLayoutNav = () => {
  const hasMounted = React.useRef(false);
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  const useIsomorphicLayoutEffect =
    Platform.OS === "web" && typeof window === "undefined"
      ? React.useEffect
      : React.useLayoutEffect;

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === "web") {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add("bg-background");
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
            <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
            <ChatProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <InitialLayout />
                <PortalHost />
              </GestureHandlerRootView>
            </ChatProvider>
          </ThemeProvider>
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
};

export default RootLayoutNav;
