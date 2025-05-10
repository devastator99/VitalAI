import { Stack } from "expo-router/stack";

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="Questionnaire" 
        options={{
          headerShown: false,
          animation: "fade",
          gestureEnabled: false,
          gestureDirection: "horizontal",
          headerBackVisible: false,
          headerLeft: () => null
        }}
      />
      <Stack.Screen
        name="waiting" // This will be InfoForm.tsx
        options={{
          headerShown: false,
          animation: "fade",
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
