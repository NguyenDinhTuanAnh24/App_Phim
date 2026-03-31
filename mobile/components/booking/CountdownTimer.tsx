import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { Colors } from '@/constants';

export const CountdownTimer = ({ seconds }: { seconds: number }) => {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setInterval(() => setRemaining((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [remaining]);

  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const text = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <Text style={{ color: remaining <= 60 ? Colors.primary : Colors.textSecondary, fontWeight: '700' }}>
      {text}
    </Text>
  );
};