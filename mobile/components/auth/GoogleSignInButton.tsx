import { Pressable, Text, View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/constants';

const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

const GoogleLogo = () => (
  <View style={styles.logoSvg}>
    <Svg width="20" height="20" viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M23.49 12.275c0-.847-.076-1.663-.217-2.443H12v4.619h6.442c-.278 1.496-1.122 2.764-2.388 3.612v2.998h3.863c2.261-2.082 3.573-5.148 3.573-8.786z"
      />
      <Path
        fill="#34A853"
        d="M12 24c3.24 0 5.957-1.075 7.942-2.912l-3.863-2.998c-1.071.718-2.433 1.143-4.079 1.143-3.136 0-5.789-2.119-6.737-4.969H1.402v3.069C3.385 21.196 7.423 24 12 24z"
      />
      <Path
        fill="#FBBC05"
        d="M5.263 14.264c-.244-.718-.383-1.488-.383-2.264s.139-1.546.383-2.264V6.668H1.402A11.97 11.97 0 0 0 0 12c0 1.916.45 3.728 1.402 5.332l3.861-3.068z"
      />
      <Path
        fill="#EA4335"
        d="M12 4.773c1.761 0 3.344.605 4.587 1.791l3.439-3.439C17.937 1.191 15.236 0 12 0 7.423 0 3.385 2.804 1.402 6.668l3.861 3.069c.948-2.851 3.601-4.964 6.737-4.964z"
      />
    </Svg>
  </View>
);

export const GoogleSignInButton = ({
  onPress,
  label = 'Tiếp tục với Google',
}: {
  onPress: () => void;
  label?: string;
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonBase,
        { 
          backgroundColor: pressed ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
          opacity: 1
        }
      ]}
    >
      <View style={styles.buttonContent}>
        <GoogleLogo />
        <Text style={styles.buttonText} numberOfLines={1} ellipsizeMode="tail">
          {label}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  logoSvg: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
