import { useEffect, useRef, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/constants';
import { authService } from '@/services/auth.service';

export default function OtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [value, setValue] = useState('');
  const inputs = useRef<TextInput[]>([]);
  const [remaining, setRemaining] = useState(60);

  useEffect(() => {
    if (value.length === 6) {
      (async () => {
        try {
          await authService.verifyOtp(email ?? '', value);
          Alert.alert('Thành công', 'Xác thực thành công');
          router.replace('/(auth)/login');
        } catch (error: any) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert('OTP sai', error.response?.data?.message || 'Vui lòng thử lại');
          setValue('');
          inputs.current[0]?.focus();
        }
      })();
    }
  }, [email, router, value]);

  useEffect(() => {
    const timer = setInterval(() => setRemaining((prev) => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const resendOtp = async () => {
    if (!email) return;
    try {
      await authService.sendOtp(email);
      setRemaining(60);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể gửi lại OTP');
    }
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title="Xác thực OTP" showBack />
      <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
        <Text style={{ color: Colors.text, fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Nhập OTP</Text>
        <Text style={{ color: Colors.textSecondary, marginBottom: 24 }}>
          Vui lòng nhập mã 6 số đã gửi về email {email}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <TextInput
              key={index}
              ref={(el) => {
                if (el) inputs.current[index] = el;
              }}
              value={value[index] ?? ''}
              onChangeText={(text) => {
                const next = value.substring(0, index) + text + value.substring(index + 1);
                setValue(next);
                if (text && index < 5) {
                  inputs.current[index + 1]?.focus();
                }
              }}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
                  inputs.current[index - 1]?.focus();
                }
              }}
              keyboardType="number-pad"
              maxLength={1}
              style={{
                width: 44,
                height: 52,
                backgroundColor: Colors.surface,
                borderRadius: 10,
                textAlign: 'center',
                color: Colors.text,
                fontSize: 18,
              }}
            />
          ))}
        </View>
        <Text style={{ color: Colors.textSecondary, textAlign: 'center', marginTop: 16 }}>
          {remaining > 0 ? `Gửi lại sau ${remaining}s` : 'Bạn chưa nhận được mã?'}
        </Text>
        {remaining === 0 && (
          <Text onPress={resendOtp} style={{ color: Colors.primary, textAlign: 'center', marginTop: 8 }}>
            Gửi lại OTP
          </Text>
        )}
      </View>
    </ScreenWrapper>
  );
}
