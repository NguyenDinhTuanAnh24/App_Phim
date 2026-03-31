import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { adminService } from '@/services/admin.service';
import { Colors } from '@/constants';

function FieldLabel({ title }: { title: string }) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: Colors.admin.text, fontWeight: '600' }}>{title}</Text>
    </View>
  );
}

export default function AdminMovieForm() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [overview, setOverview] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [director, setDirector] = useState('');
  const [duration, setDuration] = useState('');
  const [rating, setRating] = useState('');
  const [language, setLanguage] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [genres, setGenres] = useState('');
  const [cast, setCast] = useState('');
  const [status, setStatus] = useState<'NOW_SHOWING' | 'COMING_SOON'>('NOW_SHOWING');

  const movieQuery = useQuery({
    queryKey: ['admin', 'movie-detail', id],
    queryFn: async () => (await adminService.getMovieDetail(id as string)).data,
    enabled: !!id,
  });

  const movie = movieQuery.data?.data ?? movieQuery.data;

  useEffect(() => {
    if (!movie) return;
    setTitle(movie.title ?? '');
    setOriginalTitle(movie.originalTitle ?? movie.original_title ?? '');
    setOverview(movie.overview ?? '');
    setPosterUrl(movie.posterUrl ?? movie.poster_url ?? '');
    setBackdropUrl(movie.backdropUrl ?? movie.backdrop_url ?? '');
    setDirector(movie.director ?? '');
    setDuration(String(movie.duration ?? ''));
    setRating(String(movie.rating ?? ''));
    setLanguage(movie.language ?? '');
    const rawReleaseDate = movie.releaseDate ?? movie.release_date;
    setReleaseDate(rawReleaseDate ? String(rawReleaseDate).slice(0, 10) : '');
    setGenres(movie.genres ?? '');
    setCast(movie.cast ?? '');
    setStatus((movie.status as 'NOW_SHOWING' | 'COMING_SOON') ?? 'NOW_SHOWING');
  }, [movie]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) {
        throw new Error('Vui lòng nhập tiêu đề phim');
      }
      const payload = {
        title: title.trim(),
        original_title: originalTitle.trim() || title.trim(),
        overview: overview.trim(),
        poster_url: posterUrl.trim(),
        backdrop_url: backdropUrl.trim(),
        director: director.trim(),
        duration: duration ? Number(duration) : undefined,
        rating: rating ? Number(rating) : undefined,
        language: language.trim(),
        release_date: releaseDate ? new Date(`${releaseDate}T00:00:00.000Z`).toISOString() : undefined,
        genres: genres.trim(),
        cast: cast.trim(),
        status,
      };
      return id ? adminService.updateMovie(id as string, payload) : adminService.createMovie(payload);
    },
    onSuccess: () => {
      Alert.alert('Thành công', 'Đã lưu phim');
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error?.response?.data?.message || error?.message || 'Không thể lưu phim');
    },
  });

  return (
    <ScreenWrapper variant="admin">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <ScreenHeader title={id ? 'Chỉnh sửa phim' : 'Thêm phim mới'} showBack variant="admin" />
        <View style={{ padding: 16 }}>
        {!!id && movieQuery.isLoading && (
          <Text style={{ color: Colors.admin.textSecondary, marginTop: 12 }}>Đang tải thông tin phim...</Text>
        )}
        {!!id && movieQuery.isError && (
          <Pressable onPress={() => movieQuery.refetch()} style={{ marginTop: 12 }}>
            <Text style={{ color: Colors.admin.primary }}>Không thể tải phim. Thử lại</Text>
          </Pressable>
        )}
        <FieldLabel title="Tên phim" />
        <TextInput
          placeholder="Nhập tên phim"
          placeholderTextColor={Colors.admin.textSecondary}
          value={title}
          onChangeText={setTitle}
          style={{ backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 8, borderWidth: 0.5, borderColor: Colors.glassBorder }}
        />
        <FieldLabel title="Tên gốc" />
        <TextInput
          placeholder="Nhập tên gốc"
          placeholderTextColor={Colors.admin.textSecondary}
          value={originalTitle}
          onChangeText={setOriginalTitle}
          style={{ backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 8, borderWidth: 0.5, borderColor: Colors.glassBorder }}
        />
        <FieldLabel title="Mô tả phim" />
        <TextInput
          placeholder="Nhập mô tả phim"
          placeholderTextColor={Colors.admin.textSecondary}
          value={overview}
          onChangeText={setOverview}
          multiline
           style={{ backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 8, minHeight: 120, borderWidth: 0.5, borderColor: Colors.glassBorder }}
          />
          <FieldLabel title="Link poster" />
          <TextInput
            placeholder="Nhập link ảnh poster"
            placeholderTextColor={Colors.admin.textSecondary}
            value={posterUrl}
            onChangeText={setPosterUrl}
            style={{ backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 8, borderWidth: 0.5, borderColor: Colors.glassBorder }}
          />
          <FieldLabel title="Link backdrop" />
          <TextInput
            placeholder="Nhập link ảnh backdrop"
            placeholderTextColor={Colors.admin.textSecondary}
            value={backdropUrl}
            onChangeText={setBackdropUrl}
            style={{ backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 8, borderWidth: 0.5, borderColor: Colors.glassBorder }}
          />
          <FieldLabel title="Đạo diễn" />
          <TextInput
            placeholder="Nhập tên đạo diễn"
            placeholderTextColor={Colors.admin.textSecondary}
            value={director}
            onChangeText={setDirector}
            style={{ backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 8, borderWidth: 0.5, borderColor: Colors.glassBorder }}
          />
          <FieldLabel title="Thời lượng và đánh giá" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              placeholder="Nhập thời lượng (phút)"
              placeholderTextColor={Colors.admin.textSecondary}
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              style={{ flex: 1, backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 8, borderWidth: 0.5, borderColor: Colors.glassBorder }}
            />
            <TextInput
              placeholder="Nhập đánh giá (0-10)"
              placeholderTextColor={Colors.admin.textSecondary}
              value={rating}
              onChangeText={setRating}
              keyboardType="decimal-pad"
              style={{ flex: 1, backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 8, borderWidth: 0.5, borderColor: Colors.glassBorder }}
            />
          </View>
          <FieldLabel title="Ngôn ngữ" />
          <TextInput
            placeholder="Nhập mã ngôn ngữ"
            placeholderTextColor={Colors.admin.textSecondary}
            value={language}
            onChangeText={setLanguage}
            style={{ backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 8, borderWidth: 0.5, borderColor: Colors.glassBorder }}
          />
          <FieldLabel title="Ngày phát hành" />
          <TextInput
            placeholder="Nhập ngày phát hành"
            placeholderTextColor={Colors.admin.textSecondary}
            value={releaseDate}
            onChangeText={setReleaseDate}
            style={{ backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 8, borderWidth: 0.5, borderColor: Colors.glassBorder }}
          />
          <FieldLabel title="Thể loại" />
          <TextInput
            placeholder="Nhập thể loại"
            placeholderTextColor={Colors.admin.textSecondary}
            value={genres}
            onChangeText={setGenres}
            style={{ backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 8, borderWidth: 0.5, borderColor: Colors.glassBorder }}
          />
          <FieldLabel title="Diễn viên" />
          <TextInput
            placeholder="Nhập diễn viên"
            placeholderTextColor={Colors.admin.textSecondary}
            value={cast}
            onChangeText={setCast}
            style={{ backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 8, borderWidth: 0.5, borderColor: Colors.glassBorder }}
          />
          <FieldLabel title="Trạng thái phát hành" />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            {(['NOW_SHOWING', 'COMING_SOON'] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => setStatus(item)}
                style={{
                  backgroundColor: status === item ? Colors.admin.primary : Colors.admin.surface,
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderWidth: 0.5,
                  borderColor: status === item ? 'rgba(229,9,20,0.45)' : Colors.glassBorder,
                }}
              >
                <Text style={{ color: Colors.admin.text }}>
                  {item === 'NOW_SHOWING' ? 'Đang chiếu' : 'Sắp chiếu'}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            style={{ marginTop: 16, backgroundColor: Colors.admin.primary, padding: 12, borderRadius: 16, alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(229,9,20,0.45)' }}
          >
            <Text style={{ color: Colors.admin.text, fontWeight: '700' }}>
              {saveMutation.isPending ? 'ĐANG LƯU...' : 'LƯU'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
