import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { FoodCombo } from '@/constants/types';
import { Colors } from '@/constants';
import { formatCurrency } from '@/constants/format';

export const FoodComboCard = ({
  combo,
  quantity,
  onAdd,
  onRemove,
}: {
  combo: FoodCombo;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) => (
  <View
    style={{
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
    }}
  >
    <Image source={{ uri: combo.imageUrl }} style={{ width: 64, height: 64, borderRadius: 12 }} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={{ color: Colors.text, fontWeight: '700' }}>{combo.name}</Text>
      <Text style={{ color: Colors.textSecondary, marginTop: 4 }}>{formatCurrency(combo.price)}</Text>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Pressable onPress={onRemove} style={{ padding: 6 }}>
        <Text style={{ color: Colors.textSecondary, fontSize: 18 }}>-</Text>
      </Pressable>
      <Text style={{ color: Colors.text, width: 24, textAlign: 'center' }}>{quantity}</Text>
      <Pressable onPress={onAdd} style={{ padding: 6 }}>
        <Text style={{ color: Colors.primary, fontSize: 18 }}>+</Text>
      </Pressable>
    </View>
  </View>
);
