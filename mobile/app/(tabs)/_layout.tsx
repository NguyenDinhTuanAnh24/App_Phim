import { Tabs } from 'expo-router';
import { Colors } from '@/constants';
import { Feather } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 10,
          borderRadius: 22,
          borderTopWidth: 0.5,
          borderWidth: 0.5,
          borderColor: Colors.glassBorder,
          backgroundColor: Colors.glass,
          height: 66,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: Colors.primaryGradientEnd,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Tìm kiếm',
          tabBarIcon: ({ color, size }) => <Feather name="search" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'Vé của tôi',
          tabBarIcon: ({ color, size }) => <Feather name="credit-card" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color, size }) => <Feather name="user" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
