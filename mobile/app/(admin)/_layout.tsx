import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { Colors } from '@/constants';

export default function AdminLayout() {
  const insets = useSafeAreaInsets();

  return (
    <AdminGuard>
      <Tabs
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          tabBarStyle: {
            backgroundColor: 'rgba(12,12,12,0.96)',
            borderTopColor: 'rgba(255,255,255,0.12)',
            height: 68 + insets.bottom,
            paddingBottom: insets.bottom + 6,
            paddingTop: 10,
            borderTopWidth: 0.5,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
          },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Tổng quan',
            tabBarIcon: ({ color, size }) => <Ionicons name="grid" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: 'Đặt vé',
            tabBarIcon: ({ color, size }) => <Ionicons name="ticket" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="movies"
          options={{
            title: 'Phim',
            tabBarIcon: ({ color, size }) => <Ionicons name="film" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="users"
          options={{
            title: 'Người dùng',
            tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
          }}
        />
      </Tabs>
    </AdminGuard>
  );
}
