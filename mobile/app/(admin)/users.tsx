import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { adminService } from '@/services/admin.service';
import { Colors } from '@/constants';
import { formatDate } from '@/constants/date';

const tabs = ['USERS', 'SUPPORT'] as const;
const supportFilters = ['ALL', 'PENDING', 'RESOLVED'] as const;

const supportFilterLabel: Record<(typeof supportFilters)[number], string> = {
  ALL: 'Tất cả',
  PENDING: 'Chờ xử lý',
  RESOLVED: 'Đã xử lý',
};

export default function AdminUsers() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof tabs)[number]>(tabs[0]);
  const [search, setSearch] = useState('');
  const [supportStatus, setSupportStatus] = useState<(typeof supportFilters)[number]>('ALL');

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', search],
    queryFn: async () => (await adminService.getUsers({ search: search.trim() || undefined })).data,
    enabled: tab === 'USERS',
    placeholderData: (prev) => prev,
  });

  const suggestionsQuery = useQuery({
    queryKey: ['admin', 'users', 'suggestions', search],
    queryFn: async () => (await adminService.getUserSuggestions(search.trim())).data,
    enabled: tab === 'USERS' && search.trim().length >= 2,
    placeholderData: (prev) => prev,
  });

  const supportQuery = useQuery({
    queryKey: ['admin', 'support', supportStatus],
    queryFn: async () =>
      (await adminService.getAllTickets({ status: supportStatus === 'ALL' ? undefined : supportStatus })).data,
    enabled: tab === 'SUPPORT',
    placeholderData: (prev) => prev,
  });

  const users = Array.isArray(usersQuery.data?.users)
    ? usersQuery.data.users
    : [];
  const suggestions = Array.isArray(suggestionsQuery.data?.data)
    ? suggestionsQuery.data.data
    : [];
  const tickets = Array.isArray(supportQuery.data?.tickets)
    ? supportQuery.data.tickets
    : [];
  const ticketList = useMemo(() => tickets, [tickets]);

  return (
    <ScreenWrapper variant="admin">
      <ScreenHeader title="Người dùng & Hỗ trợ" subtitle="Quản trị thành viên và ticket" variant="admin" />
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
              <Text style={{ color: Colors.admin.text }}>{item === 'USERS' ? 'Người dùng' : 'Hỗ trợ'}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'USERS' ? (
          <>
            <TextInput
              placeholder="Tìm người dùng"
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
                    onPress={() => setSearch(item.email || item.name)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderBottomWidth: idx === suggestions.length - 1 ? 0 : 0.5,
                      borderBottomColor: 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <Text style={{ color: Colors.admin.text, fontWeight: '600' }}>{item.name}</Text>
                    <Text style={{ color: Colors.admin.textSecondary, marginTop: 2 }}>{item.email}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            {usersQuery.isLoading ? (
              <Text style={{ color: Colors.admin.textSecondary, marginTop: 12 }}>Đang tải...</Text>
            ) : usersQuery.isError ? (
              <Pressable onPress={() => usersQuery.refetch()} style={{ marginTop: 12 }}>
                <Text style={{ color: Colors.admin.primary }}>Không thể tải. Thử lại</Text>
              </Pressable>
            ) : (
              <FlatList
                data={users}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }: any) => (
                  <Pressable
                    onPress={() => router.push(`/admin/user-detail/${item.id}`)}
                    style={{
                      backgroundColor: Colors.admin.surface,
                      padding: 12,
                      borderRadius: 16,
                      marginTop: 10,
                      borderWidth: 0.5,
                      borderColor: Colors.glassBorder,
                    }}
                  >
                    <Text style={{ color: Colors.admin.text, fontWeight: '600' }}>{item.name}</Text>
                    <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>{item.email}</Text>
                    <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>
                      {item.loyaltyTier}
                    </Text>
                  </Pressable>
                )}
              />
            )}
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {supportFilters.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setSupportStatus(item)}
                  style={{
                    backgroundColor: supportStatus === item ? Colors.admin.primary : Colors.admin.surface,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 0.5,
                    borderColor: supportStatus === item ? 'rgba(229,9,20,0.45)' : Colors.glassBorder,
                  }}
                >
                  <Text style={{ color: Colors.admin.text }}>{supportFilterLabel[item]}</Text>
                </Pressable>
              ))}
            </View>
            {supportQuery.isLoading ? (
              <Text style={{ color: Colors.admin.textSecondary, marginTop: 12 }}>Đang tải...</Text>
            ) : supportQuery.isError ? (
              <Pressable onPress={() => supportQuery.refetch()} style={{ marginTop: 12 }}>
                <Text style={{ color: Colors.admin.primary }}>Không thể tải. Thử lại</Text>
              </Pressable>
            ) : (
              <FlatList
                data={ticketList}
                keyExtractor={(item: any) => item.id}
                removeClippedSubviews
                windowSize={7}
                initialNumToRender={8}
                renderItem={({ item }: any) => (
                  <Pressable
                    onPress={() => router.push(`/admin/support-reply/${item.id}`)}
                    style={{
                      backgroundColor: Colors.admin.surface,
                      padding: 12,
                      borderRadius: 16,
                      marginTop: 10,
                      borderWidth: 0.5,
                      borderColor: item.status === 'PENDING' ? '#F59E0B' : Colors.glassBorder,
                    }}
                  >
                    <Text style={{ color: Colors.admin.text, fontWeight: '600' }}>{item.subject}</Text>
                    <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>{item.user?.name ?? 'Người dùng'}</Text>
                    <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>
                      {item.category} • {formatDate(item.createdAt ?? item.created_at)}
                    </Text>
                  </Pressable>
                )}
              />
            )}
          </>
        )}
      </View>
    </ScreenWrapper>
  );
}
