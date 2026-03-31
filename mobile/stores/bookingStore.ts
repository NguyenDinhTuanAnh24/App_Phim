import { create } from 'zustand';
import type { FoodCombo, Movie, Seat, ShowtimeSlot } from '@/constants/types';

interface FoodSelection {
  combo: FoodCombo;
  quantity: number;
}

interface BookingState {
  selectedMovie?: Movie | null;
  selectedCinema?: { id: string; name: string } | null;
  selectedShowtime?: ShowtimeSlot | null;
  selectedSeats: Seat[];
  selectedFoods: FoodSelection[];
  voucherCode?: string | null;
  discount: number;
  setMovie: (movie: Movie | null) => void;
  setCinema: (cinema: { id: string; name: string } | null) => void;
  setShowtime: (showtime: ShowtimeSlot | null) => void;
  addSeat: (seat: Seat) => void;
  removeSeat: (seatId: string) => void;
  addFood: (combo: FoodCombo) => void;
  removeFood: (comboId: string) => void;
  updateFoodQty: (comboId: string, quantity: number) => void;
  setVoucher: (code: string | null, discount: number) => void;
  clearAll: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedMovie: null,
  selectedCinema: null,
  selectedShowtime: null,
  selectedSeats: [],
  selectedFoods: [],
  voucherCode: null,
  discount: 0,
  setMovie: (movie) => set({ selectedMovie: movie }),
  setCinema: (cinema) => set({ selectedCinema: cinema }),
  setShowtime: (showtime) => set({ selectedShowtime: showtime }),
  addSeat: (seat) => {
    const existing = get().selectedSeats.find((item) => item.id === seat.id);
    if (!existing) {
      set({ selectedSeats: [...get().selectedSeats, seat] });
    }
  },
  removeSeat: (seatId) =>
    set({ selectedSeats: get().selectedSeats.filter((seat) => seat.id !== seatId) }),
  addFood: (combo) => {
    const existing = get().selectedFoods.find((item) => item.combo.id === combo.id);
    if (existing) {
      set({
        selectedFoods: get().selectedFoods.map((item) =>
          item.combo.id === combo.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
      return;
    }
    set({ selectedFoods: [...get().selectedFoods, { combo, quantity: 1 }] });
  },
  removeFood: (comboId) =>
    set({ selectedFoods: get().selectedFoods.filter((item) => item.combo.id !== comboId) }),
  updateFoodQty: (comboId, quantity) =>
    set({
      selectedFoods: get().selectedFoods.map((item) =>
        item.combo.id === comboId ? { ...item, quantity } : item
      ),
    }),
  setVoucher: (code, discount) => set({ voucherCode: code, discount }),
  clearAll: () =>
    set({
      selectedMovie: null,
      selectedCinema: null,
      selectedShowtime: null,
      selectedSeats: [],
      selectedFoods: [],
      voucherCode: null,
      discount: 0,
    }),
}));