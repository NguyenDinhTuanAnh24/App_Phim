import { useQuery } from '@tanstack/react-query';
import { pointsService } from '@/services/points.service';

export const usePointPackages = () =>
  useQuery({
    queryKey: ['points', 'packages'],
    queryFn: async () => (await pointsService.getPackages()).data,
  });

export const useMyVouchers = () =>
  useQuery({
    queryKey: ['points', 'my-vouchers'],
    queryFn: async () => (await pointsService.getMyVouchers()).data,
    staleTime: 0,
  });

export const usePointHistory = () =>
  useQuery({
    queryKey: ['points', 'history'],
    queryFn: async () => (await pointsService.getPointHistory()).data,
  });