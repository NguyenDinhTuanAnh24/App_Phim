import { useState } from 'react';
import { Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/constants';
import { supportService } from '@/services/support.service';

const categories = [
  { value: 'PAYMENT', label: 'Thanh toán' },
  { value: 'FEEDBACK', label: 'Góp ý' },
  { value: 'BUG', label: 'Lỗi' },
  { value: 'OTHER', label: 'Khác' },
] as const;

const statusLabel: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  RESOLVED: 'Đã xử lý',
};

const categoryLabel: Record<string, string> = {
  PAYMENT: 'Thanh toán',
  FEEDBACK: 'Góp ý',
  BUG: 'Lỗi',
  OTHER: 'Khác',
};

export default function SupportScreen() {
  const [tab, setTab] = useState<'FORM' | 'HISTORY'>('FORM');
  const [form, setForm] = useState({
    category: categories[0].value as (typeof categories)[number]['value'],
    subject: '',
    message: '',
  });

  const ticketsQuery = useQuery({
    queryKey: ['support'],
    queryFn: async () => (await supportService.getMyTickets()).data,
  });

  const tickets = Array.isArray(ticketsQuery.data?.data) ? ticketsQuery.data.data : [];

  return (
    <ScreenWrapper>
      <ScreenHeader title="Hỗ trợ & Liên hệ" subtitle="Chúng tôi luôn sẵn sàng" showBack />
      <View style={{ padding: 16, flex: 1 }}>
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          {[
            { key: 'FORM', label: 'Gửi yêu cầu' },
            { key: 'HISTORY', label: 'Lịch sử' },
          ].map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setTab(item.key as any)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 16,
                backgroundColor: tab === item.key ? 'rgba(176,0,32,0.35)' : Colors.glass,
                marginRight: 8,
                borderWidth: 0.5,
                borderColor: tab === item.key ? Colors.primaryGradientEnd : Colors.glassBorder,
              }}
            >
              <Text style={{ color: Colors.text }}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'FORM' ? (
          <View style={{ backgroundColor: Colors.glass, borderRadius: 20, padding: 14, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
              {categories.map((item) => (
                <Pressable
                  key={item.value}
                  onPress={() => setForm({ ...form, category: item.value })}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    backgroundColor: form.category === item.value ? 'rgba(176,0,32,0.35)' : 'rgba(255,255,255,0.08)',
                    borderRadius: 16,
                    marginRight: 8,
                    marginBottom: 8,
                    borderWidth: 0.5,
                    borderColor: form.category === item.value ? Colors.primaryGradientEnd : Colors.glassBorder,
                  }}
                >
                  <Text style={{ color: Colors.text }}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              placeholder="Chủ đề"
              placeholderTextColor={Colors.textSecondary}
              value={form.subject}
              onChangeText={(text) => setForm({ ...form, subject: text })}
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: Colors.text, padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 0.5, borderColor: Colors.glassBorder }}
            />
            <TextInput
              placeholder="Nội dung"
              placeholderTextColor={Colors.textSecondary}
              value={form.message}
              onChangeText={(text) => setForm({ ...form, message: text })}
              multiline
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: Colors.text, padding: 12, borderRadius: 12, height: 140, borderWidth: 0.5, borderColor: Colors.glassBorder }}
            />
            <LinearGradient colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]} style={{ borderRadius: 12, marginTop: 12 }}>
              <Pressable
                onPress={async () => {
                  try {
                    await supportService.createTicket(form);
                    setForm({ category: categories[0].value, subject: '', message: '' });
                    ticketsQuery.refetch();
                    Alert.alert('Thành công', 'Đã gửi yêu cầu hỗ trợ');
                  } catch (error: any) {
                    Alert.alert('Lỗi', error.response?.data?.message || 'Không thể gửi yêu cầu');
                  }
                }}
                style={{ padding: 12, alignItems: 'center' }}
              >
                <Text style={{ color: Colors.text, fontWeight: '700' }}>Gửi yêu cầu</Text>
              </Pressable>
            </LinearGradient>
          </View>
        ) : ticketsQuery.isLoading ? (
          <View style={{ backgroundColor: Colors.glass, borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
            <Text style={{ color: Colors.textSecondary }}>Đang tải lịch sử hỗ trợ...</Text>
          </View>
        ) : ticketsQuery.isError ? (
          <View style={{ backgroundColor: Colors.glass, borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
            <Text style={{ color: Colors.textSecondary }}>Không thể tải yêu cầu</Text>
          </View>
        ) : (
          <FlatList
            data={tickets}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <View style={{ backgroundColor: Colors.glass, borderRadius: 16, padding: 12, borderWidth: 0.5, borderColor: Colors.glassBorder, marginBottom: 12 }}>
                <Text style={{ color: Colors.text, fontWeight: '700', marginBottom: 4 }}>Lịch sử yêu cầu hỗ trợ</Text>
                <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>
                  Theo dõi trạng thái phản hồi từ hệ thống CSKH
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={{ backgroundColor: Colors.glass, padding: 14, borderRadius: 14, marginBottom: 12, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                    <Feather name="message-circle" size={16} color={Colors.textSecondary} />
                    <Text style={{ color: Colors.text, fontWeight: '700', marginLeft: 8, flex: 1 }} numberOfLines={1}>
                      {item.subject}
                    </Text>
                  </View>
                    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 0.5, borderColor: Colors.glassBorder, backgroundColor: 'rgba(176,0,32,0.25)' }}>
                      <Text style={{ color: '#FFD6D9', fontSize: 11, fontWeight: '700' }}>{statusLabel[item.status] ?? 'Đang xử lý'}</Text>
                    </View>
                  </View>

                  <Text style={{ color: Colors.textSecondary, marginTop: 8, fontSize: 12 }}>
                    Danh mục: {categoryLabel[item.category] ?? 'Khác'}
                  </Text>

                {item.message ? (
                  <Text style={{ color: Colors.textSecondary, marginTop: 8 }} numberOfLines={2}>
                    {item.message}
                  </Text>
                ) : null}

                {item.createdAt ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                    <Feather name="clock" size={13} color={Colors.textSecondary} />
                    <Text style={{ color: Colors.textSecondary, marginLeft: 6, fontSize: 12 }}>
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
            ListEmptyComponent={
              <View style={{ backgroundColor: Colors.glass, borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
                <Text style={{ color: Colors.textSecondary }}>Chưa có yêu cầu</Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}
