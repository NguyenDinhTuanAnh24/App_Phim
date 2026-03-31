import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { Colors } from '@/constants';
import type { MyVoucher, Voucher } from '@/constants/types';

export const VoucherPicker = ({
  vouchers,
  myVouchers,
  onApply,
}: {
  vouchers: Voucher[];
  myVouchers: MyVoucher[];
  onApply: (code: string) => void;
}) => {
  const [visible, setVisible] = useState(false);
  const [code, setCode] = useState('');

  const combined = [
    ...vouchers.map((v) => ({
      code: v.code,
      minAmount: v.minAmount ?? 0,
    })),
    ...myVouchers.map((v) => ({
      code: v.code,
      minAmount: v.minAmount ?? 0,
    })),
  ];

  return (
    <View style={{ marginVertical: 12 }}>
      <View style={{ flexDirection: 'row' }}>
        <TextInput
          placeholder="Nhập mã voucher"
          placeholderTextColor={Colors.textSecondary}
          value={code}
          onChangeText={setCode}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: Colors.surfaceLight,
            borderRadius: 12,
            paddingHorizontal: 12,
            color: Colors.text,
          }}
        />
        <Pressable
          onPress={() => onApply(code)}
          style={{
            marginLeft: 8,
            backgroundColor: Colors.primary,
            paddingHorizontal: 16,
            borderRadius: 12,
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: Colors.text, fontWeight: '700' }}>Áp dụng</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => setVisible(true)} style={{ marginTop: 8 }}>
        <Text style={{ color: Colors.textSecondary }}>Chọn voucher có sẵn</Text>
      </Pressable>

      <Modal visible={visible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: Colors.background, padding: 16 }}>
          <Text style={{ color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            Voucher khả dụng
          </Text>
          <FlatList
            data={combined}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onApply(item.code);
                  setVisible(false);
                }}
                style={{
                  backgroundColor: Colors.surface,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: Colors.text, fontWeight: '700' }}>{item.code}</Text>
                <Text style={{ color: Colors.textSecondary, marginTop: 4 }}>
                  Tối thiểu {item.minAmount.toLocaleString('vi-VN')}đ
                </Text>
              </Pressable>
            )}
          />
          <Pressable onPress={() => setVisible(false)} style={{ padding: 12 }}>
            <Text style={{ color: Colors.primary, textAlign: 'center' }}>Đóng</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};
