import Toast from 'react-native-toast-message';
import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import '../../global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
        <Stack.Screen name="book/[id]" />
      </Stack>
      <Toast />
    </GestureHandlerRootView>
  );
}