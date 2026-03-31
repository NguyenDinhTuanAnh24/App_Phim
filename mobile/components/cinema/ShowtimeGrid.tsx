import { Text, View } from 'react-native';
import { Colors } from '@/constants';
import type { ShowtimeSlot } from '@/constants/types';

export const ShowtimeGrid = ({
  groups,
  onSelect,
}: {
  groups: Array<{ period: string; slots: ShowtimeSlot[] }>;
  onSelect: (slot: ShowtimeSlot) => void;
}) => (
  <View>
    {groups.map((group) => (
      <View key={group.period} style={{ marginBottom: 12 }}>
        <Text style={{ color: Colors.text, fontWeight: '700', marginBottom: 8 }}>{group.period}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {group.slots.map((slot) => (
            <Text
              key={slot.id}
              onPress={() => onSelect(slot)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: Colors.surface,
                borderRadius: 10,
                color: Colors.text,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              {new Date(slot.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          ))}
        </View>
      </View>
    ))}
  </View>
);