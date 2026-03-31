import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { adminService } from '@/services/admin.service';
import { Colors } from '@/constants';
import { formatCurrency } from '@/constants/format';
import { formatDate } from '@/constants/date';

export default function AdminBookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isUpdating, setIsUpdating] = useState(false);

  const bookingQuery = useQuery({
    queryKey: ['admin', 'booking-detail', id],
    queryFn: async () => (await adminService.getBookingDetail(id as string)).data,
  });

  const booking = bookingQuery.data?.data ?? bookingQuery.data;

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => adminService.updateBookingStatus(id as string, status),
    onSuccess: () => bookingQuery.refetch(),
    onSettled: () => setIsUpdating(false),
  });

  const confirmUpdate = (status: string, message: string) => {
    Alert.alert('Xác nhận', message, [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đồng ý',
        onPress: () => {
          setIsUpdating(true);
          updateStatusMutation.mutate(status);
        },
      },
    ]);
  };

  return (
    <ScreenWrapper variant="admin">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <ScreenHeader title="Chi tiết đơn" showBack variant="admin" />
        <View style={{ padding: 16 }}>
          {bookingQuery.isLoading ? (
            <Text style={{ color: Colors.admin.textSecondary }}>Đang tải...</Text>
          ) : bookingQuery.isError || !booking ? (
            <Pressable onPress={() => bookingQuery.refetch()}>
              <Text style={{ color: Colors.admin.primary }}>Không thể tải. Thử lại</Text>
            </Pressable>
          ) : (
            <>
              <Text style={{ color: Colors.admin.text, fontSize: 20, fontWeight: '700' }}>Chi tiết đơn</Text>
              <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>
                {booking.showtime?.movie?.title ?? 'Đặt vé'}
              </Text>

              <View style={{ marginTop: 16, backgroundColor: Colors.admin.surface, padding: 12, borderRadius: 16, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
                <Text style={{ color: Colors.admin.text }}>👤 {booking.user?.name ?? 'Người dùng'}</Text>
                <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>{booking.user?.email}</Text>
                <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>{booking.user?.phone}</Text>
              </View>

              <View style={{ marginTop: 16, backgroundColor: Colors.admin.surface, padding: 12, borderRadius: 16, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
                <Text style={{ color: Colors.admin.text }}>Suất chiếu</Text>
                <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>
                  {formatDate(booking.showtime?.startTime ?? booking.showtime?.start_time)}
                </Text>
                <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>
                  Rạp: {booking.showtime?.room?.cinema?.name ?? '---'}
                </Text>
              </View>

              <View style={{ marginTop: 16, backgroundColor: Colors.admin.surface, padding: 12, borderRadius: 16, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
                <Text style={{ color: Colors.admin.text }}>Thanh toán</Text>
                <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>
                  Tổng tiền: {formatCurrency(Number(booking.totalAmount ?? booking.total_amount ?? 0))}
                </Text>
                <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>
                  Trạng thái: {booking.status}
                </Text>
              </View>

              <View style={{ marginTop: 16, alignItems: 'center' }}>
                <QRCode value={booking.qrCode || booking.id} size={180} />
              </View>

              {booking.status === 'PAID' && (
                <Pressable
                  disabled={isUpdating}
                  onPress={() => confirmUpdate('CANCELLED', 'Huỷ đơn đặt vé này?')}
                  style={{
                    marginTop: 16,
                    backgroundColor: '#EF4444',
                    padding: 12,
                    borderRadius: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: Colors.admin.text, fontWeight: '700' }}>Huỷ đơn</Text>
                </Pressable>
              )}

              {booking.status === 'PENDING' && (
                <Pressable
                  disabled={isUpdating}
                  onPress={() => confirmUpdate('PAID', 'Xác nhận thủ công đơn này?')}
                  style={{
                    marginTop: 16,
                    backgroundColor: Colors.admin.primary,
                    padding: 12,
                    borderRadius: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: Colors.admin.text, fontWeight: '700' }}>Xác nhận thủ công</Text>
                </Pressable>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
