import { useQuery } from '@tanstack/react-query';
import { FlatList, Pressable, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/constants';
import { voucherService } from '@/services/voucher.service';

export default function PromotionsScreen() {
  const vouchersQuery = useQuery({
    queryKey: ['vouchers'],
    queryFn: async () => (await voucherService.getAvailableVouchers()).data,
  });

  const vouchers = Array.isArray(vouchersQuery.data?.data) ? vouchersQuery.data.data : [];

  return (
    <ScreenWrapper>
      <ScreenHeader title="Ưu đãi & Khuyến mãi" subtitle="Voucher dành cho bạn" showBack />
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        data={vouchers}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: Colors.glass, padding: 14, borderRadius: 16, marginBottom: 12, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
            <Text style={{ color: Colors.text, fontWeight: '700', fontSize: 16 }}>{item.code}</Text>
            <Text style={{ color: Colors.textSecondary, marginTop: 4 }}>{item.description}</Text>
            <LinearGradient colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]} style={{ borderRadius: 10, marginTop: 10, alignSelf: 'flex-start' }}>
              <Pressable
                onPress={() => Clipboard.setStringAsync(item.code)}
                style={{ paddingHorizontal: 12, paddingVertical: 8 }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Copy mã</Text>
              </Pressable>
            </LinearGradient>
          </View>
        )}
        ListEmptyComponent={
          vouchersQuery.isLoading ? (
            <Text style={{ color: Colors.textSecondary }}>Đang tải...</Text>
          ) : vouchersQuery.isError ? (
            <Text style={{ color: Colors.textSecondary }}>Không thể tải voucher</Text>
          ) : (
            <Text style={{ color: Colors.textSecondary }}>Không có voucher</Text>
          )
        }
      />
    </ScreenWrapper>
  );
}
