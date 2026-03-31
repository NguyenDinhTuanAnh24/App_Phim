import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
  StatusBar,
  ListRenderItemInfo,
} from 'react-native';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useAuthStore } from '@/stores/authStore';
import { movieService } from '@/services/movie.service';
import { userService } from '@/services/user.service';
import { Colors, TMDB_IMAGE_BASE } from '@/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TIER_CONFIG: Record<string, { icon: string; color: string }> = {
  'Đồng': { icon: '🥉', color: '#CD7F32' },
  'Bạc': { icon: '🥈', color: '#C0C0C0' },
  'Vàng': { icon: '🥇', color: '#FFD700' },
  'Kim cương': { icon: '💎', color: '#B9F2FF' },
};

const GENRES = ['Tất cả', 'Hành động', 'Tình cảm', 'Hoạt hình', 'Kinh dị', 'Hài', 'Phiêu lưu'];


export default function HomeScreen() {
  const { user, updateUser } = useAuthStore();
  const [selectedGenre, setSelectedGenre] = useState('Tất cả');
  const [refreshing, setRefreshing] = useState(false);
  const [heroBannerIdx, setHeroBannerIdx] = useState(0);
  const bannerRef = useRef<FlatList<any> | null>(null);

  const nowQuery = useQuery({
    queryKey: ['movies', 'now-showing'],
    queryFn: async () => movieService.getNowShowing(),
    staleTime: 5 * 60 * 1000,
  });

  const soonQuery = useQuery({
    queryKey: ['movies', 'coming-soon'],
    queryFn: async () => movieService.getComingSoon(),
    staleTime: 10 * 60 * 1000,
  });

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await userService.getProfile()).data,
    staleTime: 0,
    refetchOnMount: true,
  });

  const nowMovies = Array.isArray(nowQuery.data) ? nowQuery.data : [];
  const soonMovies = Array.isArray(soonQuery.data) ? soonQuery.data : [];
  const profile = profileQuery.data?.data;
  const tierInfo = TIER_CONFIG[profile?.loyaltyTier ?? 'Đồng'];
  const displayName = (profile?.name || user?.name || 'Bạn').trim();

  const filteredNow = useMemo(() => {
    if (selectedGenre === 'Tất cả') return nowMovies;
    return nowMovies.filter((movie: any) => {
      const genres = typeof movie.genres === 'string' ? JSON.parse(movie.genres) : movie.genres ?? [];
      return genres.some((genre: string) => genre.toLowerCase().includes(selectedGenre.toLowerCase()));
    });
  }, [nowMovies, selectedGenre]);

  useEffect(() => {
    const bannerMovies = nowMovies.slice(0, 5);
    if (bannerMovies.length <= 1) return;
    const timer = setInterval(() => {
      setHeroBannerIdx((prev) => {
        const next = (prev + 1) % bannerMovies.length;
        bannerRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [nowMovies]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([nowQuery.refetch(), soonQuery.refetch(), profileQuery.refetch()]);
    setRefreshing(false);
  }, [nowQuery, profileQuery, soonQuery]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 17) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const buildImageUri = (path?: string | null) => {
    if (!path) return undefined;
    return path.startsWith('http') ? path : `${TMDB_IMAGE_BASE}${path}`;
  };

  const avatarUri = buildImageUri(profile?.avatarUrl);

  useEffect(() => {
    if (profile?.name && user && profile.name !== user.name) {
      updateUser({ ...user, name: profile.name });
    }
  }, [profile?.name, updateUser, user]);

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <ScrollView
        style={S.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <View style={S.header}>
          <View style={S.logoRow}>
            <LinearGradient colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]} style={S.logoIcon}>
              <Feather name="film" size={14} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={S.logoText}>MOVIE TICKET</Text>
              <Text style={{ color: '#7A7A7A', fontSize: 11, marginTop: 2 }}>Premium Cinematic</Text>
            </View>
          </View>
          <View style={S.headerRight}>
            <TouchableOpacity style={S.notifBtn} onPress={() => {}}>
              <Feather name="bell" size={16} color={Colors.text} />
              <View style={S.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <View style={[S.avatarCircle, { borderColor: tierInfo?.color ?? Colors.primary }]}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={S.avatarImg} contentFit="cover" />
                ) : (
                  <Text style={S.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={S.greeting}>
          <Text style={S.greetingInline} numberOfLines={1}>
            {getGreeting()}, {displayName}
          </Text>
        </View>

        {profile && (
          <TouchableOpacity
            style={S.loyaltyCard}
            onPress={() => router.push('/profile/redeem-points')}
            activeOpacity={0.85}
          >
            <View style={S.loyaltyLeft}>
              <View
                style={[
                  S.tierBadge,
                  {
                    borderColor: tierInfo?.color ?? Colors.primary,
                    backgroundColor: `${tierInfo?.color ?? Colors.primary}22`,
                  },
                ]}
              >
                <Text style={{ fontSize: 12 }}>{tierInfo?.icon ?? '🎟️'}</Text>
                <Text style={[S.tierLabel, { color: tierInfo?.color ?? Colors.primary }]}>
                  Hạng {profile.loyaltyTier ?? 'Đồng'}
                </Text>
              </View>
              <Text style={S.pointsText}>
                Có{' '}
                <Text style={{ color: Colors.primary, fontWeight: '500' }}>
                  {(profile.loyaltyPoints ?? 0).toLocaleString('vi-VN')} điểm
                </Text>
              </Text>
            </View>
            <View style={S.redeemBtn}>
              <Text style={S.redeemLabel}>Đổi điểm →</Text>
            </View>
          </TouchableOpacity>
        )}

        <SectionHeader title="Nổi bật tuần này" />
        <View style={S.heroWrap}>
          <FlatList
            ref={bannerRef}
            data={nowMovies.slice(0, 5)}
            keyExtractor={(item: any) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const idx = Math.round(event.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32));
              setHeroBannerIdx(idx);
            }}
            renderItem={({ item: movie }: ListRenderItemInfo<any>) => {
              const backdropUri = buildImageUri(movie.backdropUrl);
              const genres = typeof movie.genres === 'string' ? JSON.parse(movie.genres) : movie.genres ?? [];
              return (
                <TouchableOpacity
                  activeOpacity={0.95}
                  onPress={() => router.push(`/movie/${movie.id}`)}
                  style={S.heroBannerItem}
                >
                  {backdropUri ? (
                    <Image source={{ uri: backdropUri }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                  ) : (
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: Colors.surface }]} />
                  )}
                  <View style={S.heroGradient} />
                  <View style={S.heroContent}>
                    <View style={S.heroGenres}>
                      {genres.slice(0, 2).map((genre: string, index: number) => (
                        <View key={`${genre}-${index}`} style={S.genreChip}>
                          <Text style={S.genreChipText}>{genre}</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={S.heroTitle} numberOfLines={2}>
                      {movie.title}
                    </Text>
                    <View style={S.heroMeta}>
                      <Feather name="star" size={12} color="#FFD700" />
                      <Text style={S.heroRating}>{Number(movie.rating ?? 0).toFixed(1)}</Text>
                      <Text style={S.heroDot}>·</Text>
                      <Feather name="clock" size={12} color="#AAA" />
                      <Text style={S.heroMetaText}>
                        {Math.floor((movie.duration ?? 0) / 60)}h {(movie.duration ?? 0) % 60}p
                      </Text>
                      <Text style={S.heroDot}>·</Text>
                      <Text style={S.heroMetaText}>Vietsub</Text>
                    </View>
                    <TouchableOpacity style={S.heroCTA} onPress={() => router.push(`/movie/${movie.id}`)}>
                      <Text style={S.heroCTAText}>Đặt vé ngay</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          <View style={S.dotsRow}>
            {nowMovies.slice(0, 5).map((_: any, index: number) => (
              <View key={`dot-${index}`} style={[S.dot, heroBannerIdx === index ? S.dotActive : S.dotInactive]} />
            ))}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.genreFilter}>
          {GENRES.map((genre) => (
            <TouchableOpacity
              key={genre}
              onPress={() => setSelectedGenre(genre)}
              style={[S.genreBtn, selectedGenre === genre && S.genreBtnActive]}
            >
              <Text style={[S.genreBtnText, selectedGenre === genre && S.genreBtnTextActive]}>{genre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <SectionHeader title="Đang chiếu" onSeeAll={() => {}} />
        {nowQuery.isLoading ? (
          <MovieListSkeleton />
        ) : (
          <FlatList
            horizontal
            data={filteredNow}
            keyExtractor={(item: any) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={S.movieList}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            renderItem={({ item: movie }: ListRenderItemInfo<any>) => {
              const posterUri = buildImageUri(movie.posterUrl);
              return (
                <TouchableOpacity
                  style={S.movieCard}
                  onPress={() => router.push(`/movie/${movie.id}`)}
                  activeOpacity={0.85}
                >
                  <View style={S.moviePoster}>
                    {posterUri ? (
                      <Image source={{ uri: posterUri }} style={S.posterImg} contentFit="cover" />
                    ) : (
                      <View
                        style={[
                          S.posterImg,
                          { backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
                        ]}
                      >
                        <Text style={{ fontSize: 24 }}>🎬</Text>
                      </View>
                    )}
                    <View style={S.hotBadge}>
                      <Feather name="zap" size={10} color="#fff" />
                      <Text style={S.hotBadgeText}>HOT</Text>
                    </View>
                  </View>
                  <Text style={S.movieTitle} numberOfLines={2}>
                    {movie.title}
                  </Text>
                  <View style={S.movieRating}>
                    <Text style={S.starSmall}>★</Text>
                    <Text style={S.ratingText}>{Number(movie.rating ?? 0).toFixed(1)}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}

        <SectionHeader title="Sắp chiếu" onSeeAll={() => {}} />
        <FlatList
          horizontal
          data={soonMovies.slice(0, 6)}
          keyExtractor={(item: any) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={S.movieList}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          renderItem={({ item: movie }: ListRenderItemInfo<any>) => {
            const backdropUri = buildImageUri(movie.backdropUrl);
            const genres = typeof movie.genres === 'string' ? JSON.parse(movie.genres) : movie.genres ?? [];
            const releaseDate = movie.releaseDate ? dayjs(movie.releaseDate).format('DD/MM/YYYY') : 'Chưa rõ';
            return (
              <TouchableOpacity
                style={S.comingCard}
                onPress={() => router.push(`/movie/${movie.id}`)}
                activeOpacity={0.85}
              >
                <View style={S.comingBackdrop}>
                  {backdropUri ? (
                    <Image source={{ uri: backdropUri }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                  ) : (
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: Colors.surface }]} />
                  )}
                  <View style={S.comingGradient} />
                </View>
                <View style={S.comingInfo}>
                  <Text style={S.comingTitle} numberOfLines={1}>
                    {movie.title}
                  </Text>
                  <Text style={S.comingDate}>{releaseDate}</Text>
                  <Text style={S.comingGenre} numberOfLines={1}>
                    {genres.join(' · ')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={S.sectionHeader}>
      <Text style={S.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={S.seeAll}>Xem tất cả →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function MovieListSkeleton() {
  return (
    <View style={[S.movieList, { flexDirection: 'row', paddingLeft: 16 }]}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={[S.movieCard, { marginRight: 10 }]}>
          <View style={[S.moviePoster, { backgroundColor: Colors.surface }]} />
          <View style={{ height: 10, backgroundColor: Colors.surface, borderRadius: 4, marginTop: 6 }} />
          <View style={{ height: 8, backgroundColor: Colors.surface, borderRadius: 4, marginTop: 4, width: 40 }} />
        </View>
      ))}
    </View>
  );
}

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
  },
  logoText: { color: Colors.text, fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notifBtn: {
    width: 34,
    height: 34,
    backgroundColor: Colors.glass,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    backgroundColor: Colors.primary,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  avatarImg: { width: 34, height: 34, borderRadius: 17 },
  avatarText: { color: Colors.text, fontSize: 14, fontWeight: '500' },
  greeting: { paddingHorizontal: 16, paddingBottom: 14 },
  greetingInline: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  loyaltyCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.glass,
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
  },
  loyaltyLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  tierLabel: { fontSize: 11, fontWeight: '500' },
  pointsText: { color: Colors.text, fontSize: 12 },
  redeemBtn: {
    backgroundColor: 'rgba(176,0,32,0.25)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: Colors.primaryGradientEnd,
  },
  redeemLabel: { color: Colors.text, fontSize: 11, fontWeight: '500' },
  heroWrap: { paddingHorizontal: 16, marginBottom: 4 },
  heroBannerItem: {
    width: SCREEN_WIDTH - 32,
    height: 220,
    borderRadius: 22,
    overflow: 'hidden',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  heroGenres: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  genreChip: {
    backgroundColor: 'rgba(229,9,20,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(229,9,20,0.5)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  genreChipText: { color: '#ffaaaa', fontSize: 9 },
  heroTitle: { color: Colors.text, fontSize: 22, fontWeight: '800', marginBottom: 6 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  starIcon: { color: '#FFD700', fontSize: 11 },
  heroRating: { color: '#FFD700', fontSize: 11, fontWeight: '500' },
  heroDot: { color: '#555', fontSize: 11 },
  heroMetaText: { color: '#aaa', fontSize: 11 },
  heroCTA: {
    backgroundColor: 'rgba(176,0,32,0.25)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: 'flex-start',
    borderWidth: 0.5,
    borderColor: Colors.primaryGradientEnd,
  },
  heroCTAText: { color: Colors.text, fontSize: 12, fontWeight: '800' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 10 },
  dot: { height: 3, borderRadius: 2 },
  dotActive: { width: 18, backgroundColor: Colors.primary },
  dotInactive: { width: 6, backgroundColor: '#333' },
  genreFilter: { paddingHorizontal: 16, paddingBottom: 14, gap: 6 },
  genreBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glass,
  },
  genreBtnActive: { backgroundColor: 'rgba(176,0,32,0.25)', borderColor: Colors.primaryGradientEnd },
  genreBtnText: { color: '#888', fontSize: 12 },
  genreBtnTextActive: { color: Colors.text },
  movieList: { paddingHorizontal: 16, paddingBottom: 16 },
  movieCard: { width: 104 },
  moviePoster: {
    width: 104,
    height: 155,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 6,
    position: 'relative',
  },
  posterImg: { width: '100%', height: '100%' },
  hotBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(229,9,20,0.75)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  hotBadgeText: { color: Colors.text, fontSize: 8, fontWeight: '500' },
  movieTitle: { color: Colors.text, fontSize: 11, fontWeight: '500', lineHeight: 15 },
  movieRating: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 3 },
  starSmall: { color: '#FFD700', fontSize: 10 },
  ratingText: { color: '#888', fontSize: 10 },
  promoWrap: { paddingHorizontal: 16, marginBottom: 16, gap: 10 },
  promoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5091433',
  },
  promoLeft: { flex: 1, marginRight: 12 },
  promoBadge: {
    backgroundColor: '#E5091422',
    borderWidth: 1,
    borderColor: '#E5091466',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  promoBadgeText: { color: '#ff8888', fontSize: 9, fontWeight: '500' },
  promoTitle: { color: Colors.text, fontSize: 13, fontWeight: '500', marginBottom: 3 },
  promoSub: { color: '#888', fontSize: 11, lineHeight: 16 },
  promoCircle: {
    width: 60,
    height: 60,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  promoVal: { color: Colors.text, fontSize: 15, fontWeight: '500', lineHeight: 18 },
  promoUnit: { color: '#ffaaaa', fontSize: 9 },
  comingCard: {
    width: 200,
    backgroundColor: Colors.glass,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
  },
  comingBackdrop: { height: 95, position: 'relative' },
  comingGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  comingInfo: { padding: 10 },
  comingTitle: { color: Colors.text, fontSize: 12, fontWeight: '500', marginBottom: 3 },
  comingDate: { color: Colors.primary, fontSize: 10 },
  comingGenre: { color: '#666', fontSize: 10, marginTop: 2 },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  seeAll: { color: Colors.primaryGradientEnd, fontSize: 12, fontWeight: '700' },
});
