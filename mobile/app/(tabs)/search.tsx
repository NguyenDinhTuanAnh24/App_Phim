import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  FlatList, 
  Text, 
  TextInput, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Keyboard
} from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Colors, TMDB_IMAGE_BASE } from '@/constants';
import { movieService } from '@/services/movie.service';
import type { Movie } from '@/constants/types';
import { SearchAutocomplete, SearchHistory, SearchFiltersModal, SearchFilters } from '@/components/search';
import { searchHistoryService, SearchHistoryItem } from '@/services/storage/search-history';
// @ts-ignore
import { debounce } from 'lodash';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const CARD_WIDTH = (SCREEN_WIDTH - 48) / COLUMN_COUNT;

const SUGGESTED_GENRES = ['Hành động', 'Kinh dị', 'Hoạt hình', 'Marvel', 'Hài hước', 'Tình cảm'];

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    const history = await searchHistoryService.getHistory();
    setSearchHistory(history);
  };

  // Debounce cho autocomplete (200ms - nhanh hơn)
  const debouncedSetAutocomplete = useCallback(
    debounce((text: string) => {
      if (text.length >= 2) {
        setShowAutocomplete(true);
      }
    }, 200),
    []
  );

  // Debounce cho search (400ms)
  const debouncedSetQuery = useCallback(
    debounce((text: string) => setDebouncedQuery(text), 400),
    []
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    debouncedSetQuery(text);
    debouncedSetAutocomplete(text);
    if (text.length < 2) {
      setShowAutocomplete(false);
    }
  };

  const handleSearchSubmit = async () => {
    if (debouncedQuery.length >= 2) {
      // Save to history
      await searchHistoryService.addToHistory(debouncedQuery, filters);
      loadSearchHistory();
      setShowAutocomplete(false);
      Keyboard.dismiss();
    }
  };

  const selectSuggested = (tag: string) => {
    setFilters({ ...filters, genre: tag });
    setShowAutocomplete(false);
    Keyboard.dismiss();
  };

  const handleSelectSuggestion = (movie: Movie) => {
    setSearchQuery(movie.title);
    setDebouncedQuery(movie.title);
    setShowAutocomplete(false);
    Keyboard.dismiss();
    router.push(`/movie/${movie.id}`);
  };

  const handleSelectHistory = (item: SearchHistoryItem) => {
    setSearchQuery(item.query);
    setDebouncedQuery(item.query);
    if (item.filters) {
      setFilters(item.filters as SearchFilters);
    }
    setShowAutocomplete(false);
    Keyboard.dismiss();
  };

  const handleDeleteHistory = async (id: string) => {
    await searchHistoryService.removeFromHistory(id);
    loadSearchHistory();
  };

  const handleClearAllHistory = async () => {
    await searchHistoryService.clearHistory();
    loadSearchHistory();
  };

  const handleApplyFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    // Re-trigger search with new filters
    if (debouncedQuery.length >= 2) {
      setDebouncedQuery(debouncedQuery + ' '); // Force re-query
      setTimeout(() => setDebouncedQuery(searchQuery), 0);
    }
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  // Get suggestions (autocomplete)
  const { data: suggestions = [], isLoading: isSuggestionsLoading } = useQuery({
    queryKey: ['movie-suggestions', searchQuery],
    queryFn: () => movieService.getMovieSuggestions(searchQuery),
    enabled: searchQuery.length >= 2 && showAutocomplete,
    staleTime: 0,
  });

  // Get all genres for suggestions
  const { data: allGenres = [] } = useQuery({
    queryKey: ['all-genres'],
    queryFn: () => movieService.getAllGenres(),
    staleTime: 600000, // 10 mins
  });

  // Get search results with filters
  const hasFilters = Object.keys(filters).length > 0;
  const { data: searchResult, isLoading, isFetching } = useQuery({
    queryKey: ['search-movies', debouncedQuery, filters],
    queryFn: () => hasFilters 
      ? movieService.searchMoviesAdvanced(debouncedQuery, filters)
      : movieService.searchMovies(debouncedQuery).then(movies => ({ movies, total: movies.length, appliedFilters: {} })),
    enabled: debouncedQuery.length >= 2 || hasFilters,
    staleTime: 5000,
  });

  const movies = searchResult?.movies || [];

  // Get all genres for filters
  const { data: genres = [] } = useQuery({
    queryKey: ['all-genres'],
    queryFn: () => movieService.getAllGenres(),
    staleTime: 3600000, // 1 hour
  });

  const buildImageUri = (path?: string | null) => {
    if (!path) return undefined;
    return path.startsWith('http') ? path : `${TMDB_IMAGE_BASE}${path}`;
  };

  // Tối ưu hóa render bằng React.memo
  const MovieResultItem = React.memo(({ item }: { item: Movie }) => {
    const posterUri = buildImageUri(item.posterUrl);
    const genres = Array.isArray(item.genres) 
      ? item.genres 
      : typeof item.genres === 'string' 
        ? JSON.parse(item.genres) 
        : [];
    
    return (
      <TouchableOpacity 
        style={S.movieCard}
        onPress={() => router.push(`/movie/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={S.posterContainer}>
          {posterUri ? (
            <Image source={{ uri: posterUri }} style={S.posterImg} contentFit="cover" transition={200} />
          ) : (
            <View style={S.noPoster}><Text style={{fontSize: 24}}>🎬</Text></View>
          )}
          <View style={S.ratingBadge}>
            <Text style={S.starIcon}>★</Text>
            <Text style={S.ratingText}>{Number(item.rating || 0).toFixed(1)}</Text>
          </View>
        </View>
        <View style={S.movieInfo}>
          <Text style={S.movieTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={S.movieGenres} numberOfLines={1}>{genres.join(' · ')}</Text>
        </View>
      </TouchableOpacity>
    );
  });

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <MovieResultItem item={item} />
  );

  const renderEmpty = () => {
    if (debouncedQuery.length < 2 && !hasFilters) {
      if (searchHistory.length === 0) return null;

      return (
        <View style={S.guideContainer}>
          <SearchHistory
            history={searchHistory}
            onSelectHistory={handleSelectHistory}
            onDeleteHistory={handleDeleteHistory}
            onClearAll={handleClearAllHistory}
            visible={searchHistory.length > 0}
          />
        </View>
      );
    }

    if (!isLoading && !isFetching && movies.length === 0) {
      return (
        <View style={S.emptyContainer}>
          <View style={S.emptyIconBox}>
            <Text style={S.emptyIconText}>🔍</Text>
          </View>
          <Text style={S.emptyTitle}>Không tìm thấy kết quả</Text>
          <Text style={S.emptySub}>Thử tìm kiếm với từ khóa khác hoặc thể loại phổ biến hơn.</Text>
          <TouchableOpacity 
            style={S.resetBtn}
            onPress={() => {setSearchQuery(''); setDebouncedQuery(''); handleClearFilters();}}
          >
            <Text style={S.resetBtnText}>XEM GỢI Ý</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  // Active filters count
  const activeFiltersCount = Object.keys(filters).length;

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={S.header}>
        <View style={S.titleRow}>
          <Text style={S.screenTitle}>Tìm kiếm</Text>
          <TouchableOpacity 
            onPress={() => setShowFiltersModal(true)}
            style={S.filterBtn}
            activeOpacity={0.7}
          >
            <Feather name="sliders" size={20} color={Colors.text} />
            {activeFiltersCount > 0 && (
              <View style={S.filterBadge}>
                <Text style={S.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={S.searchContainer}>
          <View style={[S.searchBox, (isLoading || isFetching) && { borderColor: Colors.primary }]}>
            <Feather name="search" size={18} color={Colors.textSecondary} style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Tên phim, thể loại (Kinh dị, Hành động...)"
              placeholderTextColor="#777"
              style={S.input}
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
              clearButtonMode="while-editing"
              onSubmitEditing={handleSearchSubmit}
              onFocus={() => {
                if (searchQuery.length >= 2) {
                  setShowAutocomplete(true);
                }
              }}
            />
            {(isLoading || isFetching) && (
              <ActivityIndicator size="small" color={Colors.primary} style={{marginLeft: 8}} />
            )}
          </View>

          {/* Autocomplete Dropdown */}
          <SearchAutocomplete
            suggestions={suggestions}
            isLoading={isSuggestionsLoading}
            onSelectSuggestion={handleSelectSuggestion}
            visible={showAutocomplete && searchQuery.length >= 2}
          />

          {/* Active Filters Chips */}
          {activeFiltersCount > 0 && (
            <View style={S.activeFiltersRow}>
              {filters.genre && (
                <View style={S.filterChip}>
                  <Text style={S.filterChipText}>{filters.genre}</Text>
                  <TouchableOpacity 
                    onPress={() => setFilters({ ...filters, genre: undefined })}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={S.filterChipClose}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
              {filters.year && (
                <View style={S.filterChip}>
                  <Text style={S.filterChipText}>{filters.year}</Text>
                  <TouchableOpacity 
                    onPress={() => setFilters({ ...filters, year: undefined })}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={S.filterChipClose}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
              {filters.minRating !== undefined && (
                <View style={S.filterChip}>
                  <Text style={S.filterChipText}>{filters.minRating.toFixed(1)}+ ⭐</Text>
                  <TouchableOpacity 
                    onPress={() => setFilters({ ...filters, minRating: undefined })}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={S.filterChipClose}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity onPress={handleClearFilters} style={S.clearFiltersBtn}>
                <Text style={S.clearFiltersText}>Xóa bộ lọc</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={movies}
        renderItem={renderMovieItem}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={S.listContent}
        columnWrapperStyle={S.columnWrapper}
        ListEmptyComponent={renderEmpty()}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {/* Filters Modal */}
      <SearchFiltersModal
        visible={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
        genres={genres}
      />
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: 16, zIndex: 1000 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginTop: 10, marginBottom: 16 },
  screenTitle: { color: Colors.text, fontSize: 30, fontWeight: '800', letterSpacing: 0.3 },
  filterBtn: {
    position: 'relative',
    padding: 10,
    backgroundColor: Colors.glass,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
  },
  filterBadge: { 
    position: 'absolute', 
    top: 4, 
    right: 4, 
    backgroundColor: Colors.primary, 
    borderRadius: 10, 
    width: 18, 
    height: 18, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  filterBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  searchContainer: { paddingHorizontal: 16, zIndex: 1000, position: 'relative' },
  searchBox: { 
    height: 54, 
    backgroundColor: Colors.glass, 
    borderRadius: 18, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  input: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: '600' },
  activeFiltersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  filterChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(176,0,32,0.25)',
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.primaryGradientEnd,
  },
  filterChipText: { color: '#fff', fontSize: 12, fontWeight: '700', marginRight: 4 },
  filterChipClose: { color: '#fff', fontSize: 18, fontWeight: '700' },
  clearFiltersBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.glass,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
  },
  clearFiltersText: { color: '#D1D5DB', fontSize: 12, fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 100 },
  columnWrapper: { justifyContent: 'space-between' },
  movieCard: { width: CARD_WIDTH, marginBottom: 24 },
  posterContainer: { 
    width: '100%', 
    height: CARD_WIDTH * 1.45, 
    borderRadius: 18, 
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  posterImg: { width: '100%', height: '100%' },
  noPoster: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: { color: '#FFD700', fontSize: 10, marginRight: 3 },
  ratingText: { color: '#FFD700', fontSize: 11, fontWeight: '800' },
  movieInfo: { marginTop: 10, paddingHorizontal: 4 },
  movieTitle: { color: Colors.text, fontSize: 14, fontWeight: '800', lineHeight: 20 },
  movieGenres: { color: '#888', fontSize: 11, marginTop: 4, fontWeight: '500' },
  
  guideContainer: { flex: 1, paddingHorizontal: 20, marginTop: 40 },
  guideTitle: { color: Colors.text, fontSize: 20, fontWeight: '800', marginBottom: 10 },
  guideSub: { color: '#777', fontSize: 14, lineHeight: 22, marginBottom: 30 },
  suggestedBox: { width: '100%' },
  suggestedLabel: { color: '#555', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: { 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    backgroundColor: '#1A1A1A', 
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2A2A2A'
  },
  tagText: { color: '#AAA', fontSize: 13, fontWeight: '600' },
  
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 100, paddingHorizontal: 50 },
  emptyIconBox: { width: 100, height: 100, backgroundColor: '#1A1A1A', borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 2, borderColor: '#222' },
  emptyIconText: { fontSize: 44 },
  emptyTitle: { color: Colors.text, fontSize: 20, fontWeight: '800', marginBottom: 12 },
  emptySub: { color: '#777', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  resetBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.primaryGradientEnd,
  },
  resetBtnText: { color: Colors.text, fontWeight: '800', fontSize: 13, letterSpacing: 0.5 }
});
