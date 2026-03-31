import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants';

type Variant = 'default' | 'admin';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  variant?: Variant;
}

export const ScreenHeader = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  right,
  variant = 'default',
}: ScreenHeaderProps) => {
  const router = useRouter();
  const palette =
    variant === 'admin'
      ? {
          background: Colors.admin.background,
          text: Colors.admin.text,
          textSecondary: Colors.admin.textSecondary,
          primary: Colors.admin.primary,
        }
      : {
          background: Colors.background,
          text: Colors.text,
          textSecondary: Colors.textSecondary,
          primary: Colors.primary,
        };

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, backgroundColor: palette.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {showBack && (
          <Pressable
            onPress={onBack ?? (() => router.back())}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              marginRight: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: variant === 'admin' ? 'rgba(255,255,255,0.08)' : Colors.glass,
              borderWidth: 0.5,
              borderColor: variant === 'admin' ? 'rgba(255,255,255,0.15)' : Colors.glassBorder,
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="chevron-left" size={20} color={palette.text} />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ color: palette.text, fontSize: 20, fontWeight: '700' }}>{title}</Text>
          {subtitle ? (
            <Text style={{ color: palette.textSecondary, marginTop: 4 }}>{subtitle}</Text>
          ) : null}
        </View>
        {right ? <View style={{ marginLeft: 8 }}>{right}</View> : null}
      </View>
    </View>
  );
};
