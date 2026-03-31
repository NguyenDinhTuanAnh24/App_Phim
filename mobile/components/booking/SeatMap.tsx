import { useMemo } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { Colors } from '@/constants';
import type { Seat } from '@/constants/types';

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: Seat[];
  lockedSeatIds?: string[];
  onSelect: (seat: Seat) => void;
}

const GAP = 6;
const PADDING = 16;

export const SeatMap = ({ seats, selectedSeats, lockedSeatIds = [], onSelect }: SeatMapProps) => {
  const { width } = Dimensions.get('window');
  const grouped = useMemo(() => {
    const map = new Map<string, Seat[]>();
    seats.forEach((seat) => {
      const list = map.get(seat.row) ?? [];
      list.push(seat);
      map.set(seat.row, list);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [seats]);

  const maxCols = Math.max(0, ...seats.map((seat) => seat.col));
  const seatSize = maxCols
    ? (width - PADDING * 2 - GAP * maxCols) / maxCols
    : 24;

  const renderSeat = (seat: Seat) => {
    const isSelected = selectedSeats.some((s) => s.id === seat.id);
    const isLocked = lockedSeatIds.includes(seat.id) || seat.status === 'LOCKED';
    const isBooked = seat.status === 'BOOKED';
    const isDisabled = seat.status === 'DISABLED' || seat.type === 'DISABLED';

    let background = Colors.seat.available;
    if (seat.type === 'VIP') background = Colors.seat.vip;
    if (seat.type === 'COUPLE') background = Colors.seat.couple;
    if (isLocked) background = Colors.seat.locked;
    if (isBooked) background = Colors.seat.booked;
    if (isSelected) background = Colors.seat.selected;

    return (
      <Pressable
        key={seat.id}
        disabled={isBooked || isLocked || isDisabled}
        onPress={() => onSelect(seat)}
        style={{
          width: seatSize,
          height: seatSize,
          marginRight: GAP,
          marginBottom: GAP,
          borderRadius: 6,
          backgroundColor: background,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDisabled ? 0.4 : 1,
        }}
      >
        <Text style={{ color: Colors.text, fontSize: 10 }}>{seat.row}{seat.col}</Text>
      </Pressable>
    );
  };

  return (
    <View style={{ paddingHorizontal: PADDING }}>
      {grouped.map(([row, rowSeats]) => (
        <View key={row} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {rowSeats.map(renderSeat)}
        </View>
      ))}
      <View style={{ marginTop: 16 }}>
        <Text style={{ color: Colors.text, fontWeight: '700', marginBottom: 8 }}>Chú thích</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {[
            { label: 'Thường', color: Colors.seat.available },
            { label: 'VIP', color: Colors.seat.vip },
            { label: 'Ghế đôi', color: Colors.seat.couple },
            { label: 'Đã đặt', color: Colors.seat.booked },
            { label: 'Đang giữ', color: Colors.seat.locked },
            { label: 'Đang chọn', color: Colors.seat.selected },
          ].map((item) => (
            <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12, marginBottom: 6 }}>
              <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: item.color, marginRight: 6 }} />
              <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};