import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Colors, TMDB_IMAGE_BASE } from '@/constants';
import type { Movie } from '@/constants/types';

export const MovieCard = ({ movie, onPress }: { movie: Movie; onPress?: () => void }) => {
  const poster = movie.posterUrl;
  return (
    <Pressable onPress={onPress} style={{ width: 140, marginRight: 12 }}>
      <Image
        source={{ uri: poster?.startsWith('http') ? poster : `${TMDB_IMAGE_BASE}${poster}` }}
        style={{ width: 140, height: 200, borderRadius: 12, backgroundColor: Colors.surface }}
        contentFit="cover"
      />
      <Text numberOfLines={2} style={{ color: Colors.text, marginTop: 8, fontWeight: '600' }}>
        {movie.title}
      </Text>
      <Text style={{ color: Colors.textSecondary, marginTop: 4 }}>⭐ {movie.rating?.toFixed?.(1) ?? movie.rating}</Text>
    </Pressable>
  );
};
