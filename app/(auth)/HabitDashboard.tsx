import React, { useState, useRef, useEffect } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Button,
  TextInput,
  FlatList,
  ActivityIndicator,
  PanResponder,
  ListRenderItemInfo,
  Alert,
  Animated,
} from "react-native";
import {
  ProgressBar,
  Icon,
  Modal,
  Surface,
  Chip,
  Text,
  Card,
  RadioButton,
  Portal,
  Provider,
} from "react-native-paper";
// import { Card, Text, Input, RadioGroup, Button, XStack, Label} from 'react-native-reusables';
import { BlurView } from "expo-blur";
import {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSharedValue } from "react-native-reanimated";
import ReanimatedView from "react-native-reanimated"; // Rename to avoid conflict
import { StatusBar } from "expo-status-bar";
import { HabitCreationScreen } from "~/components/HabitCreationScreen";
import IconCircle from "~/components/IconCircle";
import HeaderWithButtons from "~/components/HabitHeaderWbuttons";
import { LinearGradient } from "expo-linear-gradient";
import ContributionGrid from "~/components/ContributionGrid";
import type { Habit } from "~/utils/Interfaces";
import type { Entry } from "~/utils/Interfaces";
import type { HabitType } from "~/utils/Interfaces";
import HabitDetail from "~/components/HabitDetail";
import { SliderSelector } from "../../components/SliderSelector";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "~/utils/Colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SwipeListView } from "react-native-swipe-list-view";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DAYS, COLOR_PALETTE, ICONS } from "~/utils/habitData";
import { useQuery } from "convex/react";
import { getHabits } from "~/convex/habits";
import { Id } from "~/convex/_generated/dataModel";
import { api } from "~/convex/_generated/api";
import HabitCard from "../../components/HabitCard";
import { useMutation } from "convex/react";
import { EmptyHabitState } from "~/components/EmptyHabitState";
// TO ADD: // Precompute lightened colors in habit creation
//habit name and frequency in header in weekdays with right icons for edit delete and share
//display  total , score percent ,in a card
//display description in a card ,
//display linechart of progress  aand a notes section with add note button

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth;

// Hidden Item Component with Buttons
const HiddenItem = ({ 
  onComplete, 
  onDelete 
}: { 
  onComplete: () => void, 
  onDelete: () => void 
}) => (
  <View style={styles.hiddenContainer}>
    <TouchableOpacity 
      style={[styles.hiddenButton, styles.deleteButton]} 
      onPress={onDelete}
    >
      <View style={styles.buttonContent}>
        <MaterialCommunityIcons name="trash-can-outline" size={32} color="#fff" />
      </View>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={[styles.hiddenButton, styles.completeButton]} 
      onPress={onComplete}
    >
      <View style={styles.buttonContent}>
        <MaterialCommunityIcons name="check-circle-outline" size={32} color="#fff" />
      </View>
    </TouchableOpacity>
  </View>
);

const HabitDashboard = () => {
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);
  const habits = useQuery(
    api.habits.getHabits,
    currentUser ? { userId: currentUser?._id } : "skip"
  );
  const [selectedView, setSelectedView] = useState<"Daily" | "Weekly" | "Overall">("Daily");
  const [isLoadingView, setIsLoadingView] = useState<"Daily" | "Weekly" | "Overall" | null>(null);
  const logEntry = useMutation(api.habits.logEntry);
  const deleteHabit = useMutation(api.habits.deleteHabit);

  // Define row animation refs for handling animations
  const rowTranslateAnimatedValues = useRef<{[key: string]: Animated.Value}>({}).current;
  const rowScaleAnimatedValues = useRef<{[key: string]: Animated.Value}>({}).current;

  // Initialize animation values for new habits
  useEffect(() => {
    if (habits) {
      habits.forEach(habit => {
        if (!rowTranslateAnimatedValues[habit._id]) {
          rowTranslateAnimatedValues[habit._id] = new Animated.Value(1);
        }
        if (!rowScaleAnimatedValues[habit._id]) {
          rowScaleAnimatedValues[habit._id] = new Animated.Value(1);
        }
      });
    }
  }, [habits]);

  // Animation for completing a habit
  const onCompleteAnimation = (rowKey: string) => {
    Animated.timing(rowScaleAnimatedValues[rowKey], {
      toValue: 1.1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(rowScaleAnimatedValues[rowKey], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  // Animation for deleting a habit
  const onDeleteAnimation = (rowKey: string) => {
    Animated.timing(rowTranslateAnimatedValues[rowKey], {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Handler for row swipe complete
  const onSwipeValueChange = (swipeData: {key: string, value: number}) => {
    const { key, value } = swipeData;
    
    // Animate when swiped far enough
    if (value < -100) {
      // Right swipe (delete)
      Animated.timing(rowScaleAnimatedValues[key], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }).start();
    } else if (value > 100) {
      // Left swipe (complete)
      Animated.timing(rowScaleAnimatedValues[key], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }).start();
    } else {
      // Reset
      Animated.timing(rowScaleAnimatedValues[key], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleLogEntry = async (
    habitId: string,
    value: number | boolean | string,
    notes: string
  ) => {
    await logEntry({
      habitId: habitId as Id<"habits">,
      value,
      notes,
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleMarkComplete = async (habit: Habit) => {
    await logEntry({
      habitId: habit._id as Id<"habits">,
      value: true,
      notes: "Completed via swipe",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleDeleteHabit = (habit: Habit) => {
    // Alert.alert(
    //   "Delete Habit",
    //   `Are you sure you want to delete "${habit.name}"? This action cannot be undone.`,
    //   [
    //     {
    //       text: "Cancel",
    //       style: "cancel"
    //     },
    //     { 
    //       text: "Delete", 
    //       onPress: async () => {
    //         await deleteHabit({ id: habit._id as Id<"habits"> });
    //       },
    //       style: "destructive"
    //     }
    //   ]
    // );
     deleteHabit({ id: habit._id as Id<"habits"> });
  };

  if (!habits) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!habits || habits.length === 0) {
    return <EmptyHabitState />;
  }

  return (
    <Provider>
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: () => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: Colors.white, fontSize: 20, fontWeight: "600" }}>
                  Your{" "}
                </Text>
                <Text style={{ color: Colors.mainBlue, fontSize: 20, fontWeight: "600" }}>
                  Habits
                </Text>
              </View>
            ),
            headerStyle: {
              backgroundColor: Colors.PitchBlack,
            },
            headerShadowVisible: false,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ marginLeft: 16, paddingEnd: 10 }}
              >
                <IconCircle name="chevron-back-sharp" size={17} />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <View style={{ flexDirection: "row", gap: 15, marginRight: 16 }}>
                <TouchableOpacity onPress={() => router.push("/(details)/createHabit")}>
                  <IconCircle name="add" size={17} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/(details)/habsettings")}>
                  <IconCircle name="settings" size={17} />
                </TouchableOpacity>
              </View>
            ),
            headerTintColor: Colors.white,
          }}
        />

        <View style={{ marginTop: 15 }}>
          <SliderSelector
            buttons={[
              {
                icon: (props) => (
                  <MaterialCommunityIcons name="calendar-today" size={props.size} color={props.color} />
                ),
                color: Colors.white,
                label: "Daily",
              },
              {
                icon: (props) => (
                  <MaterialCommunityIcons name="calendar-week" size={props.size} color={props.color} />
                ),
                color: Colors.white,
                label: "Weekly",
              },
              {
                icon: (props) => (
                  <MaterialCommunityIcons name="chart-arc" size={props.size} color={props.color} />
                ),
                color: Colors.white,
                label: "Overall",
              },
            ]}
            selectedIndex={["Daily", "Weekly", "Overall"].indexOf(selectedView)}
            onSelect={(index) => {
              const views = ["Daily", "Weekly", "Overall"] as const;
              const newView = views[index];
              setIsLoadingView(newView);
              setTimeout(() => {
                setSelectedView(newView);
                setIsLoadingView(null);
              }, 1000);
            }}
          />
        </View>

        {isLoadingView ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SwipeListView<Habit>
              data={habits}
              keyExtractor={(item) => item._id.toString()}
              renderItem={({ item: habit }) =>
                selectedView === "Overall" ? (
                  <ContributionGrid habit={habit} />
                ) : (
                  <Animated.View
                    style={[
                      {
                        transform: [
                          { scale: rowScaleAnimatedValues[habit._id.toString()] || 1 }
                        ],
                        opacity: rowTranslateAnimatedValues[habit._id.toString()] || 1
                      }
                    ]}
                  >
                    <HabitCard
                      habit={habit}
                      onPress={() => router.push({
                        pathname: "/(details)/detailsHabit",
                        params: { id: habit._id }
                      })}
                      selectedView={selectedView}
                      handleLogEntry={handleLogEntry}
                    />
                  </Animated.View>
                )
              }
              renderHiddenItem={({ item }) => (
                <HiddenItem
                  onComplete={() => {
                    onCompleteAnimation(item._id.toString());
                    handleMarkComplete(item);
                  }}
                  onDelete={() => {
                    onDeleteAnimation(item._id.toString());
                    handleDeleteHabit(item);
                  }}
                />
              )}
              useNativeDriver={true}
              leftOpenValue={75}
              rightOpenValue={-75}
              disableLeftSwipe={selectedView === "Overall"}
              disableRightSwipe={selectedView === "Overall"}
              stopLeftSwipe={120}
              stopRightSwipe={-120}
              previewRowKey={habits[0]?._id?.toString()}
              previewOpenValue={-40}
              previewOpenDelay={2000}
              onSwipeValueChange={onSwipeValueChange}
              contentContainerStyle={{ paddingVertical: 10 }}
              style={{ marginTop: 10 }}
              removeClippedSubviews={false}
              closeOnRowOpen={false}
              swipeToOpenPercent={15}
              swipeToClosePercent={15}
            />
          </GestureHandlerRootView>
        )}
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "black",
    alignItems: "center",
    marginBottom: 120,
  },
  hiddenContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 20,
  },
  hiddenButton: {
    width: 60,
    height: '82%',
    marginBottom: 2,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  completeButton: {
    backgroundColor: '#27AE60', // green
  },
  deleteButton: {
    backgroundColor: '#E74C3C', // red
  },
  buttonContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  rowBack: {
    alignItems: "center",
    backgroundColor: "black",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 15,
    width: CARD_WIDTH - 40,
    alignSelf: "center",
  },
  backTextWhite: {
    color: "#FFF",
  },
});

export default HabitDashboard;
