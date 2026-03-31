import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { adminService } from '@/services/admin.service';
import { Colors } from '@/constants';
import { formatDate } from '@/constants/date';

export default function AdminSupportReply() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reply, setReply] = useState('');

  const ticketQuery = useQuery({
    queryKey: ['admin', 'ticket', id],
    queryFn: async () => (await adminService.getTicketDetail(id as string)).data,
  });

  const ticket = ticketQuery.data?.data ?? ticketQuery.data;

  const replyMutation = useMutation({
    mutationFn: async () => {
      const content = reply.trim();
      if (!content) {
        throw new Error('Vui lòng nhập nội dung phản hồi');
      }
      return adminService.replyTicket(id as string, content);
    },
    onSuccess: () => {
      setReply('');
      ticketQuery.refetch();
      Alert.alert('Thành công', 'Đã gửi phản hồi cho người dùng');
    },
    onError: (error: any) => {
      Alert.alert('Gửi phản hồi thất bại', error?.response?.data?.message || error?.message || 'Vui lòng thử lại');
    },
  });

  return (
    <ScreenWrapper variant="admin">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <ScreenHeader title="Phản hồi hỗ trợ" showBack variant="admin" />
        <View style={{ padding: 16 }}>
          {ticketQuery.isLoading ? (
            <Text style={{ color: Colors.admin.textSecondary }}>Đang tải...</Text>
          ) : ticketQuery.isError || !ticket ? (
            <Pressable onPress={() => ticketQuery.refetch()}>
              <Text style={{ color: Colors.admin.primary }}>Không thể tải. Thử lại</Text>
            </Pressable>
          ) : (
            <>
              <Text style={{ color: Colors.admin.text, fontSize: 20, fontWeight: '700' }}>{ticket.subject}</Text>
              <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>{ticket.category}</Text>
              <Text style={{ color: Colors.admin.textSecondary, marginTop: 4 }}>
                {formatDate(ticket.createdAt ?? ticket.created_at)}
              </Text>

              <View style={{ marginTop: 16, backgroundColor: Colors.admin.surface, padding: 12, borderRadius: 16, borderWidth: 0.5, borderColor: Colors.glassBorder }}>
                <Text style={{ color: Colors.admin.textSecondary }}>{ticket.message}</Text>
              </View>

              {ticket.adminReply && (
                <View
                  style={{
                    marginTop: 16,
                    alignSelf: 'flex-end',
                    backgroundColor: Colors.admin.primary,
                    padding: 12,
                    borderRadius: 16,
                  }}
                >
                  <Text style={{ color: Colors.admin.text }}>{ticket.adminReply}</Text>
                </View>
              )}

              <TextInput
                placeholder="Nhập phản hồi..."
                placeholderTextColor={Colors.admin.textSecondary}
                value={reply}
                onChangeText={setReply}
                multiline
                style={{
                  backgroundColor: Colors.admin.surface,
                  color: Colors.admin.text,
                  padding: 12,
                  borderRadius: 16,
                  marginTop: 16,
                  minHeight: 100,
                  borderWidth: 0.5,
                  borderColor: Colors.glassBorder,
                }}
              />

              <Pressable
                onPress={() => replyMutation.mutate()}
                disabled={replyMutation.isPending}
                style={{
                  marginTop: 12,
                  backgroundColor: Colors.admin.primary,
                  padding: 12,
                  borderRadius: 16,
                  alignItems: 'center',
                  borderWidth: 0.5,
                  borderColor: 'rgba(229,9,20,0.45)',
                  opacity: replyMutation.isPending ? 0.75 : 1,
                }}
              >
                <Text style={{ color: Colors.admin.text, fontWeight: '700' }}>
                  {replyMutation.isPending ? 'ĐANG GỬI...' : 'GỬI PHẢN HỒI'}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
