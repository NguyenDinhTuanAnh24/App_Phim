import { useCallback } from 'react';
import { Alert } from 'react-native';
import Constants from 'expo-constants';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/authStore';

export const useGoogleAuth = () => {
  const login = useAuthStore((state) => state.login);
  const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

  const getGoogleSignin = () => {
    // Lazy require to avoid TurboModule error in Expo Go.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('@react-native-google-signin/google-signin').GoogleSignin as typeof import('@react-native-google-signin/google-signin').GoogleSignin;
  };

  const handleGoogleSignIn = useCallback(async () => {
    if (isExpoGo) {
      Alert.alert('Google Sign In', 'Vui lòng dùng bản build native (expo run:android) để đăng nhập Google.');
      return;
    }
    const GoogleSignin = getGoogleSignin();
    await GoogleSignin.hasPlayServices();
    await GoogleSignin.signOut().catch(() => {});
    const signInResponse = await GoogleSignin.signIn();
    const idToken = signInResponse?.data?.idToken ?? null;

    if (!idToken) {
      throw new Error('Missing Google ID token');
    }

    const response = await authService.googleSignIn(idToken);
    const payload = response.data.data;
    await login(payload);
    if (payload?.birthdayReward?.granted) {
      Alert.alert(
        'Quà sinh nhật',
        `Bạn vừa nhận ${payload.birthdayReward.points} điểm sinh nhật. Chúc mừng sinh nhật!`
      );
    }
  }, [isExpoGo, login]);

  const linkGoogleAccount = useCallback(async () => {
    if (isExpoGo) {
      Alert.alert('Google Sign In', 'Vui lòng dùng bản build native để liên kết Google.');
      return;
    }
    const GoogleSignin = getGoogleSignin();
    await GoogleSignin.hasPlayServices();
    await GoogleSignin.signOut().catch(() => {});
    const signInResponse = await GoogleSignin.signIn();
    const idToken = signInResponse?.data?.idToken ?? null;

    if (!idToken) {
      throw new Error('Missing Google ID token');
    }

    await authService.linkGoogle(idToken);
  }, [isExpoGo]);

  const signOutGoogle = useCallback(async () => {
    if (isExpoGo) return;
    const GoogleSignin = getGoogleSignin();
    await GoogleSignin.signOut();
  }, [isExpoGo]);

  return {
    handleGoogleSignIn,
    linkGoogleAccount,
    signOutGoogle,
  };
};
