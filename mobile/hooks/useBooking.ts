import { useMutation, useQuery } from '@tanstack/react-query';
import { bookingService } from '@/services/booking.service';
import { useBookingStore } from '@/stores/bookingStore';

export const useBooking = () => {
  const { 
    selectedMovie, 
    selectedShowtime, 
    selectedSeats, 
    selectedFoods, 
    voucherCode,
    clearAll 
  } = useBookingStore();

  const createBookingMutation = useMutation({
    mutationFn: (payload: {
      showtimeId: string;
      seatIds: string[];
      foodItems?: Array<{ comboId: string; quantity: number }>;
      voucherCode?: string;
    }) => bookingService.createBooking(payload),
    onSuccess: () => {
      // Logic sau khi booking thành công (về Home hoặc trang Success)
    }
  });

  const getFoodCombosQuery = useQuery({
    queryKey: ['food-combos'],
    queryFn: () => bookingService.getFoodCombos(),
  });

  const handleCreateBooking = async () => {
    if (!selectedShowtime || selectedSeats.length === 0) {
      throw new Error('Vui lòng chọn suất chiếu và ghế.');
    }

    const payload = {
      showtimeId: selectedShowtime.id,
      seatIds: selectedSeats.map(s => s.id),
      foodItems: selectedFoods.map(f => ({
        comboId: f.combo.id,
        quantity: f.quantity
      })),
      voucherCode: voucherCode || undefined,
    };

    return createBookingMutation.mutateAsync(payload);
  };

  return {
    handleCreateBooking,
    isCreating: createBookingMutation.isPending,
    foodCombos: getFoodCombosQuery.data?.data?.data || [],
    isLoadingFood: getFoodCombosQuery.isLoading,
  };
};
