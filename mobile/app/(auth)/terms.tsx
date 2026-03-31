import { ScrollView, Text, View } from 'react-native';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/constants';

export default function AuthTermsScreen() {
  return (
    <ScreenWrapper>
      <ScreenHeader title="Điều khoản sử dụng" showBack />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: Colors.text, fontSize: 18, fontWeight: '700' }}>1. Giới thiệu</Text>
          <Text style={{ color: Colors.textSecondary, marginTop: 8 }}>
            Ứng dụng Movie Ticket cung cấp dịch vụ đặt vé xem phim và các tiện ích liên quan. Việc sử dụng ứng dụng đồng
            nghĩa bạn đã đọc và đồng ý với các điều khoản dưới đây.
          </Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: Colors.text, fontSize: 18, fontWeight: '700' }}>2. Tài khoản</Text>
          <Text style={{ color: Colors.textSecondary, marginTop: 8 }}>
            Người dùng chịu trách nhiệm bảo mật thông tin đăng nhập và các hoạt động phát sinh từ tài khoản của mình.
          </Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: Colors.text, fontSize: 18, fontWeight: '700' }}>3. Đặt vé và thanh toán</Text>
          <Text style={{ color: Colors.textSecondary, marginTop: 8 }}>
            Vé đã đặt chỉ có hiệu lực khi thanh toán thành công. Ứng dụng có thể giới hạn số ghế hoặc thời gian giữ ghế
            tùy thời điểm.
          </Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: Colors.text, fontSize: 18, fontWeight: '700' }}>4. Điểm thưởng và voucher</Text>
          <Text style={{ color: Colors.textSecondary, marginTop: 8 }}>
            Điểm thưởng và voucher có thể có hạn sử dụng và điều kiện áp dụng. Ứng dụng có quyền điều chỉnh chương trình
            ưu đãi theo chính sách từng thời kỳ.
          </Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: Colors.text, fontSize: 18, fontWeight: '700' }}>5. Liên hệ</Text>
          <Text style={{ color: Colors.textSecondary, marginTop: 8 }}>
            Nếu cần hỗ trợ, vui lòng liên hệ trong mục Hỗ trợ & Liên hệ trong ứng dụng.
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
