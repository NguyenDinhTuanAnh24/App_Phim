import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/constants';
import { useBookingStore } from '@/stores/bookingStore';

export default function BookingFailedScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const router = useRouter();
  const bookingStore = useBookingStore();

  // Clear booking store khi thanh toán thất bại
  useEffect(() => {
    console.log('[FAILED] Clearing booking store after payment failure');
    bookingStore.clearAll();
  }, []);

  return (
    <ScreenWrapper>
      <ScreenHeader title="Thanh toán thất bại" showBack />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text style={{ color: Colors.text, fontSize: 20, fontWeight: '700' }}>Thanh toán thất bại</Text>
        {code && (
          <Text style={{ color: Colors.textSecondary, marginTop: 8 }}>Mã lỗi: {code}</Text>
        )}
        <Pressable onPress={() => router.replace('/booking/checkout')} style={{ marginTop: 24 }}>
          <Text style={{ color: Colors.primary }}>Thử lại</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/(tabs)')} style={{ marginTop: 12 }}>
          <Text style={{ color: Colors.primary }}>Về trang chủ</Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}
