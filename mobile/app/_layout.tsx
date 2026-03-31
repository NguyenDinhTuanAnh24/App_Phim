import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { configureGoogleSignIn } from '@/config/google-signin';
import { queryClient } from '@/config/query-client';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants';
import { userService } from '@/services/user.service';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const setTokens = useAuthStore((state) => state.setTokens);
  const updateUser = useAuthStore((state) => state.updateUser);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  useEffect(() => {
    const loadTokens = async () => {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (accessToken && refreshToken) {
        await setTokens(accessToken, refreshToken);
      }
      setIsReady(true);
    };
    loadTokens();
  }, [setTokens]);

  useEffect(() => {
    if (!isReady || !isAuthenticated || user) return;
    const loadProfile = async () => {
      try {
        setIsProfileLoading(true);
        const response = await userService.getProfile();
        const profile = response.data?.data ?? response.data;
        if (profile) {
          updateUser(profile);
        }
      } catch {
        // fallback to stored user if API fails
      } finally {
        setIsProfileLoading(false);
      }
    };
    loadProfile();
  }, [isReady, isAuthenticated, updateUser, user]);

  useEffect(() => {
    if (!isReady || isProfileLoading) return;

    if (isAuthenticated && !user) {
      return;
    }

    const inAuth = segments[0] === '(auth)';
    const inAdmin = segments[0] === '(admin)' || segments[0] === 'admin';

    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/login');
      return;
    }

    if (isAuthenticated && user?.role === 'ADMIN' && !inAdmin) {
      router.replace('/(admin)/dashboard');
      return;
    }

    if (isAuthenticated && user?.role !== 'ADMIN' && inAdmin) {
      router.replace('/(tabs)');
      return;
    }

    if (isAuthenticated && inAuth) {
      router.replace(user?.role === 'ADMIN' ? '/(admin)/dashboard' : '/(tabs)');
    }
  }, [isReady, isProfileLoading, isAuthenticated, router, segments, user?.role]);

  useEffect(() => {
    const handleUrl = (url: string) => {
      console.log('[DEEP LINK] Received URL:', url);
      const parsed = Linking.parse(url);
      console.log('[DEEP LINK] Parsed:', JSON.stringify(parsed));
      
      // Handle payment success - support both formats
      // Format 1: movieticket://booking/success/BOOKING_ID
      // Format 2: movieticket://payment/success?bookingId=BOOKING_ID
      if (parsed.path?.includes('success')) {
        // Try to extract booking ID from path first (format 1)
        const pathParts = parsed.path.split('/');
        const bookingIdFromPath = pathParts[pathParts.length - 1];
        
        // Or from query params (format 2)
        const bookingIdFromQuery = parsed.queryParams?.bookingId as string | undefined;
        
        const bookingId = bookingIdFromPath || bookingIdFromQuery;
        
        if (bookingId && bookingId !== 'success') {
          console.log('[DEEP LINK] Navigate to success with bookingId:', bookingId);
          router.replace(`/booking/success/${bookingId}`);
        }
      }
      
      // Handle payment failed - support both formats
      // Format 1: movieticket://booking/failed?code=XX
      // Format 2: movieticket://payment/failed?code=XX
      if (parsed.path?.includes('failed')) {
        const code = parsed.queryParams?.code as string | undefined;
        const reason = parsed.queryParams?.reason as string | undefined;
        const bookingId = parsed.queryParams?.bookingId as string | undefined;
        
        console.log('[DEEP LINK] Navigate to failed with code:', code);
        
        let failedUrl = '/booking/failed';
        const params = new URLSearchParams();
        if (code) params.append('code', code);
        if (reason) params.append('reason', reason);
        if (bookingId) params.append('bookingId', bookingId);
        
        if (params.toString()) {
          failedUrl += `?${params.toString()}`;
        }
        
        router.replace(failedUrl);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('[DEEP LINK] Initial URL:', url);
        handleUrl(url);
      }
    });

    const subscription = Linking.addEventListener('url', (event) => {
      console.log('[DEEP LINK] Event URL:', event.url);
      handleUrl(event.url);
    });
    
    return () => subscription.remove();
  }, [router]);

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      animation: 'fade' as const,
      contentStyle: { backgroundColor: Colors.background },
    }),
    []
  );

  if (!isReady || isProfileLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LinearGradient
          colors={[Colors.background, '#0F0A0B']}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color={Colors.primary} />
        </LinearGradient>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" backgroundColor={Colors.background} />
          <Stack screenOptions={screenOptions}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(admin)" />
            <Stack.Screen name="admin/booking-detail/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="admin/movie-form" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="admin/showtime-form" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="admin/user-detail/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="admin/support-reply/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="movie/[id]" />
            <Stack.Screen name="showtime/[id]" />
            <Stack.Screen name="cinema/[id]" />
            <Stack.Screen name="booking/seats/[showtimeId]" />
            <Stack.Screen name="booking/food" />
            <Stack.Screen name="booking/checkout" />
            <Stack.Screen name="booking/success/[id]" />
            <Stack.Screen name="booking/failed" />
            <Stack.Screen name="profile/edit" />
            <Stack.Screen name="profile/change-password" />
            <Stack.Screen name="profile/loyalty-history" />
            <Stack.Screen name="profile/booking-history" />
            <Stack.Screen name="profile/promotions" />
            <Stack.Screen name="profile/support" />
            <Stack.Screen name="profile/redeem-points" />
            <Stack.Screen name="profile/terms" />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
