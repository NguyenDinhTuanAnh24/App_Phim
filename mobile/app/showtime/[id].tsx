import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useMemo, useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { cinemaService } from '@/services/cinema.service';
import { useBookingStore } from '@/stores/bookingStore';
import { Cinema, ShowtimeSlot } from '@/constants/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DATE_LIST = Array.from({ length: 7 }).map((_, index) => {
  const date = dayjs().add(index, 'day');
  return {
    key: date.format('YYYY-MM-DD'),
    day: date.format('ddd'),
    label: date.format('DD/MM'),
  };
});

export default function ShowtimeScreen() {
  const router = useRouter();
  const { id: movieId } = useLocalSearchParams<{ id: string }>();
  const bookingStore = useBookingStore();
  const setCinemaStore = bookingStore.setCinema;
  const setShowtimeStore = bookingStore.setShowtime;

  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [selectedDate, setSelectedDate] = useState(DATE_LIST[0]);
  const [selectedShowtime, setSelectedShowtime] = useState<ShowtimeSlot | null>(null);

  // Clear booking store khi vào trang showtime (booking mới)
  useEffect(() => {
    console.log('[SHOWTIME] Clearing old booking data');
    bookingStore.clearAll();
  }, []);

  // 1. Lấy danh sách thành phố
  const { data: citiesResponse } = useQuery({
    queryKey: ['cities'],
    queryFn: () => cinemaService.getAllCities(),
  });
  const cities = citiesResponse?.data?.data || [];

  useEffect(() => {
    if (cities.length > 0 && !selectedCity) {
      setSelectedCity(cities[0]);
    }
  }, [cities, selectedCity]);

  // 2. Lấy danh sách rạp theo thành phố và phim
  const { data: cinemasResponse, isLoading: isLoadingCinemas } = useQuery({
    queryKey: ['cinemas', selectedCity, movieId],
    queryFn: () => cinemaService.getCinemas({ city: selectedCity!, movieId: movieId! }),
    enabled: !!selectedCity && !!movieId,
  });
  const cinemas: Cinema[] = cinemasResponse?.data?.data || [];

  useEffect(() => {
    if (cinemas.length > 0 && !selectedCinema) {
      setSelectedCinema(cinemas[0]);
    }
  }, [cinemas, selectedCinema]);

  // 3. Lấy suất chiếu của rạp được chọn (Dữ liệu trả về là mảng các group theo khung giờ)
  const { data: groupsResponse, isLoading: isLoadingShowtimes } = useQuery({
    queryKey: ['showtimes', selectedCinema?.id, movieId, selectedDate.key],
    queryFn: () => cinemaService.getCinemaShowtimes(selectedCinema!.id, movieId!, selectedDate.key),
    enabled: !!selectedCinema && !!movieId && !!selectedDate,
  });
  const groups = groupsResponse?.data?.data || [];

  const handleConfirm = () => {
    if (selectedShowtime && selectedCinema) {
      setCinemaStore({ id: selectedCinema.id, name: selectedCinema.name });
      setShowtimeStore(selectedShowtime);
      router.push(`/booking/seats/${selectedShowtime.id}`);
    }
  };

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
          <Feather name="chevron-left" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={S.headerTitle}>Suất chiếu</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={groups}
        keyExtractor={(group) => group.period}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.listContent}
        ListHeaderComponent={
          <>
            <View style={S.splitLayout}>
              <View style={S.cityColumn}>
                <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled style={S.cityScroll}>
                  {cities.map((item: string) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => {
                        setSelectedCity(item);
                        setSelectedCinema(null);
                        setSelectedShowtime(null);
                      }}
                      style={[S.cityItem, selectedCity === item && S.cityItemActive]}
                    >
                      <Text style={[S.cityText, selectedCity === item && S.cityTextActive]}>{item}</Text>
                      {selectedCity === item && <View style={S.cityIndicator} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={S.cinemaColumn}>
                <Text style={S.sectionTitle}>Chọn rạp</Text>
                {isLoadingCinemas ? (
                  <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
                ) : (
                  cinemas.map((cinema) => (
                    <TouchableOpacity
                      key={cinema.id}
                      onPress={() => {
                        setSelectedCinema(cinema);
                        setSelectedShowtime(null);
                      }}
                      style={[S.cinemaCard, selectedCinema?.id === cinema.id && S.cinemaCardActive]}
                    >
                      <Text style={S.cinemaName}>{cinema.name}</Text>
                      <Text style={S.cinemaAddress}>{cinema.address}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>

            <Text style={S.sectionTitle}>Chọn ngày</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.dateRow}>
              {DATE_LIST.map((date) => (
                <TouchableOpacity
                  key={date.key}
                  onPress={() => {
                    setSelectedDate(date);
                    setSelectedShowtime(null);
                  }}
                  style={[S.dateItem, selectedDate.key === date.key && S.dateItemActive]}
                >
                  <Text style={[S.dateDay, selectedDate.key === date.key && S.dateDayActive]}>{date.day}</Text>
                  <Text style={[S.dateLabel, selectedDate.key === date.key && S.dateLabelActive]}>{date.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {isLoadingShowtimes && <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />}
          </>
        }
        ListEmptyComponent={!isLoadingShowtimes ? <Text style={S.emptyText}>Không có suất chiếu phù hợp</Text> : null}
        renderItem={({ item: group }) => (
          <View style={S.groupSection}>
            <Text style={S.groupTitle}>{group.period}</Text>
            <View style={S.slotsGrid}>
              {group.slots.map((item: ShowtimeSlot) => {
                const selected = selectedShowtime?.id === item.id;
                const startTime = dayjs(item.startTime).format('HH:mm');
                const endTime = dayjs(item.endTime).format('HH:mm');
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setSelectedShowtime(item)}
                    style={[S.timeCard, selected && S.timeCardActive]}
                  >
                    <Text style={[S.timeText, selected && S.timeTextActive]}>
                      {startTime} - {endTime}
                    </Text>
                    <Text style={[S.timeSub, selected && S.timeTextActive]}>
                      {item.availableSeats}/{item.totalSeats} ghế · {item.format}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      />

      <View style={S.footer}>
        <TouchableOpacity
          style={[S.confirmBtn, !selectedShowtime && { opacity: 0.6 }]}
          disabled={!selectedShowtime}
          onPress={handleConfirm}
        >
          <Text style={S.confirmText}>XÁC NHẬN</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  splitLayout: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  cityColumn: {
    flex: 0.3,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 8,
  },
  cityScroll: { maxHeight: 240 },
  cinemaColumn: { flex: 0.7 },
  cityItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cityItemActive: { backgroundColor: 'rgba(229,9,20,0.12)' },
  cityText: { color: Colors.textSecondary, fontSize: 12 },
  cityTextActive: { color: Colors.text, fontWeight: '600' },
  cityIndicator: { width: 4, height: 16, borderRadius: 2, backgroundColor: Colors.primary },
  sectionTitle: { color: Colors.text, fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 10, paddingHorizontal: 16 },
  cinemaCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  cinemaCardActive: { borderColor: Colors.primary, backgroundColor: 'rgba(229,9,20,0.08)' },
  cinemaName: { color: Colors.text, fontWeight: '600', fontSize: 13 },
  cinemaAddress: { color: Colors.textSecondary, fontSize: 11, marginTop: 4 },
  dateRow: { paddingHorizontal: 16, gap: 10 },
  dateItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 70,
  },
  dateItemActive: { backgroundColor: Colors.primary },
  dateDay: { color: Colors.textSecondary, fontSize: 11 },
  dateDayActive: { color: Colors.text, fontWeight: '600' },
  dateLabel: { color: Colors.text, fontSize: 12, marginTop: 4 },
  dateLabelActive: { color: Colors.text, fontWeight: '600' },
  listContent: { paddingBottom: 120 },
  groupSection: { marginTop: 20, paddingHorizontal: 16 },
  groupTitle: { color: Colors.primary, fontSize: 13, fontWeight: '700', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeCard: {
    width: (SCREEN_WIDTH - 16 * 2 - 10) / 2,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
    marginBottom: 10,
  },
  timeCardActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timeText: { color: Colors.text, fontSize: 12, fontWeight: '600' },
  timeSub: { color: Colors.textSecondary, fontSize: 10, marginTop: 6 },
  timeTextActive: { color: Colors.text },
  emptyText: { color: Colors.textSecondary, paddingHorizontal: 16 },
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
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },
  confirmText: { color: Colors.text, fontSize: 14, fontWeight: '700' },
});

