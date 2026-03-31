import { create } from 'zustand';

interface SocketState {
  isConnected: boolean;
  lockedSeats: string[];
  bookedSeats: string[];
  
  setConnected: (status: boolean) => void;
  setLockedSeats: (seats: string[]) => void;
  setBookedSeats: (seats: string[]) => void;
  addLockedSeat: (seatId: string) => void;
  removeLockedSeat: (seatId: string) => void;
  addBookedSeat: (seatId: string) => void;
  reset: () => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  isConnected: false,
  lockedSeats: [],
  bookedSeats: [],

  setConnected: (status) => set({ isConnected: status }),
  setLockedSeats: (seats) => set({ lockedSeats: seats }),
  setBookedSeats: (seats) => set({ bookedSeats: seats }),
  
  addLockedSeat: (seatId) => set((state) => ({
    lockedSeats: state.lockedSeats.includes(seatId) 
      ? state.lockedSeats 
      : [...state.lockedSeats, seatId]
  })),
  
  removeLockedSeat: (seatId) => set((state) => ({
    lockedSeats: state.lockedSeats.filter((id) => id !== seatId)
  })),
  
  addBookedSeat: (seatId) => set((state) => ({
    bookedSeats: state.bookedSeats.includes(seatId)
      ? state.bookedSeats
      : [...state.bookedSeats, seatId]
  })),

  reset: () => set({ lockedSeats: [], bookedSeats: [] }),
}));
