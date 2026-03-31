import { useMemo } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/constants';
import { pointsService } from '@/services/points.service';
import { userService } from '@/services/user.service';
import { formatCurrency } from '@/constants/format';
import { formatDate } from '@/constants/date';

export default function RedeemPointsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await userService.getProfile()).data,
  });

  const packagesQuery = useQuery({
    queryKey: ['points', 'packages'],
    queryFn: async () => (await pointsService.getPackages()).data,
  });

  const myVouchersQuery = useQuery({
    queryKey: ['points', 'my-vouchers'],
    queryFn: async () => (await pointsService.getMyVouchers()).data,
  });

  const redeemMutation = useMutation({
    mutationFn: async (packageId: string) => pointsService.redeemPoints(packageId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.invalidateQueries({ queryKey: ['points', 'my-vouchers'] });
      Alert.alert('✅', 'Đổi điểm thành công! Voucher đã được thêm vào tài khoản.');
      router.push('/profile/promotions');
    },
  });

  const packages = Array.isArray(packagesQuery.data?.data) ? packagesQuery.data.data : [];
  const myVouchers = Array.isArray(myVouchersQuery.data?.data) ? myVouchersQuery.data.data : [];
  const points = profileQuery.data?.data?.loyaltyPoints ?? 0;
  const tier = profileQuery.data?.data?.loyaltyTier ?? 'Đồng';

  const renderPackages = () => {
    if (packagesQuery.isLoading) {
      return <Text style={{ color: Colors.textSecondary, marginHorizontal: 16 }}>Đang tải...</Text>;
    }
    if (packagesQuery.isError) {
      return <Text style={{ color: Colors.textSecondary, marginHorizontal: 16 }}>Không thể tải gói đổi điểm</Text>;
    }
    if (packages.length === 0) {
      return <Text style={{ color: Colors.textSecondary, marginHorizontal: 16 }}>Chưa có gói đổi điểm</Text>;
    }
    return (
      <FlatList
        data={packages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const pointsRequired = item.pointsCost ?? item.pointsRequired ?? 0;
          const canRedeem = item.canRedeem ?? points >= pointsRequired;
          const pointsShort = item.pointsShort ?? Math.max(0, pointsRequired - points);
          const discountValue = item.voucherValue ?? item.discountValue ?? 0;

          return (
            <View style={{ backgroundColor: Colors.glass, marginHorizontal: 16, marginBottom: 12, padding: 12, borderRadius: 14, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
              <Text style={{ color: Colors.text, fontWeight: '700' }}>{item.icon ?? '��️'} {item.description}</Text>
              <Text style={{ color: Colors.textSecondary, marginTop: 4 }}>Chi phí: {pointsRequired} điểm</Text>
              <Text style={{ color: Colors.textSecondary, marginTop: 4 }}>Đơn từ {formatCurrency(item.minAmount ?? 0)}</Text>
              <Text style={{ color: Colors.textSecondary, marginTop: 4 }}>HSD: {item.validityDays ?? 30} ngày sau khi đổi</Text>
              <LinearGradient
                colors={canRedeem ? [Colors.primaryGradientStart, Colors.primaryGradientEnd] : [Colors.surfaceLight, Colors.surfaceLight]}
                style={{ borderRadius: 10, marginTop: 12 }}
              >
                <Pressable
                  disabled={!canRedeem}
                  onPress={() =>
                    Alert.alert(
                      'Xác nhận',
                      `Dùng ${pointsRequired} điểm để đổi voucher ${formatCurrency(discountValue)}?`,
                      [
                        { text: 'Huỷ', style: 'cancel' },
                        { text: 'Xác nhận', onPress: () => redeemMutation.mutate(item.id) },
                      ]
                    )
                  }
                  style={{
                    padding: 10,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: Colors.text, fontWeight: '700' }}>
                    {canRedeem ? `ĐỔI NGAY - ${pointsRequired} điểm` : `Cần thêm ${pointsShort} điểm`}
                  </Text>
                </Pressable>
              </LinearGradient>
            </View>
          );
        }}
      />
    );
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title="Đổi điểm lấy Voucher" subtitle="Rewards Exchange" showBack />
      <FlatList
        ListHeaderComponent={
          <View style={{ padding: 16 }}>
            <Text style={{ color: Colors.text, fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Đổi điểm lấy Voucher</Text>
            <View style={{ backgroundColor: Colors.glass, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
              <Text style={{ color: Colors.textSecondary }}>Điểm hiện có</Text>
              <Text style={{ color: Colors.text, fontSize: 24, fontWeight: '700', marginTop: 8 }}>{points} điểm</Text>
              <Text style={{ color: Colors.primaryGradientEnd, marginTop: 4 }}>{tier}</Text>
            </View>
            <Text style={{ color: Colors.text, fontWeight: '700', marginBottom: 8 }}>Gói đổi điểm</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        data={[]}
        renderItem={null}
        ListFooterComponent={
          <View style={{ paddingBottom: 24 }}>
            {renderPackages()}
            <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
              <Text style={{ color: Colors.text, fontWeight: '700', marginBottom: 8 }}>Voucher đã đổi</Text>
              {myVouchersQuery.isLoading ? (
                <Text style={{ color: Colors.textSecondary }}>Đang tải voucher...</Text>
              ) : myVouchersQuery.isError ? (
                <Text style={{ color: Colors.textSecondary }}>Không thể tải voucher đổi điểm</Text>
              ) : (
                <FlatList
                  data={myVouchers}
                  keyExtractor={(item) => item.code}
                  renderItem={({ item }) => (
                    <View style={{ backgroundColor: Colors.glass, padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
                      <Text style={{ color: Colors.text, fontWeight: '700' }}>{item.code}</Text>
                      <Text style={{ color: Colors.textSecondary, marginTop: 4 }}>Hạn dùng: {formatDate(item.expiresAt)}</Text>
                      <Text style={{ color: Colors.textSecondary, marginTop: 4 }}>
                        Trạng thái: {item.isUsed ? 'Đã dùng' : 'Chưa dùng'}
                      </Text>
                    </View>
                  )}
                  ListEmptyComponent={<Text style={{ color: Colors.textSecondary }}>Chưa có voucher đổi điểm</Text>}
                />
              )}
            </View>
          </View>
        }
      />
    </ScreenWrapper>
  );
}
