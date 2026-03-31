import { useMemo, useState, useEffect, useRef } from 'react';
import { Alert, Pressable, Text, View, ActivityIndicator, AppState } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { VoucherPicker } from '@/components/booking/VoucherPicker';
import { Colors } from '@/constants';
import { useBookingStore } from '@/stores/bookingStore';
import { bookingService } from '@/services/booking.service';
import { voucherService } from '@/services/voucher.service';
import { pointsService } from '@/services/points.service';
import { formatCurrency } from '@/constants/format';

export default function CheckoutScreen() {
  const router = useRouter();
  const bookingStore = useBookingStore();
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);
  const isCheckingPayment = useRef(false);

  const vouchersQuery = useQuery({
    queryKey: ['vouchers'],
    queryFn: async () => (await voucherService.getAvailableVouchers()).data,
  });

  const myVouchersQuery = useQuery({
    queryKey: ['points', 'my-vouchers'],
    queryFn: async () => (await pointsService.getMyVouchers()).data,
  });

  // Detect khi app quay về foreground (user vuốt về từ browser)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      console.log('[CHECKOUT] App state:', appState.current, '→', nextAppState);
      
      // Khi app chuyển từ background/inactive → active
      if (
        appState.current.match(/inactive|background/) && 
        nextAppState === 'active' &&
        pendingBookingId &&
        !isCheckingPayment.current
      ) {
        console.log('[CHECKOUT] App returned to foreground, checking payment status...');
        isCheckingPayment.current = true;
        
        // Delay ngắn để user thấy màn hình checkout trước
        setTimeout(() => {
          handleAppReturnFromPayment(pendingBookingId);
        }, 500);
      }
      
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [pendingBookingId]);

  // Handle khi app quay về từ payment
  const handleAppReturnFromPayment = async (bookingId: string) => {
    try {
      await checkPaymentStatus(bookingId);
    } finally {
      isCheckingPayment.current = false;
    }
  };

  const bookingMutation = useMutation({
    mutationFn: async (voucherCode?: string) => {
      const response = await bookingService.createBooking({
        showtimeId: bookingStore.selectedShowtime?.id as string,
        seatIds: bookingStore.selectedSeats.map((seat) => seat.id),
        foodItems: bookingStore.selectedFoods.map((item) => ({
          comboId: item.combo.id,
          quantity: item.quantity,
        })),
        voucherCode: voucherCode || undefined,
      });
      return response.data.data;
    },
    onSuccess: async (booking) => {
      try {
        setPendingBookingId(booking.id);
        const paymentResponse = await bookingService.createPaymentUrl(booking.id);

        const result = await WebBrowser.openBrowserAsync(
          paymentResponse.data.paymentUrl,
          {
            dismissButtonStyle: 'close',
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          }
        );

        console.log('[PAYMENT] Browser closed:', result.type);

        if ((result.type === 'dismiss' || result.type === 'cancel') && !isCheckingPayment.current) {
          isCheckingPayment.current = true;
          await checkPaymentStatus(booking.id);
          isCheckingPayment.current = false;
        }
      } catch (error) {
        console.error('[PAYMENT] Browser error:', error);
        setPendingBookingId(null);
        Alert.alert('Lỗi', 'Không thể mở trang thanh toán');
      }
    },
    onError: (error: any) => {
      setPendingBookingId(null);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tạo booking');
    },
  });

  // Check payment status sau khi browser đóng hoặc app quay về
  const checkPaymentStatus = async (bookingId: string) => {
    try {
      console.log('[CHECKOUT] Checking payment status for:', bookingId);
      
      // Delay để backend xử lý callback từ VNPay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fetch booking để check status
      const bookingResponse = await bookingService.getBookingById(bookingId);
      const booking = bookingResponse.data.data;
      
      console.log('[CHECKOUT] Booking status:', booking.status);
      
      if (booking.status === 'PAID') {
        setPendingBookingId(null);
        // Success - hiển thị thông báo và navigate
        Alert.alert(
          '✅ Thanh toán thành công!',
          'Vé của bạn đã được đặt thành công.',
          [
            {
              text: 'Xem vé',
              onPress: () => router.replace(`/booking/success/${bookingId}`),
            },
          ],
          { cancelable: false }
        );
      } else if (booking.status === 'CANCELLED') {
        setPendingBookingId(null);
        // Failed
        Alert.alert(
          '❌ Thanh toán thất bại',
          'Giao dịch đã bị hủy hoặc không thành công.',
          [
            {
              text: 'Thử lại',
              onPress: () => {}, // Stay on checkout
            },
            {
              text: 'Về trang chủ',
              onPress: () => router.replace('/(tabs)'),
              style: 'cancel',
            },
          ]
        );
      } else {
        // Still pending - hỏi user
        Alert.alert(
          '⏳ Kiểm tra thanh toán',
          'Bạn đã hoàn tất thanh toán chưa?',
          [
            {
              text: 'Đã thanh toán',
              onPress: () => {
                // Check lại sau 3s
                setTimeout(() => {
                  if (isCheckingPayment.current) return;
                  isCheckingPayment.current = true;
                  checkPaymentStatus(bookingId).finally(() => {
                    isCheckingPayment.current = false;
                  });
                }, 3000);
              },
            },
            {
              text: 'Chưa thanh toán',
              style: 'cancel',
              onPress: () => {
                // Stay on checkout, clear pending
                setPendingBookingId(null);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('[CHECKOUT] Check status error:', error);
      setPendingBookingId(null);
      Alert.alert(
        'Lỗi',
        'Không thể kiểm tra trạng thái thanh toán. Vui lòng kiểm tra trong lịch sử đặt vé.',
        [
          {
            text: 'Về trang chủ',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    }
  };

  const totalSeat = bookingStore.selectedSeats.reduce((sum, seat) => sum + (seat.price ?? 0), 0);
  const totalFood = bookingStore.selectedFoods.reduce((sum, item) => sum + item.combo.price * item.quantity, 0);
  const subtotal = totalSeat + totalFood;

  const voucherCode = bookingStore.voucherCode || '';
  const discount = bookingStore.discount || 0;
  const total = subtotal - discount;

  const applyVoucher = async (code: string) => {
    try {
      const response = await voucherService.validateVoucher(code, subtotal);
      const discountAmount = response.data.data.discountAmount ?? 0;
      bookingStore.setVoucher(code, discountAmount);
      Alert.alert('Thành công', `Đã áp dụng mã giảm giá ${formatCurrency(discountAmount)}`);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể áp dụng voucher');
    }
  };

  const removeVoucher = () => {
    bookingStore.setVoucher('', 0);
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title="Thanh toán" showBack />
      <View style={{ flex: 1, padding: 16 }}>
        <View style={{ backgroundColor: Colors.surface, padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <Text style={{ color: Colors.text, fontWeight: '600', marginBottom: 12 }}>Tóm tắt đơn hàng</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: Colors.textSecondary }}>Ghế ({bookingStore.selectedSeats.length})</Text>
            <Text style={{ color: Colors.textSecondary }}>{formatCurrency(totalSeat)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: Colors.textSecondary }}>Combo đồ ăn</Text>
            <Text style={{ color: Colors.textSecondary }}>{formatCurrency(totalFood)}</Text>
          </View>
        </View>

        {vouchersQuery.isError ? (
          <Text style={{ color: Colors.textSecondary }}>Không thể tải voucher</Text>
        ) : myVouchersQuery.isError ? (
          <Text style={{ color: Colors.textSecondary }}>Không thể tải voucher đổi điểm</Text>
        ) : vouchersQuery.isLoading || myVouchersQuery.isLoading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <VoucherPicker
            vouchers={vouchersQuery.data?.data ?? []}
            myVouchers={myVouchersQuery.data?.data ?? []}
            onApply={applyVoucher}
          />
        )}

        {voucherCode ? (
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            backgroundColor: '#10B98115', 
            padding: 12, 
            borderRadius: 8, 
            marginTop: 12,
            borderWidth: 1,
            borderColor: '#10B98144'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>🎫</Text>
              <View>
                <Text style={{ color: '#10B981', fontWeight: '700', fontSize: 13 }}>{voucherCode}</Text>
                <Text style={{ color: Colors.textSecondary, fontSize: 11 }}>Đã giảm {formatCurrency(discount)}</Text>
              </View>
            </View>
            <Pressable onPress={removeVoucher} style={{ padding: 4 }}>
              <Text style={{ color: '#EF4444', fontWeight: '600', fontSize: 12 }}>Gỡ bỏ</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={{ marginTop: 24, padding: 16, backgroundColor: Colors.surface, borderRadius: 12 }}>
          <Text style={{ color: Colors.textSecondary, fontSize: 12, marginBottom: 4 }}>Phương thức thanh toán</Text>
          <Text style={{ color: Colors.text, fontWeight: '600' }}>Ví điện tử VNPay</Text>
        </View>
      </View>

      <View style={{ padding: 16, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.surfaceLight }}>
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>Tạm tính</Text>
            <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>{formatCurrency(subtotal)}</Text>
          </View>
          {discount > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>Giảm giá</Text>
              <Text style={{ color: '#10B981', fontSize: 13 }}>-{formatCurrency(discount)}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={{ color: Colors.text, fontWeight: '700', fontSize: 16 }}>Tổng cộng</Text>
            <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 20 }}>{formatCurrency(total)}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => bookingMutation.mutate(voucherCode || undefined)}
          style={{ 
            backgroundColor: Colors.primary, 
            padding: 16, 
            borderRadius: 12, 
            alignItems: 'center',
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4
          }}
          disabled={bookingMutation.isPending}
        >
          <Text style={{ color: Colors.text, fontWeight: '700', fontSize: 16 }}>
            {bookingMutation.isPending ? 'ĐANG XỬ LÝ...' : 'THANH TOÁN NGAY'}
          </Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}
