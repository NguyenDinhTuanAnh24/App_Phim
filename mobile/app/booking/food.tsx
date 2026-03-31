import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { FoodComboCard } from '@/components/booking/FoodComboCard';
import { Colors } from '@/constants';
import { useBookingStore } from '@/stores/bookingStore';
import { bookingService } from '@/services/booking.service';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/constants/format';

export default function FoodScreen() {
  const router = useRouter();
  const bookingStore = useBookingStore();

  const combosQuery = useQuery({
    queryKey: ['food-combos'],
    queryFn: async () => (await bookingService.getFoodCombos()).data,
  });

  const combos = Array.isArray(combosQuery.data?.data) ? combosQuery.data.data : [];

  // Tính tổng giá vé (từ ghế đã chọn)
  const ticketTotal = useMemo(() => {
    return bookingStore.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }, [bookingStore.selectedSeats]);

  // Tính tổng giá combo
  const comboTotal = useMemo(() => {
    return bookingStore.selectedFoods.reduce(
      (sum, item) => sum + item.quantity * item.combo.price,
      0
    );
  }, [bookingStore.selectedFoods]);

  // Tổng cộng (vé + combo)
  const grandTotal = ticketTotal + comboTotal;

  return (
    <ScreenWrapper>
      <ScreenHeader title="Chọn combo" showBack />
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={combos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const selection = bookingStore.selectedFoods.find((f) => f.combo.id === item.id);
          return (
            <FoodComboCard
              combo={item}
              quantity={selection?.quantity ?? 0}
              onAdd={() => bookingStore.addFood(item)}
              onRemove={() => bookingStore.updateFoodQty(item.id, Math.max(0, (selection?.quantity ?? 0) - 1))}
            />
          );
        }}
        ListEmptyComponent={
          combosQuery.isLoading ? (
            <Text style={{ color: Colors.textSecondary }}>Đang tải...</Text>
          ) : combosQuery.isError ? (
            <Text style={{ color: Colors.textSecondary }}>Không thể tải combo</Text>
          ) : (
            <Text style={{ color: Colors.textSecondary }}>Không có combo</Text>
          )
        }
      />
      <View style={{ padding: 16, backgroundColor: Colors.surface }}>
        {/* Hiển thị giá vé */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: Colors.textSecondary }}>
            Tiền vé ({bookingStore.selectedSeats.length} ghế)
          </Text>
          <Text style={{ color: Colors.text, fontWeight: '600' }}>
            {formatCurrency(ticketTotal)}
          </Text>
        </View>

        {/* Hiển thị giá combo */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: Colors.textSecondary }}>Tổng combo</Text>
          <Text style={{ color: Colors.text, fontWeight: '600' }}>
            {formatCurrency(comboTotal)}
          </Text>
        </View>

        {/* Đường phân cách */}
        <View style={{ height: 1, backgroundColor: Colors.surfaceLight, marginVertical: 8 }} />

        {/* Tổng cộng */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ color: Colors.text, fontSize: 16, fontWeight: '700' }}>Tổng cộng</Text>
          <Text style={{ color: Colors.primary, fontSize: 18, fontWeight: '800' }}>
            {formatCurrency(grandTotal)}
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/booking/checkout')}
          style={{ backgroundColor: Colors.primary, padding: 14, borderRadius: 12, alignItems: 'center' }}
        >
          <Text style={{ color: Colors.text, fontWeight: '700' }}>Tiếp tục</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/booking/checkout')} style={{ marginTop: 8 }}>
          <Text style={{ color: Colors.textSecondary, textAlign: 'center' }}>Bỏ qua</Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}
