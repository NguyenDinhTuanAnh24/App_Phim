import { useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/constants';
import { useAuthStore } from '@/stores/authStore';
import { useSocketStore } from '@/stores/socketStore';

interface SeatEvent {
  seatId: string;
}

export const useSocket = (showtimeId?: string) => {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((state) => state.accessToken);
  const { 
    setConnected, 
    addLockedSeat, 
    removeLockedSeat, 
    addBookedSeat,
    lockedSeats,
    bookedSeats,
    reset
  } = useSocketStore();

  useEffect(() => {
    if (!showtimeId) {
      return;
    }

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: token ? { token: `Bearer ${token}` } : undefined,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('joinShowtime', showtimeId);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('seatLocked', (payload: SeatEvent) => {
      addLockedSeat(payload.seatId);
    });

    socket.on('seatUnlocked', (payload: SeatEvent) => {
      removeLockedSeat(payload.seatId);
    });

    socket.on('seatBooked', (payload: SeatEvent) => {
      addBookedSeat(payload.seatId);
    });

    return () => {
      socket.emit('leaveShowtime', showtimeId);
      socket.disconnect();
      reset();
    };
  }, [showtimeId, token]);

  const lockSeat = useCallback((seatId: string) => {
    socketRef.current?.emit('lockSeat', { showtimeId, seatId });
  }, [showtimeId]);

  const unlockSeat = useCallback((seatId: string) => {
    socketRef.current?.emit('unlockSeat', { showtimeId, seatId });
  }, [showtimeId]);

  return { socketRef, lockedSeats, bookedSeats, lockSeat, unlockSeat };
};