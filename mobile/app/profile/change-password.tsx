import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/constants';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/stores/authStore';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleSubmit = async () => {
    if (form.newPassword !== form.confirmPassword) {
      Alert.alert('Thông báo', 'Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      await userService.changePassword(form);
      Alert.alert('Thành công', 'Vui lòng đăng nhập lại');
      await logout();
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể đổi mật khẩu');
    }
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title="Đổi mật khẩu" subtitle="Bảo mật tài khoản" showBack />
      <View style={{ padding: 16 }}>
        <View style={{ backgroundColor: Colors.glass, borderRadius: 20, padding: 14, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
        {[
          { key: 'currentPassword', placeholder: 'Mật khẩu hiện tại' },
          { key: 'newPassword', placeholder: 'Mật khẩu mới' },
          { key: 'confirmPassword', placeholder: 'Xác nhận mật khẩu mới' },
        ].map((item) => (
          <TextInput
            key={item.key}
            placeholder={item.placeholder}
            placeholderTextColor={Colors.textSecondary}
            value={form[item.key as keyof typeof form]}
            onChangeText={(text) => setForm({ ...form, [item.key]: text })}
            secureTextEntry
            style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: Colors.text, padding: 12, borderRadius: 14, marginBottom: 12, borderWidth: 0.5, borderColor: Colors.glassBorder }}
          />
        ))}
        </View>
        <LinearGradient colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]} style={{ borderRadius: 14, marginTop: 16 }}>
          <Pressable
            onPress={handleSubmit}
            style={{ padding: 14, alignItems: 'center' }}
          >
            <Text style={{ color: Colors.text, fontWeight: '700' }}>Xác nhận</Text>
          </Pressable>
        </LinearGradient>
      </View>
    </ScreenWrapper>
  );
}
