import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/constants';
import { userService } from '@/services/user.service';
import { formatDate } from '@/constants/date';

export default function EditProfileScreen() {
  const router = useRouter();
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await userService.getProfile()).data,
  });

  const profile = profileQuery.data?.data;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setPhone(profile.phone ?? '');
      const dob = profile.birthday ?? profile.dateOfBirth;
      setBirthday(dob ? new Date(dob) : null);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await userService.updateProfile({
        name,
        phone,
        birthday: birthday ? birthday.toISOString().slice(0, 10) : undefined,
      });
      Alert.alert('Thành công', 'Cập nhật thông tin thành công');
      router.back();
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật');
    }
  };

  if (profileQuery.isLoading) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Chỉnh sửa thông tin" showBack />
        <Text style={{ color: Colors.textSecondary, padding: 16 }}>Đang tải...</Text>
      </ScreenWrapper>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Chỉnh sửa thông tin" showBack />
        <Text style={{ color: Colors.textSecondary, padding: 16 }}>Không thể tải hồ sơ</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScreenHeader title="Chỉnh sửa thông tin" subtitle="Cập nhật tài khoản" showBack />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={{ backgroundColor: Colors.glass, borderRadius: 20, padding: 14, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
          <TextInput
            placeholder="Họ tên"
            placeholderTextColor={Colors.textSecondary}
            value={name}
            onChangeText={setName}
            style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: Colors.text, padding: 12, borderRadius: 14, marginBottom: 12, borderWidth: 0.5, borderColor: Colors.glassBorder }}
          />
          <TextInput
            placeholder="Số điện thoại"
            placeholderTextColor={Colors.textSecondary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: Colors.text, padding: 12, borderRadius: 14, marginBottom: 12, borderWidth: 0.5, borderColor: Colors.glassBorder }}
          />
          <Pressable onPress={() => setShowPicker(true)} style={{ padding: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
            <Text style={{ color: Colors.textSecondary }}>
              {birthday ? formatDate(birthday) : 'Chọn ngày sinh'}
            </Text>
          </Pressable>
          {showPicker && (
            <DateTimePicker
              value={birthday || new Date()}
              mode="date"
              onChange={(_, date) => {
                setShowPicker(false);
                if (date) setBirthday(date);
              }}
            />
          )}
          <Text style={{ color: Colors.textSecondary, marginTop: 10 }}>Sinh nhật → nhận ưu đãi 🎂</Text>
        </View>
        <LinearGradient colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]} style={{ borderRadius: 14, marginTop: 16 }}>
          <Pressable onPress={handleSave} style={{ padding: 14, alignItems: 'center' }}>
            <Text style={{ color: Colors.text, fontWeight: '700' }}>Lưu</Text>
          </Pressable>
        </LinearGradient>
      </ScrollView>
    </ScreenWrapper>
  );
}
