import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '@/constants/types';
import { TMDB_IMAGE_BASE, Colors } from '@/constants';

interface SearchAutocompleteProps {
  suggestions: Movie[];
  isLoading?: boolean;
  onSelectSuggestion: (movie: Movie) => void;
  visible?: boolean;
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  suggestions,
  isLoading,
  onSelectSuggestion,
  visible = true,
}) => {
  if (!visible || (!isLoading && suggestions.length === 0)) {
    return null;
  }

  const buildImageUri = (path?: string | null) => {
    if (!path) return undefined;
    return path.startsWith('http') ? path : `${TMDB_IMAGE_BASE}${path}`;
  };

  return (
    <View style={S.container}>
      {isLoading ? (
        <View style={S.loadingBox}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={S.loadingText}>Đang tìm kiếm phim...</Text>
        </View>
      ) : (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const pUrl = (item as any).posterUrl || (item as any).poster_url;
            const movieRating = item.rating || (item as any).vote_average || 0;
            
            return (
              <TouchableOpacity
                style={S.suggestionItem}
                onPress={() => onSelectSuggestion(item)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: buildImageUri(pUrl) }}
                  style={S.poster}
                  contentFit="cover"
                />
                <View style={S.info}>
                  <Text style={S.title} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={S.meta}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={S.ratingText}>{Number(movieRating).toFixed(1)}</Text>
                    <View style={S.dot} />
                    <Text style={S.statusText}>
                      {item.status === 'NOW_SHOWING' ? 'Đang chiếu' : 'Sắp chiếu'}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#444" />
              </TouchableOpacity>
            );
          }}
          style={S.list}
          scrollEnabled={true}
          nestedScrollEnabled={true}
        />
      )}
    </View>
  );
};

const S = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginTop: 8,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 1000,
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
  },
  loadingBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#888',
    marginTop: 10,
    fontSize: 13,
    fontWeight: '500',
  },
  list: {
    paddingVertical: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  poster: {
    width: 40,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#444',
    marginHorizontal: 8,
  },
  statusText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  }
});
