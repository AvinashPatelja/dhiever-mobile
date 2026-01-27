import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: 'Login' }} />
          <Stack.Screen name="register" options={{ title: 'Register' }} />
          <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
          <Stack.Screen name="device-registration" options={{ title: 'Device Registration' }} />
        </Stack>
        <StatusBar style="auto" />
        <Toast />
      </ThemeProvider>
    </AuthProvider>
  );
}
