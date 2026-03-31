import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Colors } from '@/constants';
import { authService } from '@/services/auth.service';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'EMAIL' | 'RESET'>('EMAIL');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const sendingOtpRef = useRef(false);

  const startResendCooldown = () => {
    setResendIn(10);
    const timer = setInterval(() => {
      setResendIn((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (sendingOtpRef.current || loading || resendIn > 0) {
      return;
    }
    if (!email.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập email.');
      return;
    }
    try {
      sendingOtpRef.current = true;
      setLoading(true);
      const response = await authService.forgotPassword(email.trim());
      Alert.alert('Đã gửi OTP', response.data?.message || 'Vui lòng kiểm tra email để lấy mã OTP.');
      setStep('RESET');
      startResendCooldown();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể gửi mã OTP.';
      if (typeof message === 'string' && message.includes('Vui lòng chờ')) {
        const ttlMatch = message.match(/(\d+)/);
        const ttl = ttlMatch ? Number(ttlMatch[1]) : 10;
        setStep('RESET');
        setResendIn(Number.isFinite(ttl) && ttl > 0 ? ttl : 10);
        Alert.alert('OTP đã được gửi', 'Mã OTP trước đó vẫn còn hiệu lực. Vui lòng kiểm tra email.');
      } else {
        Alert.alert('Gửi OTP thất bại', message);
      }
    } finally {
      sendingOtpRef.current = false;
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword || !confirmPassword) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ mã OTP và mật khẩu mới.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Không hợp lệ', 'Mật khẩu nhập lại không khớp.');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
        confirmPassword,
      });
      Alert.alert(
        'Thành công',
        response.data?.message || 'Đặt lại mật khẩu thành công.',
        [{ text: 'Đăng nhập', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      Alert.alert('Không thể đặt lại mật khẩu', error?.response?.data?.message || 'Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop' }}
        style={styles.background}
        blurRadius={3}
      >
        <LinearGradient colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']} style={styles.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
              <View style={styles.header}>
                <Text style={styles.title}>Quên mật khẩu</Text>
                <Text style={styles.subtitle}>
                  {step === 'EMAIL'
                    ? 'Nhập email để nhận mã OTP đặt lại mật khẩu'
                    : 'Nhập OTP và mật khẩu mới để xác nhận'}
                </Text>
              </View>

              <View style={styles.card}>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor={Colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={step === 'EMAIL' && !loading}
                    style={styles.input}
                  />
                </View>

                {step === 'RESET' && (
                  <>
                    <View style={styles.inputContainer}>
                      <TextInput
                        placeholder="Mã OTP (6 số)"
                        placeholderTextColor={Colors.textSecondary}
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        style={styles.input}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <TextInput
                        placeholder="Mật khẩu mới"
                        placeholderTextColor={Colors.textSecondary}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        style={styles.input}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <TextInput
                        placeholder="Nhập lại mật khẩu mới"
                        placeholderTextColor={Colors.textSecondary}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        style={styles.input}
                      />
                    </View>
                  </>
                )}

                <LinearGradient colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]} style={styles.actionButtonGradient}>
                  <Pressable
                    onPress={step === 'EMAIL' ? handleSendOtp : handleResetPassword}
                    disabled={loading}
                    style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.9 }]}
                  >
                    {loading ? (
                      <ActivityIndicator color={Colors.text} />
                    ) : (
                      <Text style={styles.actionButtonText}>
                        {step === 'EMAIL' ? 'GỬI OTP' : 'XÁC NHẬN MẬT KHẨU MỚI'}
                      </Text>
                    )}
                  </Pressable>
                </LinearGradient>

                {step === 'RESET' && (
                  <Pressable onPress={handleSendOtp} disabled={loading || resendIn > 0}>
                    <Text style={styles.secondaryAction}>
                      {resendIn > 0 ? `Gửi lại OTP sau ${resendIn}s` : 'Gửi lại OTP'}
                    </Text>
                  </Pressable>
                )}

                <Pressable onPress={() => router.replace('/(auth)/login')}>
                  <Text style={styles.secondaryAction}>Quay lại đăng nhập</Text>
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%' },
  overlay: { flex: 1, paddingHorizontal: 12 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 32 },
  header: { marginBottom: 24 },
  title: { color: Colors.text, fontSize: 28, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  inputContainer: { marginBottom: 12 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: Colors.text,
    paddingHorizontal: 16,
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    fontSize: 15,
  },
  actionButtonGradient: { borderRadius: 16, marginTop: 8 },
  actionButton: {
    minHeight: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: { color: Colors.text, fontWeight: '800', letterSpacing: 1, fontSize: 14, textAlign: 'center' },
  secondaryAction: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 14,
    fontSize: 13,
  },
});

