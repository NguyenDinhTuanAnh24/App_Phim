import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, View, StyleSheet, ScrollView, RefreshControl, SafeAreaView as RNSafeAreaView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/constants';
import { bookingService } from '@/services/booking.service';
import type { Booking } from '@/constants/types';
import { useQuery } from '@tanstack/react-query';
import { QRTicket } from '@/components/booking/QRTicket';
import dayjs from 'dayjs';

const TABS = [
  { key: 'UPCOMING', label: 'Sắp xem' },
  { key: 'PAST', label: 'Đã xem' },
  { key: 'CANCELLED', label: 'Lịch sử huỷ' },
];

export default function TicketsScreen() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data: response, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => (await bookingService.getUserBookings()).data,
  });

  const bookings: Booking[] = Array.isArray(response?.data) ? response?.data : [];

  const filteredBookings = useMemo(() => {
    const now = dayjs();
    if (activeTab === 'CANCELLED') {
      return bookings.filter(b => b.status === 'CANCELLED' || b.status === 'EXPIRED');
    }
    if (activeTab === 'PAST') {
      return bookings.filter(b => b.status === 'PAID' && dayjs(b.showtime?.startTime).isBefore(now));
    }
    // UPCOMING: Đã thanh toán và chưa đến giờ chiếu
    return bookings.filter(b => b.status === 'PAID' && dayjs(b.showtime?.startTime).isAfter(now));
  }, [activeTab, bookings]);

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const startTime = dayjs(item.showtime?.startTime);
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => setSelectedBooking(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.movieTitle} numberOfLines={1}>
            {item.showtime?.movie?.title}
          </Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.status === 'PAID' ? '#10B98122' : '#EF444422' }
          ]}>
            <Text style={[
              styles.statusText, 
              { color: item.status === 'PAID' ? '#10B981' : '#EF4444' }
            ]}>
              {item.status === 'PAID' ? 'Đã thanh toán' : item.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="map-pin" size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{item.showtime?.room?.cinema?.name}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="clock" size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{startTime.format('HH:mm · DD/MM/YYYY')}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="grid" size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{item.bookingItems?.map(i => `${i.seat?.row}${i.seat?.col}`).join(', ')}</Text>
          </View>
          <View style={{ paddingTop: 8, alignItems: 'center' }}>
            <Feather name="minus" size={16} color="rgba(255,255,255,0.25)" />
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.totalLabel}>Tổng tiền</Text>
            <Text style={styles.totalValue}>
              {item.totalAmount?.toLocaleString('vi-VN')}đ
            </Text>
          </View>
          <LinearGradient
            colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 12 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 6 }}>
              <Feather name="maximize-2" size={14} color="#FFF" />
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 12 }}>View QR</Text>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  return (
      <ScreenWrapper>
      <ScreenHeader title="Vé của tôi" subtitle="Digital Stubs" />
      
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Bạn không có vé nào ở mục này</Text>
            </View>
          ) : null
        }
      />

        <Modal 
        visible={!!selectedBooking} 
        animationType="slide" 
        transparent={false}
        onRequestClose={() => setSelectedBooking(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setSelectedBooking(null)} style={styles.closeBtn}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Chi tiết vé</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {selectedBooking && (
              <View style={{ paddingHorizontal: 20 }}>
                <QRTicket
                  qrCode={selectedBooking.qrCode || selectedBooking.id}
                  movieTitle={selectedBooking.showtime?.movie?.title || ''}
                  cinemaName={selectedBooking.showtime?.room?.cinema?.name || ''}
                  roomName={selectedBooking.showtime?.room?.name || ''}
                  showTime={dayjs(selectedBooking.showtime?.startTime).format('HH:mm · DD/MM/YYYY')}
                  seats={selectedBooking.bookingItems?.map(i => `${i.seat?.row}${i.seat?.col}`) || []}
                  totalAmount={selectedBooking.totalAmount}
                />
              </View>
            )}
            
            <View style={styles.modalInstruction}>
              <Text style={styles.instructionText}>
                * Vui lòng đưa mã QR cho nhân viên rạp để soát vé.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: Colors.glass,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
  },
  tabItemActive: {
    backgroundColor: 'rgba(176,0,32,0.35)',
    borderColor: Colors.primaryGradientEnd,
  },
  tabLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: Colors.text,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.glass,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  movieTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardBody: {
    gap: 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
    marginBottom: 12,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  totalValue: {
    color: Colors.primaryGradientEnd,
    fontSize: 15,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.glass,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: Colors.text,
    fontSize: 18,
  },
  modalInstruction: {
    padding: 20,
    alignItems: 'center',
  },
  instructionText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  }
});
