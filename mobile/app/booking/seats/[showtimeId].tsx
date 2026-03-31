import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useMemo, memo, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { formatCurrency } from '@/constants/format';
import { showtimeService } from '@/services/showtime.service';
import { useSocket } from '@/hooks/useSocket';
import { useBookingStore } from '@/stores/bookingStore';
import { Seat, ShowtimeSlot } from '@/constants/types';

const SeatCell = memo(
  ({
    seat,
    selected,
    isLocked,
    isBooked,
    onPress,
  }: {
    seat: Seat;
    selected: boolean;
    isLocked: boolean;
    isBooked: boolean;
    onPress: (seat: Seat) => void;
  }) => {
    const isCouple = seat.type === 'COUPLE';
    const borderColor =
      seat.type === 'VIP'
        ? '#FFD700'
        : seat.type === 'COUPLE'
        ? '#C084FC'
        : Colors.surfaceLight;
    
    let backgroundColor = Colors.surface;
    if (isBooked) backgroundColor = '#2A2A2A';
    else if (selected) backgroundColor = Colors.primary;
    else if (isLocked) backgroundColor = '#F59E0B';

    return (
      <TouchableOpacity
        disabled={isBooked || (isLocked && !selected)}
        onPress={() => onPress(seat)}
        style={[
          S.seatCell,
          isCouple && S.seatCouple,
          { borderColor, backgroundColor, opacity: isBooked ? 0.5 : 1 },
        ]}
      >
        <Text style={[S.seatLabel, selected && { color: Colors.text }]}>
          {seat.row + seat.col}
        </Text>
        {seat.type === 'VIP' && <Text style={S.vipIcon}>★</Text>}
        {isLocked && !selected && <Text style={S.reserveIcon}>⏳</Text>}
      </TouchableOpacity>
    );
  }
);

export default function SeatSelectionScreen() {
  const router = useRouter();
  const { showtimeId } = useLocalSearchParams<{ showtimeId: string }>();
  
  const bookingStore = useBookingStore();
  const { selectedSeats, addSeat, removeSeat, selectedShowtime, setShowtime } = bookingStore;
  const { lockedSeats, bookedSeats, lockSeat, unlockSeat } = useSocket(showtimeId);

  // Clear seats & foods khi vào lại seat selection (user back từ food/checkout)
  useEffect(() => {
    console.log('[SEAT SELECTION] Clearing seats and foods on mount');
    // Chỉ clear seats và foods, giữ lại showtime và cinema
    bookingStore.selectedSeats.forEach(seat => unlockSeat(seat.id));
    // Set lại state
    useBookingStore.setState({
      selectedSeats: [],
      selectedFoods: [],
      voucherCode: null,
      discount: 0,
    });
  }, []);

  const { data: fullData, isLoading: isLoadingSeats } = useQuery({
    queryKey: ['showtime-seats', showtimeId],
    queryFn: () => showtimeService.getSeats(showtimeId!),
    enabled: !!showtimeId,
  });

  const seatsData: Seat[] = useMemo(() => {
    return Array.isArray(fullData?.seats) ? fullData.seats : [];
  }, [fullData?.seats]);

  const showtime: ShowtimeSlot | null = useMemo(() => {
    return selectedShowtime || fullData?.showtime || null;
  }, [selectedShowtime, fullData?.showtime]);

  const seatsByRow = useMemo(() => {
    const grouped: Record<string, Seat[]> = {};
    seatsData.forEach((seat) => {
      if (!grouped[seat.row]) grouped[seat.row] = [];
      grouped[seat.row].push(seat);
    });
    return Object.entries(grouped).map(([row, seats]) => ({
      row,
      seats: seats.sort((a, b) => a.col - b.col),
    }));
  }, [seatsData]);

  const total = useMemo(
    () => selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0),
    [selectedSeats]
  );

  const handleSeatPress = (seat: Seat) => {
    const isSelected = selectedSeats.some((s) => s.id === seat.id);
    if (isSelected) {
      removeSeat(seat.id);
      unlockSeat(seat.id);
    } else {
      if (selectedSeats.length >= 8) return;
      addSeat(seat);
      lockSeat(seat.id);
    }
  };

  const selectedLabel = selectedSeats
    .map((seat) => `${seat.row}${seat.col}`)
    .join(', ');

  const formattedTime = useMemo(() => {
    if (!showtime?.startTime) return '...';
    return new Date(showtime.startTime).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [showtime?.startTime]);

  if (isLoadingSeats) {
    return (
      <View style={[S.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Feather name="chevron-left" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Chọn ghế</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={S.movieInfo}>
          <Text style={S.movieTitle}>{fullData?.movie?.title || 'Đang tải...'}</Text>
          <Text style={S.movieMeta}>
            {fullData?.showtime?.format} · {fullData?.showtime?.language} · Suất {formattedTime}
          </Text>
        </View>

        <View style={S.screenWrap}>
          <LinearGradient
            colors={['rgba(229,9,20,0.4)', 'rgba(10,10,10,0)']}
            style={S.screenGlow}
          />
          <Text style={S.screenText}>MÀN HÌNH</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.seatScroll}>
          <View>
            {seatsByRow.map((row) => (
              <View key={row.row} style={S.row}>
                <Text style={S.rowLabel}>{row.row}</Text>
                <View style={S.rowSeats}>
                  {row.seats.map((seat) => (
                    <SeatCell
                      key={seat.id}
                      seat={seat}
                      selected={selectedSeats.some((item) => item.id === seat.id)}
                      isLocked={lockedSeats.includes(seat.id)}
                      isBooked={bookedSeats.includes(seat.id) || seat.status === 'BOOKED'}
                      onPress={handleSeatPress}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={S.legend}>
          <LegendItem color={Colors.surface} label="Ghế thường" borderColor={Colors.surfaceLight} />
          <LegendItem color={Colors.surface} label="Ghế VIP" borderColor="#FFD700" icon="★" />
          <LegendItem color={Colors.surface} label="Ghế Couple" borderColor="#C084FC" icon="❤" />
          <LegendItem color={Colors.primary} label="Đã chọn" />
          <LegendItem color="#2A2A2A" label="Đã bán" />
          <LegendItem color="#F59E0B" label="Đang giữ" icon="⏳" />
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      <View style={S.footer}>
        <View style={S.summary}>
          <Text style={S.summaryLabel}>Ghế đã chọn</Text>
          <Text style={S.summaryValue}>{selectedLabel || 'Chưa chọn'}</Text>
        </View>
        <View style={S.totalRow}>
          <Text style={S.summaryLabel}>Tổng tiền</Text>
          <Text style={S.totalValue}>{formatCurrency(total)}</Text>
        </View>
        <TouchableOpacity
          style={[S.confirmBtn, selectedSeats.length === 0 && { opacity: 0.6 }]}
          disabled={selectedSeats.length === 0}
          onPress={() => router.push('/booking/food')}
        >
          <Text style={S.confirmText}>XÁC NHẬN ĐẶT GHẾ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function LegendItem({
  color,
  label,
  borderColor,
  icon,
}: {
  color: string;
  label: string;
  borderColor?: string;
  icon?: string;
}) {
  return (
    <View style={S.legendItem}>
      <View style={[S.legendBox, { backgroundColor: color, borderColor: borderColor ?? 'transparent' }]}>
        {icon ? <Text style={S.legendIcon}>{icon}</Text> : null}
      </View>
      <Text style={S.legendText}>{label}</Text>
    </View>
  );
}

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.glass,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  movieInfo: { paddingHorizontal: 16, paddingBottom: 12 },
  movieTitle: { color: Colors.text, fontSize: 18, fontWeight: '600' },
  movieMeta: { color: Colors.textSecondary, fontSize: 12, marginTop: 4 },
  screenWrap: {
    marginHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  screenGlow: { width: '100%', height: 18, borderRadius: 10 },
  screenText: { color: Colors.textSecondary, fontSize: 12, marginTop: 6, letterSpacing: 2 },
  seatScroll: { paddingHorizontal: 16, paddingBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  rowLabel: { color: Colors.textSecondary, width: 20, marginRight: 8, fontSize: 12 },
  rowSeats: { flexDirection: 'row', flexWrap: 'nowrap', gap: 6 },
  seatCell: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatCouple: { width: 70 },
  seatLabel: { color: Colors.textSecondary, fontSize: 9 },
  vipIcon: { color: '#FFD700', fontSize: 10, marginTop: 2 },
  reserveIcon: { color: Colors.text, fontSize: 10, marginTop: 2 },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendText: { color: Colors.textSecondary, fontSize: 11 },
  legendIcon: { fontSize: 10 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLight,
    padding: 16,
  },
  summary: { marginBottom: 6 },
  summaryLabel: { color: Colors.textSecondary, fontSize: 12 },
  summaryValue: { color: Colors.text, fontSize: 12, marginTop: 2 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  totalValue: { color: Colors.text, fontWeight: '700' },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },
  confirmText: { color: Colors.text, fontSize: 13, fontWeight: '700' },
});

