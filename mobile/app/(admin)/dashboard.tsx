import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { BarChart } from 'react-native-chart-kit';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/constants';
import { adminService } from '@/services/admin.service';
import { formatCurrency } from '@/constants/format';
import { useAuthStore } from '@/stores/authStore';

const periods = [
  { key: '7d', label: '7 ngày' },
  { key: '30d', label: '30 ngày' },
  { key: '12m', label: '12 tháng' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [period, setPeriod] = useState(periods[0].key);
  const logout = useAuthStore((state) => state.logout);

  const statsQuery = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: async () => (await adminService.getDashboardStats()).data,
  });

  const revenueQuery = useQuery({
    queryKey: ['admin', 'dashboard', 'revenue', period],
    queryFn: async () => (await adminService.getRevenueChart(period)).data,
  });

  const recentBookingsQuery = useQuery({
    queryKey: ['admin', 'dashboard', 'recent-bookings'],
    queryFn: async () => (await adminService.getRecentBookings()).data,
  });

  const stats = statsQuery.data?.data ?? statsQuery.data;
  const revenueItems = Array.isArray(revenueQuery.data?.data)
    ? revenueQuery.data.data
    : Array.isArray(revenueQuery.data)
    ? revenueQuery.data
    : [];
  const recentBookings = Array.isArray(recentBookingsQuery.data?.data)
    ? recentBookingsQuery.data.data
    : Array.isArray(recentBookingsQuery.data)
    ? recentBookingsQuery.data
    : [];

  const chartData = useMemo(() => {
    const labels = revenueItems.map((item: any) => item.label ?? item.date ?? '');
    const data = revenueItems.map((item: any) => Number(item.revenue ?? 0) / 1_000_000);
    return {
      labels,
      datasets: [{ data: data.length ? data : [0] }],
    };
  }, [revenueItems]);

  return (
    <ScreenWrapper variant="admin">
      <ScreenHeader
        title="Bảng điều khiển"
        subtitle="Bảng điều khiển"
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ backgroundColor: 'rgba(229,9,20,0.16)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(229,9,20,0.35)' }}>
              <Text style={{ color: Colors.admin.text, fontWeight: '700' }}>ADMIN</Text>
            </View>
            <Pressable
              onPress={async () => {
                await logout();
                router.replace('/(auth)/login');
              }}
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 0.5,
                borderColor: Colors.glassBorder,
              }}
            >
              <Text style={{ color: Colors.admin.text, fontWeight: '700' }}>Đăng xuất</Text>
            </Pressable>
          </View>
        }
        variant="admin"
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>

        {statsQuery.isLoading ? (
          <Text style={{ color: Colors.admin.textSecondary, marginTop: 16 }}>Đang tải thống kê...</Text>
        ) : statsQuery.isError ? (
          <Pressable onPress={() => statsQuery.refetch()} style={{ marginTop: 16 }}>
            <Text style={{ color: Colors.admin.primary }}>Không thể tải thống kê. Thử lại</Text>
          </Pressable>
        ) : (
          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1, backgroundColor: Colors.admin.cards.revenue, padding: 14, borderRadius: 20, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
                <Text style={{ color: Colors.textSecondary }}>💰 Hôm nay</Text>
                <Text style={{ color: Colors.admin.text, fontWeight: '700', marginTop: 6 }}>
                  {formatCurrency(Number(stats?.today?.revenue ?? 0))}
                </Text>
                <Text style={{ color: Colors.admin.textSecondary }}>↑ {stats?.growth?.revenueVsYesterday ?? 0}%</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: Colors.admin.cards.bookings, padding: 14, borderRadius: 20, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
                <Text style={{ color: Colors.textSecondary }}>🎫 Đơn hàng</Text>
                <Text style={{ color: Colors.admin.text, fontWeight: '700', marginTop: 6 }}>
                  {stats?.today?.bookings ?? 0} đơn
                </Text>
                <Text style={{ color: Colors.admin.textSecondary }}>↑ {stats?.growth?.bookingsVsYesterday ?? 0}%</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <View style={{ flex: 1, backgroundColor: Colors.admin.cards.users, padding: 14, borderRadius: 20, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
                <Text style={{ color: Colors.textSecondary }}>👥 Người dùng</Text>
                <Text style={{ color: Colors.admin.text, fontWeight: '700', marginTop: 6 }}>
                  {stats?.total?.users ?? 0} người
                </Text>
              </View>
              <View style={{ flex: 1, backgroundColor: Colors.admin.cards.movies, padding: 14, borderRadius: 20, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
                <Text style={{ color: Colors.textSecondary }}>🎬 Phim đang chiếu</Text>
                <Text style={{ color: Colors.admin.text, fontWeight: '700', marginTop: 6 }}>
                  {stats?.total?.movies ?? 0} phim
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ marginTop: 24 }}>
          <Text style={{ color: Colors.admin.text, fontWeight: '700', marginBottom: 12 }}>Doanh thu</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            {periods.map((item) => (
              <Pressable
                key={item.key}
                onPress={() => setPeriod(item.key)}
                style={{
                  backgroundColor: period === item.key ? Colors.admin.primary : Colors.admin.surface,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 0.5,
                  borderColor: period === item.key ? 'rgba(229,9,20,0.45)' : Colors.glassBorder,
                }}
              >
                <Text style={{ color: Colors.admin.text }}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          {revenueQuery.isLoading ? (
            <Text style={{ color: Colors.admin.textSecondary }}>Đang tải biểu đồ...</Text>
          ) : revenueQuery.isError ? (
            <Pressable onPress={() => revenueQuery.refetch()}>
              <Text style={{ color: Colors.admin.primary }}>Không thể tải biểu đồ. Thử lại</Text>
            </Pressable>
          ) : (
            <BarChart
              data={chartData}
              width={width - 32}
              height={180}
              yAxisLabel=""
              yAxisSuffix="tr"
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: Colors.background,
                backgroundGradientTo: Colors.background,
                color: (opacity = 1) => `rgba(229, 9, 20, ${opacity})`,
                labelColor: () => Colors.textSecondary,
                propsForBackgroundLines: { stroke: 'rgba(255,255,255,0.12)' },
              }}
              style={{ borderRadius: 16, borderWidth: 0.5, borderColor: Colors.glassBorder, backgroundColor: Colors.background }}
            />
          )}
        </View>

        <View style={{ marginTop: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: Colors.admin.text, fontWeight: '700' }}>Đơn hàng gần nhất</Text>
          </View>
          {recentBookingsQuery.isLoading ? (
            <Text style={{ color: Colors.admin.textSecondary, marginTop: 8 }}>Đang tải...</Text>
          ) : recentBookingsQuery.isError ? (
            <Pressable onPress={() => recentBookingsQuery.refetch()} style={{ marginTop: 8 }}>
              <Text style={{ color: Colors.admin.primary }}>Không thể tải. Thử lại</Text>
            </Pressable>
          ) : recentBookings.length === 0 ? (
            <Text style={{ color: Colors.admin.textSecondary, marginTop: 8 }}>Chưa có đơn hàng</Text>
          ) : (
            <View style={{ marginTop: 8 }}>
              {recentBookings.slice(0, 5).map((item: any) => (
                <View
                  key={item.id}
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
                    {item.user?.name ?? 'Người dùng'} • {formatCurrency(Number(item.totalAmount ?? item.total_amount ?? 0))}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
