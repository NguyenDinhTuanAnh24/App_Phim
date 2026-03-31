import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { adminService } from '@/services/admin.service';
import { Colors } from '@/constants';
import { formatCurrency } from '@/constants/format';
import { formatDate } from '@/constants/date';

const statuses = ['ALL', 'PAID', 'PENDING', 'CANCELLED', 'EXPIRED'] as const;
const statusLabel: Record<(typeof statuses)[number], string> = {
  ALL: 'Tất cả',
  PAID: 'Đã thanh toán',
  PENDING: 'Chờ thanh toán',
  CANCELLED: 'Đã hủy',
  EXPIRED: 'Hết hạn',
};

export default function AdminBookings() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);

  const bookingsQuery = useQuery({
    queryKey: ['admin', 'bookings', search, status, page],
    queryFn: async () =>
      (await adminService.getBookings({
        search: search.trim() || undefined,
        status: status === 'ALL' ? undefined : status,
        page,
      })).data,
    placeholderData: (prev) => prev,
  });

  const bookings = Array.isArray(bookingsQuery.data?.bookings)
    ? bookingsQuery.data.bookings
    : [];

  const filtered = useMemo(() => bookings, [bookings]);

  return (
    <ScreenWrapper variant="admin">
      <ScreenHeader title="Quản lý đặt vé" subtitle="Dữ liệu thời gian thực" variant="admin" />
      <View style={{ padding: 16, flex: 1 }}>
        <TextInput
          placeholder="Tìm kiếm"
          placeholderTextColor={Colors.admin.textSecondary}
          value={search}
          onChangeText={(value) => {
            setSearch(value);
            setPage(1);
          }}
          style={{
            backgroundColor: Colors.admin.surface,
            color: Colors.admin.text,
            padding: 12,
            borderRadius: 16,
            marginTop: 12,
            borderWidth: 0.5,
            borderColor: Colors.glassBorder,
          }}
        />
        <View style={{ height: 40, marginVertical: 12 }}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {statuses.map((item) => (
              <Pressable
                key={item}
                onPress={() => {
                  setStatus(item);
                  setPage(1);
                }}
                style={{
                  backgroundColor: status === item ? Colors.admin.primary : Colors.admin.surface,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 0.5,
                  borderColor: status === item ? 'rgba(229,9,20,0.45)' : Colors.glassBorder,
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: Colors.admin.text }}>{statusLabel[item]}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {bookingsQuery.isLoading ? (
          <Text style={{ color: Colors.admin.textSecondary }}>Đang tải...</Text>
        ) : bookingsQuery.isError ? (
          <Pressable onPress={() => bookingsQuery.refetch()}>
            <Text style={{ color: Colors.admin.primary }}>Không thể tải. Thử lại</Text>
          </Pressable>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }: any) => (
              <Pressable
                onPress={() => router.push(`/admin/booking-detail/${item.id}`)}
                style={{
                  backgroundColor: Colors.admin.surface,
                  padding: 12,
                  borderRadius: 16,
                  marginBottom: 10,
                  borderWidth: 0.5,
                  borderColor: Colors.glassBorder,
                }}
              >
                <Text style={{ color: Colors.admin.text, fontWeight: '600' }}>
                  {item.showtime?.movie?.title ?? 'Đặt vé'}
                </Text>
                <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>
                  👤 {item.user?.name ?? 'Người dùng'} • {item.user?.phone ?? ''}
                </Text>
                <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>
                  🕐 {formatDate(item.showtime?.startTime ?? item.showtime?.start_time ?? item.createdAt ?? item.created_at)}
                </Text>
                <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>
                  💰 {formatCurrency(Number(item.totalAmount ?? item.total_amount ?? 0))} [{statusLabel[(item.status as keyof typeof statusLabel)] ?? item.status}]
                </Text>
              </Pressable>
            )}
            removeClippedSubviews
            windowSize={7}
            initialNumToRender={8}
            onEndReached={() => setPage((prev) => prev + 1)}
            onEndReachedThreshold={0.5}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}
