import { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { Movie } from '@/constants/types';
import { Colors, TMDB_IMAGE_BASE } from '@/constants';

const { width } = Dimensions.get('window');

export const BannerCarousel = ({ movies, onPress }: { movies: Movie[]; onPress: (movie: Movie) => void }) => {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!movies.length) return;
    const timer = setInterval(() => {
      const next = (activeIndex + 1) % movies.length;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setActiveIndex(next);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeIndex, movies.length]);

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
      >
        {movies.map((movie) => (
          <Pressable key={movie.id} onPress={() => onPress(movie)}>
            <Image
              source={{
                uri: movie.backdropUrl?.startsWith('http')
                  ? movie.backdropUrl
                  : `${TMDB_IMAGE_BASE}${movie.backdropUrl}`,
              }}
              style={{ width, height: 220 }}
              contentFit="cover"
            />
              <LinearGradient
                colors={[Colors.overlayLight, Colors.overlayDark]}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 }}
              />
              <View style={{ position: 'absolute', bottom: 20, left: 16 }}>
                <Text style={{ color: Colors.text, fontSize: 20, fontWeight: '700' }}>{movie.title}</Text>
                <Text style={{ color: Colors.textSecondary }}>⭐ {movie.rating?.toFixed?.(1) ?? movie.rating}</Text>
              </View>
          </Pressable>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
        {movies.map((_, index) => (
          <View
            key={`dot-${index}`}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              marginHorizontal: 4,
              backgroundColor: index === activeIndex ? Colors.primary : Colors.surfaceLight,
            }}
          />
        ))}
      </View>
    </View>
  );
};
