import { Pressable, ScrollView, Text } from 'react-native';
import { Colors } from '@/constants';

export const GenreFilter = ({
  genres,
  active,
  onSelect,
}: {
  genres: string[];
  active?: string;
  onSelect: (genre: string | null) => void;
}) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
    <Pressable
      onPress={() => onSelect(null)}
      style={{
        backgroundColor: !active ? Colors.primary : Colors.surface,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
      }}
    >
      <Text style={{ color: Colors.text }}>Tất cả</Text>
    </Pressable>
    {genres.map((genre) => (
      <Pressable
        key={genre}
        onPress={() => onSelect(genre)}
        style={{
          backgroundColor: active === genre ? Colors.primary : Colors.surface,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 20,
          marginRight: 8,
        }}
      >
        <Text style={{ color: Colors.text }}>{genre}</Text>
      </Pressable>
    ))}
  </ScrollView>
);