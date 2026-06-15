import { Stack } from 'expo-router';
import '../../global.css'; 

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="study" />
      <Stack.Screen name="create-card" options={{ presentation: 'modal' }} />
      <Stack.Screen name="create-book" options={{ presentation: 'modal' }} />
    </Stack>
  );
}