import { Pressable, ScrollView, Text, View } from 'react-native';
import dayjs from 'dayjs';
import { Colors } from '@/constants';

export const DatePicker = ({
  value,
  onChange,
}: {
  value: Date;
  onChange: (date: Date) => void;
}) => {
  const dates = Array.from({ length: 7 }, (_, i) => dayjs().add(i, 'day'));

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
      {dates.map((date, index) => {
        const isActive = date.isSame(dayjs(value), 'day');
        return (
          <Pressable
            key={date.toString()}
            onPress={() => onChange(date.toDate())}
            style={{
              backgroundColor: isActive ? Colors.primary : Colors.surface,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 16,
              marginRight: 10,
            }}
          >
            <Text style={{ color: Colors.text, fontWeight: '700' }}>
              {index === 0 ? 'Hôm nay' : date.format('DD/MM')}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};