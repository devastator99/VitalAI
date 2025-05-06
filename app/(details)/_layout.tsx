import { Stack } from 'expo-router';

export default function DetailsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'containedModal',
        animation: 'slide_from_bottom',
      }}
    />
  );
} 