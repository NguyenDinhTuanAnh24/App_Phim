import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Colors, TMDB_IMAGE_BASE } from '@/constants';
import { useMovieDetail } from '@/hooks/useMovies';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DEMO_STATS = {
  age: [
    { label: '>10', value: 28 },
    { label: '>20', value: 62 },
    { label: '>30', value: 48 },
    { label: '>40', value: 24 },
  ],
  gender: [
    { label: 'Nam', value: 56 },
    { label: 'Nữ', value: 44 },
  ],
};

const REVIEWS = [
  {
    id: 'r1',
    name: 'Ngọc Anh',
    tier: 'Vàng',
    rating: 4.8,
    date: '2026-03-20',
    content: 'Cảnh quay mãn nhãn, nhịp phim ổn. Mình thích cách phát triển nhân vật chính.',
  },
  {
    id: 'r2',
    name: 'Hoàng Nam',
    tier: 'Bạc',
    rating: 4.2,
    date: '2026-03-18',
    content: 'Âm nhạc và màu sắc rất điện ảnh. Có vài đoạn hơi dài nhưng tổng thể ổn.',
  },
  {
    id: 'r3',
    name: 'Minh Thư',
    tier: 'Đồng',
    rating: 4.6,
    date: '2026-03-15',
    content: 'Phim giải trí tốt, xem xong muốn đặt vé lại với bạn bè.',
  },
];

const TIER_COLORS: Record<string, string> = {
  'Đồng': '#CD7F32',
  'Bạc': '#C0C0C0',
  'Vàng': '#FFD700',
  'Kim cương': '#B9F2FF',
};

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const detailQuery = useMovieDetail(id);
  const movie = detailQuery.data;

  const genres = useMemo(() => {
    if (!movie?.genres) return [];
    return Array.isArray(movie.genres) ? movie.genres : JSON.parse(movie.genres);
  }, [movie?.genres]);

  if (detailQuery.isLoading) {
    return (
      <SafeAreaView style={S.safe} edges={['top']}>
        <Text style={{ color: '#888', padding: 16 }}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  if (!movie) {
    return (
      <SafeAreaView style={S.safe} edges={['top']}>
        <Text style={{ color: '#888', padding: 16 }}>Không tìm thấy phim</Text>
      </SafeAreaView>
    );
  }

  const backdropUri = movie.backdropUrl
    ? movie.backdropUrl.startsWith('http')
      ? movie.backdropUrl
      : `${TMDB_IMAGE_BASE}${movie.backdropUrl}`
    : undefined;
  const overviewText =
    typeof movie.overview === 'string' && movie.overview.trim() && movie.overview.trim().toLowerCase() !== 'undefined'
      ? movie.overview.trim()
      : 'Nội dung phim đang được cập nhật.';

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
        <View style={S.hero}>
          {movie.backdropUrl ? (
            <Image source={{ uri: backdropUri }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: Colors.surface }]} />
          )}
          <View style={S.heroOverlay} />
          <View style={S.heroHeader}>
            <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
              <Feather name="chevron-left" size={20} color={Colors.text} />
            </TouchableOpacity>
            <Text style={S.heroTitle} numberOfLines={2}>
              {movie.title}
            </Text>
          </View>

          <View style={S.heroMeta}>
            <MetaPill label={`⏱ ${movie.duration ?? 0}p`} />
            <MetaPill label={`📅 ${movie.releaseDate ? dayjs(movie.releaseDate).format('DD/MM/YYYY') : 'Đang cập nhật'}`} />
            <MetaPill label={`🎬 ${genres[0] ?? 'Phim mới'}`} />
            <MetaPill label="🎥 2D · Vietsub" />
            <MetaPill label={`⭐ ${Number(movie.rating ?? 0).toFixed(1)}`} />
          </View>
        </View>

        <View style={S.section}>
          <Text style={S.sectionTitle}>Sở thích khán giả</Text>
          <View style={S.statGrid}>
            <View style={S.statCol}>
              <Text style={S.statTitle}>Theo độ tuổi</Text>
              {DEMO_STATS.age.map((item) => (
                <ProgressRow key={item.label} label={item.label} value={item.value} />
              ))}
            </View>
            <View style={S.statCol}>
              <Text style={S.statTitle}>Theo giới tính</Text>
              {DEMO_STATS.gender.map((item) => (
                <ProgressRow key={item.label} label={item.label} value={item.value} />
              ))}
            </View>
          </View>
        </View>

        <View style={S.section}>
          <Text style={S.sectionTitle}>Nội dung phim</Text>
          <Text style={S.summaryText}>
            {expanded || overviewText.length <= 160 ? overviewText : `${overviewText.slice(0, 160)}...`}
          </Text>
          {overviewText.length > 160 && (
            <Text onPress={() => setExpanded(!expanded)} style={S.moreText}>
              {expanded ? 'Thu gọn' : 'Xem thêm'}
            </Text>
          )}
        </View>

        <View style={S.section}>
          <Text style={S.sectionTitle}>Đánh giá từ khán giả</Text>
          <View style={S.reviewList}>
            {REVIEWS.map((review) => (
              <ReviewCard key={review.id} data={review} />
            ))}
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={S.footer}>
        <TouchableOpacity style={S.secondaryBtn} activeOpacity={0.85}>
          <Text style={S.secondaryText}>Viết đánh giá</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={S.primaryBtn}
          activeOpacity={0.9}
          onPress={() => router.push(`/showtime/${movie.id}`)}
        >
          <Text style={S.primaryText}>ĐẶT VÉ NGAY</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function MetaPill({ label }: { label: string }) {
  return (
    <View style={S.metaPill}>
      <Text style={S.metaText}>{label}</Text>
    </View>
  );
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={S.progressRow}>
      <View style={S.progressHeader}>
        <Text style={S.progressLabel}>{label}</Text>
        <Text style={S.progressValue}>{value}%</Text>
      </View>
      <View style={S.progressTrack}>
        <View style={[S.progressFill, { width: `${value}%` }]} />
      </View>
    </View>
  );
}

function ReviewCard({ data }: { data: typeof REVIEWS[number] }) {
  const borderColor = TIER_COLORS[data.tier] ?? Colors.primary;
  return (
    <View style={S.reviewCard}>
      <View style={S.reviewHeader}>
        <View style={[S.reviewAvatar, { borderColor }]}>
          <Text style={S.reviewAvatarText}>{data.name.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={S.reviewName}>{data.name}</Text>
          <Text style={S.reviewDate}>{dayjs(data.date).format('DD/MM/YYYY')}</Text>
        </View>
        <View style={S.reviewRating}>
          <Text style={S.starIcon}>★</Text>
          <Text style={S.reviewRatingText}>{data.rating.toFixed(1)}</Text>
        </View>
      </View>
      <Text style={S.reviewContent}>{data.content}</Text>
    </View>
  );
}

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  hero: {
    width: SCREEN_WIDTH,
    height: 320,
    backgroundColor: Colors.surface,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroHeader: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.glass,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { color: Colors.text, fontSize: 20, fontWeight: '600', flex: 1 },
  heroMeta: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    backgroundColor: 'rgba(26,26,26,0.7)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaText: { color: Colors.textSecondary, fontSize: 11 },
  section: { paddingHorizontal: 16, paddingTop: 18 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '600', marginBottom: 12 },
  statGrid: { flexDirection: 'row', gap: 12 },
  statCol: { flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 12 },
  statTitle: { color: Colors.textSecondary, fontSize: 12, marginBottom: 8 },
  progressRow: { marginBottom: 10 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressLabel: { color: Colors.text, fontSize: 11 },
  progressValue: { color: Colors.textSecondary, fontSize: 11 },
  progressTrack: { height: 6, backgroundColor: Colors.surfaceLight, borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 8 },
  summaryText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },
  moreText: { color: Colors.primary, marginTop: 8, fontSize: 12 },
  reviewList: { gap: 12 },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: { color: Colors.text, fontWeight: '600' },
  reviewName: { color: Colors.text, fontWeight: '600', fontSize: 12 },
  reviewDate: { color: Colors.textSecondary, fontSize: 10, marginTop: 2 },
  reviewRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  starIcon: { color: '#FFD700', fontSize: 12 },
  reviewRatingText: { color: Colors.textSecondary, fontSize: 12 },
  reviewContent: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLight,
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  secondaryText: { color: Colors.text, fontSize: 12, fontWeight: '600' },
  primaryBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  primaryText: { color: Colors.text, fontSize: 13, fontWeight: '700' },
});
