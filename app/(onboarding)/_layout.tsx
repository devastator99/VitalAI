import { Stack } from "expo-router/stack";

export default function OnboardingLayout() {
  return (
    <Stack>
      {/* <Stack.Screen
        name="InfoForm" // This will be InfoForm.tsx
        options={{
          headerShown: false,
          animation: "fade",
          gestureEnabled: false,
        }}
      /> */}
      <Stack.Screen
        name="Questionnaire" // New screen for the questionnaire
        options={{
          headerShown: false,
          animation: "fade",
          gestureEnabled: false,
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
