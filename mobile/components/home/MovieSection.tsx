import { FlatList, Text, View } from 'react-native';
import type { Movie } from '@/constants/types';
import { Colors } from '@/constants';
import { MovieCard } from './MovieCard';

export const MovieSection = ({
  title,
  movies,
  onPress,
}: {
  title: string;
  movies: Movie[];
  onPress: (movie: Movie) => void;
}) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={{ color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>{title}</Text>
    <FlatList
      data={movies}
      renderItem={({ item }) => <MovieCard movie={item} onPress={() => onPress(item)} />}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
    />
  </View>
);