import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/constants';
import { bookingService } from '@/services/booking.service';
import type { Booking } from '@/constants/types';
import { useQuery } from '@tanstack/react-query';

const tabs = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'UPCOMING', label: 'Sắp xem' },
  { key: 'PAST', label: 'Đã xem' },
  { key: 'CANCELLED', label: 'Đã huỷ' },
];

export default function BookingHistoryScreen() {
  const [active, setActive] = useState('ALL');
  const [selected, setSelected] = useState<Booking | null>(null);

  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => (await bookingService.getUserBookings()).data,
  });

  const list: Booking[] = Array.isArray(bookingsQuery.data?.data) ? bookingsQuery.data.data : [];
  const filtered = useMemo(() => {
    const now = new Date();
    if (active === 'ALL') return list;
    if (active === 'CANCELLED') {
      return list.filter((item: Booking) => item.status === 'CANCELLED' || item.status === 'EXPIRED');
    }
    if (active === 'PAST') {
      return list.filter(
        (item: Booking) => item.status === 'PAID' && new Date(item.showtime?.startTime ?? '') <= now
      );
    }
    return list.filter((item: Booking) => item.status === 'PAID' && new Date(item.showtime?.startTime ?? '') > now);
  }, [active, list]);

  return (
    <ScreenWrapper>
      <ScreenHeader title="Lịch sử đặt vé" subtitle="Thông tin vé đã đặt" showBack />
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActive(tab.key)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 16,
                backgroundColor: active === tab.key ? 'rgba(176,0,32,0.35)' : Colors.glass,
                marginRight: 8,
                borderWidth: 0.5,
                borderColor: active === tab.key ? Colors.primaryGradientEnd : Colors.glassBorder,
              }}
            >
              <Text style={{ color: Colors.text }}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>
        {bookingsQuery.isLoading ? (
          <Text style={{ color: Colors.textSecondary }}>Đang tải...</Text>
        ) : bookingsQuery.isError ? (
          <Text style={{ color: Colors.textSecondary }}>Không thể tải lịch sử vé</Text>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setSelected(item)}
                style={{ backgroundColor: Colors.glass, padding: 14, borderRadius: 16, marginBottom: 12, borderWidth: 0.5, borderColor: Colors.glassBorder }}
              >
                <Text style={{ color: Colors.text, fontWeight: '700' }}>
                  {item.showtime?.movie?.title ?? 'Vé của bạn'}
                </Text>
                <Text style={{ color: Colors.textSecondary, marginTop: 4 }}>{item.status}</Text>
              </Pressable>
            )}
            ListEmptyComponent={<Text style={{ color: Colors.textSecondary }}>Không có dữ liệu</Text>}
          />
        )}
      </View>
      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
          {selected && (
            <View style={{ backgroundColor: Colors.glass, padding: 16, borderRadius: 20, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
              <QRCode value={selected.qrCode || selected.id} size={220} />
            </View>
          )}
          <LinearGradient colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]} style={{ borderRadius: 12, marginTop: 24 }}>
            <Pressable onPress={() => setSelected(null)} style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Đóng</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
