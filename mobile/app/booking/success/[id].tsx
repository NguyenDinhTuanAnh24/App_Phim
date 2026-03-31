import { useEffect } from 'react';
import { BackHandler, Pressable, Text, View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/constants';
import { bookingService } from '@/services/booking.service';
import { useQuery } from '@tanstack/react-query';
import { QRTicket } from '@/components/booking/QRTicket';
import { Booking } from '@/constants/types';
import { useBookingStore } from '@/stores/bookingStore';

export default function BookingSuccessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const bookingStore = useBookingStore();

  const { data: bookingResponse, isLoading } = useQuery({
    queryKey: ['booking-detail', id],
    queryFn: () => bookingService.getBookingById(id!),
    enabled: !!id,
  });

  // Clear booking store sau khi thanh toán thành công
  useEffect(() => {
    console.log('[SUCCESS] Clearing booking store after payment');
    bookingStore.clearAll();
  }, []);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/(tabs)');
      return true;
    });
    return () => handler.remove();
  }, [router]);

  const booking: Booking | undefined = bookingResponse?.data?.data;

  return (
    <ScreenWrapper>
      <ScreenHeader title="Vé của bạn" showBack={false} />
      <ScrollView contentContainerStyle={styles.container}>
        <ConfettiCannon count={100} origin={{ x: 200, y: 0 }} fadeOut={true} />
        
        <View style={styles.successBadge}>
          <Text style={styles.successIcon}>✓</Text>
        </View>
        
        <Text style={styles.title}>Thanh toán thành công!</Text>
        <Text style={styles.subtitle}>Cảm ơn bạn đã đặt vé. Hãy xuất trình mã QR này tại quầy vé.</Text>

        {isLoading ? (
          <Text style={styles.loadingText}>Đang tải thông tin vé...</Text>
        ) : booking ? (
          <QRTicket
            qrCode={booking.qrCode || booking.id}
            movieTitle={booking.showtime?.movie?.title || ''}
            cinemaName={booking.showtime?.room?.cinema?.name || ''}
            roomName={booking.showtime?.room?.name || ''}
            showTime={new Date(booking.showtime?.startTime || '').toLocaleString('vi-VN')}
            seats={booking.bookingItems?.map(item => `${item.seat?.row}${item.seat?.col}`) || []}
            totalAmount={booking.totalAmount}
          />
        ) : (
          <Text style={styles.errorText}>Không thể tải dữ liệu vé</Text>
        )}

        <View style={styles.footer}>
          <Pressable 
            onPress={() => router.replace('/(tabs)')} 
            style={[styles.btn, styles.btnHome]}
          >
            <Text style={styles.btnTextHome}>VỀ TRANG CHỦ</Text>
          </Pressable>
          
          <Pressable 
            onPress={() => router.replace('/(tabs)/tickets')} 
            style={[styles.btn, styles.btnTickets]}
          >
            <Text style={styles.btnTextTickets}>XEM LỊCH SỬ ĐẶT VÉ</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
  },
  successBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  successIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  loadingText: {
    color: Colors.textSecondary,
    marginVertical: 40,
  },
  errorText: {
    color: Colors.primary,
    marginVertical: 40,
  },
  footer: {
    width: '100%',
    marginTop: 20,
    gap: 12,
  },
  btn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnHome: {
    backgroundColor: Colors.primary,
  },
  btnTextHome: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  btnTickets: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  btnTextTickets: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
