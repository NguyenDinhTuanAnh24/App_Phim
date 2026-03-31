import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '@/constants';

interface QRTicketProps {
  qrCode: string;
  movieTitle: string;
  cinemaName: string;
  roomName: string;
  showTime: string;
  seats: string[];
  totalAmount: number;
}

export const QRTicket: React.FC<QRTicketProps> = ({
  qrCode,
  movieTitle,
  cinemaName,
  roomName,
  showTime,
  seats,
  totalAmount,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.qrContainer}>
        <QRCode
          value={qrCode}
          size={180}
          color={Colors.text}
          backgroundColor={Colors.surface}
        />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.movieTitle} numberOfLines={1}>{movieTitle}</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Rạp:</Text>
          <Text style={styles.value}>{cinemaName} - {roomName}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Suất chiếu:</Text>
          <Text style={styles.value}>{showTime}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Ghế:</Text>
          <Text style={styles.value}>{seats.join(', ')}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Tổng tiền:</Text>
          <Text style={styles.totalValue}>{totalAmount.toLocaleString('vi-VN')} VND</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  qrContainer: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoContainer: {
    width: '100%',
  },
  movieTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  value: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceLight,
    marginVertical: 12,
    borderStyle: 'dashed',
  },
  totalValue: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
