import Constants from 'expo-constants';

export const configureGoogleSignIn = () => {
  if (Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient') {
    return;
  }

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

  if (!webClientId) {
    console.warn('[GOOGLE] Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID. Google Sign-In will fail.');
  }

  // Lazy require to avoid TurboModule error in Expo Go.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { GoogleSignin } = require('@react-native-google-signin/google-signin');
  GoogleSignin.configure({
    webClientId: webClientId || '',
    iosClientId,
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
};
