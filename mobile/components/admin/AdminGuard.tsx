import { ReactNode, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants';

export const AdminGuard = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && user?.role !== 'ADMIN') {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router, user?.role]);

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (user?.role !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
};
