import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants';

interface ScreenWrapperProps {
  children: ReactNode;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'admin';
}

export const ScreenWrapper = ({ children, edges = ['top'], style, variant = 'default' }: ScreenWrapperProps) => {
  const backgroundColor = variant === 'admin' ? Colors.admin.background : Colors.background;
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor }, style]}>
      {children}
    </SafeAreaView>
  );
};
