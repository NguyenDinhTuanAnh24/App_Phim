import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/constants';
import { cinemaService } from '@/services/cinema.service';

export default function CinemaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const cinemaQuery = useQuery({
    queryKey: ['cinema', id],
    queryFn: async () => (await cinemaService.getCinemas()).data,
  });

  const cinema = Array.isArray(cinemaQuery.data?.data)
    ? cinemaQuery.data.data.find((item: any) => item.id === id)
    : null;

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <ScreenHeader title="Chi tiết rạp" showBack />
        <View style={{ padding: 16 }}>
          {cinemaQuery.isLoading ? (
            <Text style={{ color: Colors.textSecondary }}>Đang tải...</Text>
          ) : cinemaQuery.isError ? (
            <Text style={{ color: Colors.textSecondary }}>Không thể tải rạp</Text>
          ) : !cinema ? (
            <Text style={{ color: Colors.textSecondary }}>Không tìm thấy rạp</Text>
          ) : (
            <View>
              <Text style={{ color: Colors.text, fontSize: 20, fontWeight: '700' }}>{cinema.name}</Text>
              <Text style={{ color: Colors.textSecondary, marginTop: 8 }}>{cinema.address}</Text>
              <Text style={{ color: Colors.textSecondary, marginTop: 8 }}>{cinema.city}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
