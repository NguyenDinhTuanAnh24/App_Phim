import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants';

export const LoyaltyCard = ({
  points,
  tier,
  progress,
}: {
  points: number;
  tier: string;
  progress: number;
}) => {
  const tierGradients: Record<string, [string, string, ...string[]]> = {
    'Đồng': ['#8B5A2B', '#CD7F32'],
    'Bạc': ['#8F97A3', '#D2D8E0'],
    'Vàng': ['#A87400', '#FFD45B'],
    'Kim cương': ['#4D7088', '#B9F2FF'],
  };

  const colors = tierGradients[tier] ?? tierGradients['Đồng'];

  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 18, padding: 1 }}>
      <View
        style={{
          backgroundColor: 'rgba(10,10,10,0.72)',
          borderRadius: 17,
          padding: 16,
          borderWidth: 0.5,
          borderColor: Colors.glassBorder,
        }}
      >
        <Text style={{ color: '#D1D5DB', letterSpacing: 0.5 }}>Điểm hiện có</Text>
        <Text style={{ color: Colors.text, fontSize: 30, fontWeight: '800', marginVertical: 8 }}>
          {points.toLocaleString('vi-VN')}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: colors[1], fontWeight: '800', marginRight: 8 }}>{tier}</Text>
          <View style={{ flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 8 }}>
            <View
              style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: colors[1],
                borderRadius: 8,
              }}
            />
          </View>
        </View>

        <Text style={{ color: '#D1D5DB' }}>Tiến độ lên hạng {progress}%</Text>
      </View>
    </LinearGradient>
  );
};
