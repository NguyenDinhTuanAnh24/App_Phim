import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { adminService } from '@/services/admin.service';
import { Colors } from '@/constants';

export default function AdminShowtimeForm() {
  const router = useRouter();
  const [movieId, setMovieId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [price, setPrice] = useState('');
  const [vipPrice, setVipPrice] = useState('');
  const [couplePrice, setCouplePrice] = useState('');
  const [language, setLanguage] = useState('');
  const [format, setFormat] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!movieId.trim() || !roomId.trim() || !startTime.trim()) {
        throw new Error('Vui lòng nhập đủ Mã phim, Mã phòng và thời gian');
      }
      const iso = startTime.includes('T')
        ? startTime
        : startTime.trim().replace(' ', 'T') + ':00.000Z';
      const isoEnd = endTime.trim()
        ? (endTime.includes('T') ? endTime : endTime.trim().replace(' ', 'T') + ':00.000Z')
        : undefined;
      return adminService.createShowtime({
        movieId: movieId.trim(),
        roomId: roomId.trim(),
        startTime: iso,
        endTime: isoEnd,
        price: price ? Number(price) : undefined,
        vipPrice: vipPrice ? Number(vipPrice) : undefined,
        couplePrice: couplePrice ? Number(couplePrice) : undefined,
        language: language.trim() || undefined,
        format: format.trim() || undefined,
      });
    },
    onSuccess: () => {
      Alert.alert('Thành công', 'Đã tạo suất chiếu');
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error?.response?.data?.message || error?.message || 'Không thể tạo suất chiếu');
    },
  });

  return (
    <ScreenWrapper variant="admin">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <ScreenHeader title="Thêm suất chiếu" showBack variant="admin" />
        <View style={{ padding: 16 }}>
          <TextInput
            placeholder="Mã phim"
            placeholderTextColor={Colors.admin.textSecondary}
            value={movieId}
            onChangeText={setMovieId}
            style={{ backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 12, borderWidth: 0.5, borderColor: Colors.glassBorder }}
          />
          <TextInput
            placeholder="Mã phòng"
            placeholderTextColor={Colors.admin.textSecondary}
            value={roomId}
            onChangeText={setRoomId}
            style={{ backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 12, borderWidth: 0.5, borderColor: Colors.glassBorder }}
          />
          <TextInput
            placeholder="Thời gian bắt đầu (YYYY-MM-DD HH:mm)"
            placeholderTextColor={Colors.admin.textSecondary}
            value={startTime}
            onChangeText={setStartTime}
            style={{ backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 12, borderWidth: 0.5, borderColor: Colors.glassBorder }}
          />
          <TextInput
            placeholder="Thời gian kết thúc (YYYY-MM-DD HH:mm, tùy chọn)"
            placeholderTextColor={Colors.admin.textSecondary}
            value={endTime}
            onChangeText={setEndTime}
            style={{ backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 12, borderWidth: 0.5, borderColor: Colors.glassBorder }}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              placeholder="Giá vé thường"
              placeholderTextColor={Colors.admin.textSecondary}
              value={price}
              onChangeText={setPrice}
              keyboardType="number-pad"
              style={{ flex: 1, backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 12, borderWidth: 0.5, borderColor: Colors.glassBorder }}
            />
            <TextInput
              placeholder="Giá vé VIP"
              placeholderTextColor={Colors.admin.textSecondary}
              value={vipPrice}
              onChangeText={setVipPrice}
              keyboardType="number-pad"
              style={{ flex: 1, backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 12, borderWidth: 0.5, borderColor: Colors.glassBorder }}
            />
          </View>
          <TextInput
            placeholder="Giá ghế đôi"
            placeholderTextColor={Colors.admin.textSecondary}
            value={couplePrice}
            onChangeText={setCouplePrice}
            keyboardType="number-pad"
            style={{ backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 12, borderWidth: 0.5, borderColor: Colors.glassBorder }}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              placeholder="Ngôn ngữ (VD: Phụ đề Việt)"
              placeholderTextColor={Colors.admin.textSecondary}
              value={language}
              onChangeText={setLanguage}
              style={{ flex: 1, backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 12, borderWidth: 0.5, borderColor: Colors.glassBorder }}
            />
            <TextInput
              placeholder="Định dạng (2D/3D/IMAX)"
              placeholderTextColor={Colors.admin.textSecondary}
              value={format}
              onChangeText={setFormat}
              style={{ flex: 1, backgroundColor: Colors.admin.surface, color: Colors.admin.text, padding: 12, borderRadius: 16, marginTop: 12, borderWidth: 0.5, borderColor: Colors.glassBorder }}
            />
          </View>
          <Pressable
            onPress={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            style={{ marginTop: 16, backgroundColor: Colors.admin.primary, padding: 12, borderRadius: 16, alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(229,9,20,0.45)' }}
          >
            <Text style={{ color: Colors.admin.text, fontWeight: '700' }}>
              {createMutation.isPending ? 'ĐANG LƯU...' : 'LƯU'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
