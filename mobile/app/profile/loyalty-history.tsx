import { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/constants';
import { userService } from '@/services/user.service';
import { formatDate } from '@/constants/date';

export default function LoyaltyHistoryScreen() {
  const historyQuery = useQuery({
    queryKey: ['loyalty', 'history'],
    queryFn: async () => (await userService.getLoyaltyHistory()).data,
  });

  const data = historyQuery.data;
  const logs = Array.isArray(data?.data) ? data.data : [];

  const summary = useMemo(() => {
    return data?.summary
      ? `Đã tích ${data.summary.totalEarned} điểm • Đã dùng ${data.summary.totalRedeemed} điểm`
      : 'Chưa có dữ liệu';
  }, [data?.summary]);

  return (
    <ScreenWrapper>
      <ScreenHeader title="Lịch sử tích điểm" subtitle="Điểm thưởng của bạn" showBack />
      <View style={{ padding: 16 }}>
        <View style={{ backgroundColor: Colors.glass, borderWidth: 0.5, borderColor: Colors.glassBorder, borderRadius: 16, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: Colors.textSecondary }}>{summary}</Text>
        </View>
        {historyQuery.isLoading ? (
          <Text style={{ color: Colors.textSecondary }}>Đang tải...</Text>
        ) : historyQuery.isError ? (
          <Text style={{ color: Colors.textSecondary }}>Không thể tải lịch sử</Text>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }) => (
              <View style={{ paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: Colors.glassBorder, backgroundColor: Colors.glass, borderRadius: 12, marginBottom: 8, paddingHorizontal: 12 }}>
                <Text style={{ color: Colors.text, fontWeight: '600' }}>{item.description}</Text>
                <Text style={{ color: Colors.textSecondary, marginTop: 2 }}>{formatDate(item.createdAt)}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: Colors.textSecondary }}>Chưa có lịch sử</Text>}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}
