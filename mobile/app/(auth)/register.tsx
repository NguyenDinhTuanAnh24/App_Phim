import { useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Colors } from '@/constants';
import { authService } from '@/services/auth.service';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export default function RegisterScreen() {
  const router = useRouter();
  const { handleGoogleSignIn } = useGoogleAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!accepted) {
      Alert.alert('Thông báo', 'Vui lòng đồng ý với điều khoản');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Thông báo', 'Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      setLoading(true);
      await authService.register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        birthday: birthday ? birthday.toISOString().slice(0, 10) : undefined,
      });
      Alert.alert('Thành công', 'Vui lòng xác thực OTP gửi về email');
      router.replace({ pathname: '/(auth)/otp', params: { email: form.email.trim() } });
    } catch (error: any) {
      Alert.alert('Đăng ký thất bại', error.response?.data?.message || 'Vui lòng thử lại');
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
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
          style={styles.overlay}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.header}>
                <LinearGradient
                  colors={['rgba(176,0,32,0.35)', 'rgba(229,9,20,0.08)']}
                  style={styles.badge}
                >
                  <Text style={styles.badgeText}>MOVIE TICKET</Text>
                </LinearGradient>
                <Text style={styles.title}>Đăng ký</Text>
                <Text style={styles.subtitle}>Tạo tài khoản để đặt vé nhanh hơn</Text>
              </View>

              <View style={styles.card}>
                {[
                  { key: 'name', placeholder: 'Họ tên' },
                  { key: 'email', placeholder: 'Email', keyboardType: 'email-address' },
                  { key: 'phone', placeholder: 'Số điện thoại', keyboardType: 'phone-pad' },
                ].map((item) => (
                  <View key={item.key} style={styles.inputContainer}>
                    <TextInput
                      placeholder={item.placeholder}
                      placeholderTextColor={Colors.textSecondary}
                      value={(form as any)[item.key]}
                      onChangeText={(text) => setForm({ ...form, [item.key]: text })}
                      style={styles.input}
                      autoCapitalize="none"
                      keyboardType={item.keyboardType as any}
                    />
                  </View>
                ))}

                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Mật khẩu"
                    placeholderTextColor={Colors.textSecondary}
                    value={form.password}
                    onChangeText={(text) => setForm({ ...form, password: text })}
                    secureTextEntry
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Xác nhận mật khẩu"
                    placeholderTextColor={Colors.textSecondary}
                    value={form.confirmPassword}
                    onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
                    secureTextEntry
                    style={styles.input}
                  />
                </View>

                <Pressable
                  onPress={() => setShowPicker(true)}
                  style={styles.datePickerButton}
                >
                  <Text style={{ color: birthday ? Colors.text : Colors.textSecondary }}>
                    {birthday ? birthday.toISOString().slice(0, 10) : 'Ngày sinh (không bắt buộc)'}
                  </Text>
                </Pressable>

                {showPicker && (
                  <DateTimePicker
                    value={birthday || new Date()}
                    mode="date"
                    onChange={(_, date) => {
                      setShowPicker(false);
                      if (date) setBirthday(date);
                    }}
                  />
                )}

                <Pressable onPress={() => setAccepted(!accepted)} style={styles.checkboxContainer}>
                  <View style={[styles.checkbox, accepted && styles.checkboxActive]}>
                    {accepted && <View style={styles.checkboxInner} />}
                  </View>
                    <Text style={styles.checkboxLabel}>
                      Tôi đồng ý với{' '}
                      <Text onPress={() => router.push('/(auth)/terms')} style={{ color: Colors.primaryGradientEnd, fontWeight: 'bold' }}>
                        điều khoản sử dụng
                      </Text>
                    </Text>
                </Pressable>

                <LinearGradient
                  colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
                  style={styles.registerButtonGradient}
                >
                  <Pressable
                    onPress={handleRegister}
                    style={({ pressed }) => [
                      styles.registerButton,
                      pressed && { opacity: 0.9 }
                    ]}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={Colors.text} />
                    ) : (
                      <Text style={styles.registerButtonText}>ĐĂNG KÝ</Text>
                    )}
                  </Pressable>
                </LinearGradient>

                <Text style={styles.disclaimer}>
                  Bạn sẽ nhận mã OTP xác thực sau khi đăng ký thành công.
                </Text>
              </View>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>hoặc</Text>
                <View style={styles.dividerLine} />
              </View>

              <GoogleSignInButton onPress={handleGoogleSignIn} label="Đăng kí với Google" />

              <Link href="/(auth)/login" style={styles.loginLink}>
                <Text style={{ color: Colors.textSecondary }}>Đã có tài khoản? </Text>
                <Text style={{ color: Colors.primaryGradientEnd, fontWeight: 'bold' }}>Đăng nhập</Text>
              </Link>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 12,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  header: {
    marginBottom: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
    marginBottom: 8,
  },
  badgeText: {
    color: '#FFD9DD',
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  card: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: Colors.text,
    paddingHorizontal: 16,
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    fontSize: 15,
    textAlignVertical: 'center',
  },
  datePickerButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
    justifyContent: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  checkboxLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  registerButtonGradient: {
    borderRadius: 16,
    marginTop: 10,
    width: '100%',
  },
  registerButton: {
    minHeight: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: Colors.text,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontSize: 15,
    textAlign: 'center',
  },
  disclaimer: {
    color: Colors.textSecondary,
    marginTop: 14,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    opacity: 0.7,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: Colors.textSecondary,
    marginHorizontal: 12,
    fontSize: 13,
  },
  loginLink: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});
