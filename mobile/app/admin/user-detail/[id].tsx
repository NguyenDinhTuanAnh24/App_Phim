import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { adminService } from '@/services/admin.service';
import { Colors } from '@/constants';
import { formatDate } from '@/constants/date';

export default function AdminUserDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reason, setReason] = useState('');

  const userQuery = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: async () => (await adminService.getUserDetail(id as string)).data,
  });

  const user = userQuery.data?.data ?? userQuery.data;

  const banMutation = useMutation({
    mutationFn: async () => adminService.banUser(id as string, reason),
    onSuccess: () => userQuery.refetch(),
  });

  const handleBan = () => {
    Alert.alert('Xác nhận', 'Ban tài khoản này?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Đồng ý', onPress: () => banMutation.mutate() },
    ]);
  };

  return (
    <ScreenWrapper variant="admin">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <ScreenHeader title="Chi tiết người dùng" showBack variant="admin" />
        <View style={{ padding: 16 }}>
          {userQuery.isLoading ? (
            <Text style={{ color: Colors.admin.textSecondary }}>Đang tải...</Text>
          ) : userQuery.isError || !user ? (
            <Pressable onPress={() => userQuery.refetch()}>
              <Text style={{ color: Colors.admin.primary }}>Không thể tải. Thử lại</Text>
            </Pressable>
          ) : (
            <>
              <Text style={{ color: Colors.admin.text, fontSize: 20, fontWeight: '700' }}>{user.name}</Text>
              <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>{user.email}</Text>
              <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>{user.phone}</Text>
              <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>
                Tham gia: {formatDate(user.createdAt ?? user.created_at)}
              </Text>

              <View style={{ marginTop: 16, backgroundColor: Colors.admin.surface, padding: 12, borderRadius: 16, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
                <Text style={{ color: Colors.admin.text }}>Điểm thành viên</Text>
                <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>
                  {user.loyaltyTier ?? user.loyalty_tier} • {user.loyaltyPoints ?? user.loyalty_points} điểm
                </Text>
              </View>

              <TextInput
                placeholder="Lý do ban"
                placeholderTextColor={Colors.admin.textSecondary}
                value={reason}
                onChangeText={setReason}
                style={{ backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 12, borderWidth: 0.5, borderColor: Colors.glassBorder }}
              />
              <Pressable
                onPress={handleBan}
                style={{ marginTop: 12, backgroundColor: '#EF4444', padding: 12, borderRadius: 16, alignItems: 'center' }}
              >
                <Text style={{ color: Colors.admin.text, fontWeight: '700' }}>Ban tài khoản</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
