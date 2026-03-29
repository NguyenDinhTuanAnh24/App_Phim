export const LOYALTY_TIERS = [
  {
    name: 'Đồng',
    minPoints: 0,
    maxPoints: 999,
    color: '#CD7F32',
    multiplier: 1.0,
    icon: '🥉',
    perks: [
      'Tích 1 điểm / 10.000đ',
      'Ưu đãi sinh nhật 10%',
    ]
  },
  {
    name: 'Bạc',
    minPoints: 1000,
    maxPoints: 4999,
    color: '#C0C0C0',
    multiplier: 1.2,
    icon: '🥈',
    perks: [
      'Tích 1.2 điểm / 10.000đ',
      'Ưu đãi sinh nhật 15%',
      'Ưu tiên chọn ghế sớm hơn',
    ]
  },
  {
    name: 'Vàng',
    minPoints: 5000,
    maxPoints: 9999,
    color: '#FFD700',
    multiplier: 1.5,
    icon: '🥇',
    perks: [
      'Tích 1.5 điểm / 10.000đ',
      'Ưu đãi sinh nhật 20%',
      'Miễn phí 1 bắp/tháng',
      'Ghế VIP ưu tiên',
    ]
  },
  {
    name: 'Kim cương',
    minPoints: 10000,
    maxPoints: Infinity,
    color: '#B9F2FF',
    multiplier: 2.0,
    icon: '💎',
    perks: [
      'Tích 2 điểm / 10.000đ',
      'Ưu đãi sinh nhật 30%',
      'Miễn phí 2 bắp/tháng',
      'Phòng chiếu IMAX ưu tiên',
      'Hotline hỗ trợ riêng',
    ]
  },
];

export function getTier(points: number) {
  return LOYALTY_TIERS.slice().reverse()
    .find(tier => points >= tier.minPoints)
    ?? LOYALTY_TIERS[0];
}

export function getNextTier(points: number) {
  const currentTier = getTier(points);
  const currentIndex = LOYALTY_TIERS
    .findIndex(t => t.name === currentTier.name);
  return LOYALTY_TIERS[currentIndex + 1] ?? null;
}

export function calculatePoints(
  amount: number,
  tierName: string
): number {
  const tier = LOYALTY_TIERS.find(t => t.name === tierName)
    ?? LOYALTY_TIERS[0];
  const base = Math.floor(amount / 10000);
  return Math.floor(base * tier.multiplier);
}

export function getProgressToNextTier(points: number): number {
  const next = getNextTier(points);
  if (!next) return 100; // đã max tier
  const current = getTier(points);
  const range = next.minPoints - current.minPoints;
  const progress = points - current.minPoints;
  return Math.min(Math.max(Math.floor((progress / range) * 100), 0), 100);
}
