import Colors from "~/utils/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Stack, Tabs, useRouter } from "expo-router";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Authenticated, useQuery } from "convex/react";
// import { useConvexUser } from "~/utils/UserContext";
import { Drawer } from "react-native-drawer-layout";
import { useEffect } from "react";
import { api } from "~/convex/_generated/api";
import { useChat } from "~/utils/ChatContext";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useClerk } from "@clerk/clerk-expo";
import { useSharedValue } from "react-native-reanimated";
import {
  Canvas,
  Fill,
  Image,
  BackdropBlur,
  useImage,
  Blur,
} from "@shopify/react-native-skia";
import {
  useAnimatedProps,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import Animated from "react-native-reanimated";
import AnimatedButton from "~/components/AnimatedButton";

export const Filter = () => {
  const image = useImage(require("../../assets/images/purple.jpeg"));
  if (!image) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }}>
      <Image x={0} y={0} width={400} height={256} image={image} fit="cover">
        <Blur blur={4} />
      </Image>
    </Canvas>
  );
};

const Layout = () => {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  console.log("inside layoutv2");
  const staticBlurViewProps = {
    intensity: 40, // Set the desired static intensity
  };
  const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

  const scrollY = useSharedValue(0);

  // const animatedProps = useAnimatedProps(() => {
  //   const intensity = interpolate(
  //     scrollY.value,
  //     [0, 150, 172],
  //     [0, 0, 50],
  //     Extrapolation.CLAMP
  //   );

  //   return {
  //     intensity,
  //   };
  // });
  // <AnimatedBlurView
  //             {...staticBlurViewProps}
  //             style={{ flex: 1 }}
  //           />

  const tabs = [
    {
      name: "(drawer)",
      label: "AI Chat",
      icon: {
        active: "chatbubble",
        inactive: "chatbubble-outline",
      },
    },
    {
      name: "contacts",
      label: "Contacts",
      icon: {
        active: "people",
        inactive: "people-outline",
      },
    },
    {
      name: "Profile",
      label: "Profile",
      icon: {
        active: "person",
        inactive: "person-outline",
      },
    },
    {
      name: "HabitDashboard",
      label: "Habits",
      icon: {
        active: "stats-chart",
        inactive: "stats-chart-outline",
      },
    },
    {
      name: "diet",
      label: "Plans",
      icon: {
        active: "settings",
        inactive: "settings-outline",
      },
    },
    {
      name: "settings",
      label: "Settings",
      icon: {
        active: "settings",
        inactive: "settings-outline",
      },
    }
  ];

  return (
    <Authenticated>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "rgba(19, 22, 28,0.4)",
            borderTopWidth: 0,
            elevation: 0,
            height: 70,
            position: "relative",
          },
          // tabBarBackground: () => (
          //   // <BlurView
          //   //   intensity={70}
          //   //   tint="dark"
          //   //   experimentalBlurMethod={"dimezisBlurView"}
          //   //   style={{
          //   //     position: "absolute",
          //   //     top: 0,
          //   //     right: 0,
          //   //     bottom: 0,
          //   //     left: 0,
          //   //   }}
          //   // />
          // ),
        }}
      >
        {tabs.map(({ name, label, icon }) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              headerShown: false,
              tabBarButton: (props: any) => (
                <AnimatedButton {...props} style={styles.tabButton} liquidColor={"red"}>
                  <View
                    style={[
                      styles.tabContent,
                      props.accessibilityState?.selected && styles.activeTab,
                    ]}
                  >
                    <Ionicons
                      name={
                        props.accessibilityState?.selected
                          ? (icon.active as keyof typeof Ionicons.glyphMap)
                          : (icon.inactive as keyof typeof Ionicons.glyphMap)
                      }
                      size={20}
                      color={
                        props.accessibilityState?.selected
                          ? "#539DF3"
                          : "#676D75"
                      }
                    />

                    {props.accessibilityState?.selected ? (
                      <Text style={styles.activeLabel}>{label}</Text>
                    ) : null}
                  </View>
                </AnimatedButton>
              ),
            }}
          />
        ))}
      </Tabs>
    </Authenticated>
  );
};

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    elevation:1
  },
  tabContent: {
    alignItems: "center",
    paddingVertical: 8,
  },
  activeTab: {
    flexDirection: "row",
    backgroundColor: "rgba(83, 157, 243, 0.37)",
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 3,
    borderWidth:0.2,
    borderColor:"#539DF3"
  },
  activeLabel: {
    color: "#539DF3",
    fontSize: 12,
    fontFamily: "Poppins",
    fontWeight: "500",
    marginLeft: 4,
  },
  inactiveLabel: {
    color: "#676D75",
    fontSize: 12,
    fontFamily: "Poppins",
    fontWeight: "500",
    marginTop: 2,
  },
});

export default Layout;
