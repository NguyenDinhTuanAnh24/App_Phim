import { useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Colors } from '@/constants';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/authStore';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const { handleGoogleSignIn } = useGoogleAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await authService.login(email.trim(), password);
      const payload = response.data.data;
      await login(payload);
      if (payload?.birthdayReward?.granted) {
        Alert.alert(
          'Quà sinh nhật',
          `Bạn vừa nhận ${payload.birthdayReward.points} điểm sinh nhật. Chúc mừng sinh nhật!`
        );
      }
    } catch (error: any) {
      Alert.alert('Đăng nhập thất bại', error.response?.data?.message || 'Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop' }} // Fallback if local image not ready
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
                <Text style={styles.title}>Đăng nhập</Text>
                <Text style={styles.subtitle}>Sẵn sàng cho những bộ phim bom tấn?</Text>
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
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Mật khẩu"
                    placeholderTextColor={Colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                  />
                </View>

                <LinearGradient
                  colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
                  style={styles.loginButtonGradient}
                >
                  <Pressable
                    onPress={handleSubmit}
                    style={({ pressed }) => [
                      styles.loginButton,
                      pressed && { opacity: 0.9 }
                    ]}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={Colors.text} />
                    ) : (
                      <Text style={styles.loginButtonText}>ĐĂNG NHẬP</Text>
                    )}
                  </Pressable>
                </LinearGradient>

                <Link href="/(auth)/forgot-password" style={styles.forgotPasswordLink}>
                  <Text style={{ color: Colors.primaryGradientEnd, fontWeight: '600' }}>Quên mật khẩu?</Text>
                </Link>

                <Text style={styles.disclaimer}>
                  Bằng việc đăng nhập, bạn đồng ý với chính sách bảo mật của hệ thống.
                </Text>
              </View>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>hoặc</Text>
                <View style={styles.dividerLine} />
              </View>

              <GoogleSignInButton onPress={handleGoogleSignIn} label="Đăng nhập với Google" />

              <Link href="/(auth)/register" style={styles.registerLink}>
                <Text style={{ color: Colors.textSecondary }}>Chưa có tài khoản? </Text>
                <Text style={{ color: Colors.primaryGradientEnd, fontWeight: 'bold' }}>Đăng ký</Text>
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
    marginBottom: 24,
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
    marginBottom: 12,
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
  loginButtonGradient: {
    borderRadius: 16,
    marginTop: 10,
    width: '100%',
  },
  loginButton: {
    minHeight: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: Colors.text,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontSize: 16,
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
  forgotPasswordLink: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
    fontSize: 13,
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
  registerLink: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});

