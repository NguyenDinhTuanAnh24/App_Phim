import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/authStore';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { Colors } from '@/constants';
import { Image } from 'expo-image';

const TIER_COLORS: Record<string, string> = {
  'Đồng': '#CD7F32',
  'Bạc': '#C0C0C0',
  'Vàng': '#FFD700',
  'Kim cương': '#B9F2FF',
};

export default function ProfileScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const { linkGoogleAccount, signOutGoogle } = useGoogleAuth();
  const [editingName, setEditingName] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await userService.getProfile()).data,
  });

  const authProviders = useQuery({
    queryKey: ['auth', 'providers'],
    queryFn: async () => (await authService.getAuthProviders()).data,
  });

  const profile = profileQuery.data?.data;
  const provider = authProviders.data?.data;
  const isGoogleLinked = provider?.authProvider === 'GOOGLE' || provider?.authProvider === 'BOTH';
  const displayName = profile?.name || 'Người dùng';
  const tierColor = TIER_COLORS[profile?.loyaltyTier || 'Đồng'] || '#CD7F32';

  const menuItems = [
    { label: 'Chỉnh sửa thông tin', route: '/profile/edit', icon: 'user' as const },
    { label: 'Đổi điểm lấy Voucher', route: '/profile/redeem-points', icon: 'credit-card' as const },
    { label: 'Ưu đãi & Khuyến mãi', route: '/profile/promotions', icon: 'gift' as const },
    { label: 'Lịch sử tích điểm', route: '/profile/loyalty-history', icon: 'star' as const },
    { label: 'Hỗ trợ & Liên hệ', route: '/profile/support', icon: 'life-buoy' as const },
    { label: 'Đổi mật khẩu', route: '/profile/change-password', icon: 'lock' as const },
  ];

  const handleUpdateProfile = async (payload: { name?: string; phone?: string }) => {
    try {
      await userService.updateProfile(payload);
      profileQuery.refetch();
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật');
    }
  };

  if (profileQuery.isLoading) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Tài khoản" subtitle="Loyalty Dashboard" />
        <View style={S.center}>
          <Text style={{ color: Colors.textSecondary }}>Đang tải...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Tài khoản" subtitle="Loyalty Dashboard" />
        <View style={S.center}>
          <Text style={{ color: Colors.textSecondary }}>Không thể tải hồ sơ</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper edges={['top']}>
      <ScreenHeader title="Tài khoản" subtitle="Loyalty Dashboard" />
      <ScrollView
        style={S.scroll}
        contentContainerStyle={S.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <LinearGradient
          colors={['#1A1A1A', '#111']}
          style={S.userCard}
        >
          <View style={S.row}>
            <View style={[S.avatarWrap, { borderColor: tierColor }]}>
              {profile.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={S.avatar} />
              ) : (
                <Text style={S.avatarText}>
                  {displayName.trim().charAt(0).toUpperCase() || 'U'}
                </Text>
              )}
            </View>

            <View style={S.userInfo}>
              {editingName ? (
                <View style={S.row}>
                  <TextInput
                    value={profile.name}
                    autoFocus
                    onBlur={() => setEditingName(false)}
                    onChangeText={(text) => handleUpdateProfile({ name: text })}
                    style={[S.nameInput, { flex: 1 }]}
                  />
                </View>
              ) : (
                <Pressable onPress={() => setEditingName(true)} style={S.row}>
                  <Text style={S.userName}>Xin chào, {displayName}</Text>
                  <Feather name="edit-2" size={12} color={Colors.primary} style={{ marginLeft: 8 }} />
                </Pressable>
              )}

              {editingPhone ? (
                <View style={S.row}>
                  <TextInput
                    value={profile.phone || ''}
                    autoFocus
                    onBlur={() => setEditingPhone(false)}
                    onChangeText={(text) => handleUpdateProfile({ phone: text })}
                    style={[S.phoneInput, { flex: 1 }]}
                    keyboardType="phone-pad"
                  />
                </View>
              ) : (
                <Pressable onPress={() => setEditingPhone(true)} style={[S.row, { marginTop: 4 }]}>
                  <Text style={S.userPhone}>{profile.phone || 'Chưa cập nhật SĐT'}</Text>
                  <Feather name="edit-2" size={11} color={Colors.primary} style={{ marginLeft: 8 }} />
                </Pressable>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Loyalty Card */}
        <LinearGradient
          colors={[`${tierColor}22`, '#00000000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={S.loyaltyCard}
        >
          <View style={[S.row, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
            <View>
              <Text style={[S.tierTextLabel, { color: tierColor }]}>{profile.loyaltyTier?.toUpperCase() || 'DÒNG'} MEMBER</Text>
              <Text style={S.pointsVal}>{(profile.loyaltyPoints ?? 0).toLocaleString('vi-VN')} điểm</Text>
            </View>
            <View style={[S.tierBadge, { backgroundColor: `${tierColor}22`, borderColor: tierColor }]}>
              <Text style={[S.tierLabel, { color: tierColor }]}>
                Hạng {profile.loyaltyTier || 'Đồng'}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 20 }}>
            <View style={S.progressBg}>
              <View
                style={[
                  S.progressBar,
                  {
                    width: `${profile.progressToNext ?? 0}%`,
                    backgroundColor: Colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={S.progressText}>{profile.progressToNext ?? 0}% tiến độ hạng tiếp theo</Text>
          </View>
        </LinearGradient>

        {/* Menu Items Container */}
        <View style={S.menuContainer}>
          {menuItems.map((item, idx) => (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.route)}
              style={({ pressed }) => [
                S.menuItemPressable,
                pressed && { backgroundColor: 'rgba(255,255,255,0.05)' },
                idx < menuItems.length - 1 && S.borderBottom
              ]}
            >
              <View style={S.menuItemInner}>
                <View style={S.row}>
                  <View style={S.iconBox}>
                    <Feather name={item.icon} size={20} color={Colors.text} />
                  </View>
                  <Text style={S.menuLabel}>{item.label}</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#555" />
              </View>
            </Pressable>
          ))}

          {provider && (
            <Pressable
              disabled={isGoogleLinked}
              onPress={async () => {
                try {
                  await linkGoogleAccount();
                  authProviders.refetch();
                  Alert.alert('Thành công', 'Đã liên kết Google');
                } catch (error: any) {
                  Alert.alert('Lỗi', error.response?.data?.message || 'Không thể liên kết Google');
                }
              }}
              style={({ pressed }) => [
                S.menuItemPressable,
                !isGoogleLinked && pressed && { backgroundColor: 'rgba(255,255,255,0.05)' },
                { borderTopWidth: 1, borderTopColor: '#222' }
              ]}
            >
              <View style={S.menuItemInner}>
                <View style={S.row}>
                  <View style={S.iconBox}>
                    <Feather name="mail" size={20} color="#4285F4" />
                  </View>
                  <Text style={S.menuLabel}>Liên kết Google</Text>
                </View>
                {isGoogleLinked ? (
                  <View style={S.linkedBadge}>
                    <Text style={S.linkedBadgeText}>Đã liên kết</Text>
                  </View>
                ) : (
                  <Feather name="chevron-right" size={16} color="#555" />
                )}
              </View>
            </Pressable>
          )}
        </View>

        {/* Separate Section for Logout */}
        <View style={{ marginTop: 80 }}>
          <Pressable
            onPress={async () => {
              await signOutGoogle();
              await logout();
              router.replace('/(auth)/login');
            }}
            style={({ pressed }) => [S.logoutBtn, pressed && { opacity: 0.8 }]}
          >
            <View style={S.logoutBtnInner}>
              <Feather name="log-out" size={20} color="#FF4444" />
              <Text style={S.logoutText}>Đăng xuất tài khoản</Text>
            </View>
          </Pressable>
        </View>

        <View style={{ height: 150 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const S = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 110 },
  row: { flexDirection: 'row', alignItems: 'center' },
  userCard: {
    padding: 16,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  avatarWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: '800' },
  userInfo: { marginLeft: 16, flex: 1 },
  userName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  userPhone: { color: Colors.textSecondary, fontSize: 13 },
  nameInput: { color: '#fff', fontSize: 20, fontWeight: '800', borderBottomWidth: 1, borderBottomColor: Colors.primary, paddingVertical: 2 },
  phoneInput: { color: Colors.textSecondary, fontSize: 13, borderBottomWidth: 1, borderBottomColor: Colors.primary, paddingVertical: 2 },
  loyaltyCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tierTextLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  pointsVal: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 4 },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tierLabel: { fontSize: 11, fontWeight: '700' },
  progressBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 2 },
  progressText: { color: Colors.textSecondary, fontSize: 11, marginTop: 8 },
  menuContainer: {
    marginTop: 24,
    backgroundColor: '#121212',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  menuItemPressable: {
    width: '100%',
  },
  menuItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  borderBottom: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: { color: '#fff', fontSize: 15, fontWeight: '600' },
  linkedBadge: {
    backgroundColor: 'rgba(66,133,244,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(66,133,244,0.35)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  linkedBadgeText: {
    color: '#8AB4F8',
    fontSize: 11,
    fontWeight: '700',
  },
  logoutBtn: {
    paddingVertical: 14,
    backgroundColor: 'rgba(229,9,20,0.12)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(229,9,20,0.25)',
  },
  logoutBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoutText: { color: '#FF4444', fontSize: 15, fontWeight: '800', marginLeft: 12 },
});
