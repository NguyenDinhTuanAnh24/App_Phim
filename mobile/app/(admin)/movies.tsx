import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { adminService } from '@/services/admin.service';
import { Colors } from '@/constants';

const tabs = ['PHIM', 'SUAT_CHIEU'];

export default function AdminMovies() {
  const router = useRouter();
  const [tab, setTab] = useState(tabs[0]);
  const [search, setSearch] = useState('');

  const moviesQuery = useQuery({
    queryKey: ['admin', 'movies', search],
    queryFn: async () => (await adminService.getMovies({ search: search.trim() || undefined })).data,
    enabled: tab === 'PHIM',
    placeholderData: (prev) => prev,
  });

  const suggestionsQuery = useQuery({
    queryKey: ['admin', 'movies', 'suggestions', search],
    queryFn: async () => (await adminService.getMovieSuggestions(search.trim())).data,
    enabled: tab === 'PHIM' && search.trim().length >= 2,
    placeholderData: (prev) => prev,
  });

  const movies = Array.isArray(moviesQuery.data?.movies)
    ? moviesQuery.data.movies
    : [];
  const suggestions = Array.isArray(suggestionsQuery.data?.data)
    ? suggestionsQuery.data.data
    : [];

  const formatStatus = (status?: string) => {
    if (status === 'NOW_SHOWING') return 'Đang chiếu';
    if (status === 'COMING_SOON') return 'Sắp chiếu';
    return 'Không xác định';
  };

  return (
    <ScreenWrapper variant="admin">
      <ScreenHeader title="Quản lý phim" subtitle="Chỉnh sửa dữ liệu phim" variant="admin" />
      <View style={{ padding: 16, flex: 1 }}>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {tabs.map((item) => (
            <Pressable
              key={item}
              onPress={() => setTab(item)}
                style={{
                  backgroundColor: tab === item ? Colors.admin.primary : Colors.admin.surface,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 0.5,
                  borderColor: tab === item ? 'rgba(229,9,20,0.45)' : Colors.glassBorder,
                }}
              >
              <Text style={{ color: Colors.admin.text }}>{item === 'PHIM' ? 'Phim' : 'Suất chiếu'}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'PHIM' ? (
          <>
            <TextInput
              placeholder="Tìm phim theo tên"
              placeholderTextColor={Colors.admin.textSecondary}
              value={search}
              onChangeText={setSearch}
              style={{
                backgroundColor: Colors.admin.surface,
                color: Colors.admin.text,
                padding: 12,
                borderRadius: 16,
                marginTop: 12,
                borderWidth: 0.5,
                borderColor: Colors.glassBorder,
              }}
            />
            {search.trim().length >= 2 && suggestions.length > 0 && (
              <View
                style={{
                  marginTop: 8,
                  backgroundColor: Colors.admin.surface,
                  borderRadius: 14,
                  borderWidth: 0.5,
                  borderColor: Colors.glassBorder,
                  overflow: 'hidden',
                }}
              >
                {suggestions.map((item: any, idx: number) => (
                  <Pressable
                    key={item.id}
                    onPress={() => setSearch(item.title)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderBottomWidth: idx === suggestions.length - 1 ? 0 : 0.5,
                      borderBottomColor: 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <Text style={{ color: Colors.admin.text, fontWeight: '600' }}>{item.title}</Text>
                    {!!item.original_title && item.original_title !== item.title && (
                      <Text style={{ color: Colors.admin.textSecondary, marginTop: 2 }}>{item.original_title}</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
            <Pressable
              onPress={() => router.push('/admin/movie-form')}
              style={{
                marginTop: 12,
                backgroundColor: Colors.admin.primary,
                padding: 12,
                borderRadius: 16,
                alignItems: 'center',
                borderWidth: 0.5,
                borderColor: 'rgba(229,9,20,0.45)',
              }}
            >
              <Text style={{ color: Colors.admin.text, fontWeight: '700' }}>Thêm phim mới</Text>
            </Pressable>
            {moviesQuery.isLoading ? (
              <Text style={{ color: Colors.admin.textSecondary, marginTop: 12 }}>Đang tải...</Text>
            ) : moviesQuery.isError ? (
              <Pressable onPress={() => moviesQuery.refetch()} style={{ marginTop: 12 }}>
                <Text style={{ color: Colors.admin.primary }}>Không thể tải. Thử lại</Text>
              </Pressable>
            ) : (
              <FlatList
                data={movies}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }: any) => (
                  <Pressable
                    onPress={() => router.push({ pathname: '/admin/movie-form', params: { id: item.id } })}
                    style={{
                      backgroundColor: Colors.admin.surface,
                      padding: 12,
                      borderRadius: 16,
                      marginTop: 10,
                      borderWidth: 0.5,
                      borderColor: Colors.glassBorder,
                    }}
                  >
                    <Text style={{ color: Colors.admin.text, fontWeight: '600' }}>{item.title}</Text>
                    {!!item.original_title && item.original_title !== item.title && (
                      <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>{item.original_title}</Text>
                    )}
                    <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>{formatStatus(item.status)}</Text>
                  </Pressable>
                )}
              />
            )}
          </>
        ) : (
          <View style={{ marginTop: 16 }}>
            <Text style={{ color: Colors.admin.textSecondary }}>Quản lý suất chiếu sẽ hiển thị ở đây.</Text>
            <Pressable
              onPress={() => router.push('/admin/showtime-form')}
                style={{
                  marginTop: 12,
                  backgroundColor: Colors.admin.primary,
                  padding: 12,
                  borderRadius: 16,
                  alignItems: 'center',
                  borderWidth: 0.5,
                  borderColor: 'rgba(229,9,20,0.45)',
                }}
              >
              <Text style={{ color: Colors.admin.text }}>Thêm suất chiếu</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}
