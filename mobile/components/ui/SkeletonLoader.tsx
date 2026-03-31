import { View } from 'react-native';
import { Colors } from '@/constants';

const SkeletonBox = ({ height, width }: { height: number; width: number }) => (
  <View
    style={{
      height,
      width,
      backgroundColor: Colors.skeleton,
      borderRadius: 8,
      marginRight: 12,
    }}
  />
);

export const MovieCardSkeleton = () => (
  <View style={{ width: 140 }}>
    <SkeletonBox height={200} width={140} />
    <SkeletonBox height={16} width={120} />
    <SkeletonBox height={12} width={90} />
  </View>
);

export const BannerSkeleton = () => (
  <View style={{ width: '100%', height: 200, backgroundColor: Colors.skeleton, borderRadius: 16 }} />
);

export const ListItemSkeleton = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
    <SkeletonBox height={80} width={60} />
    <View>
      <SkeletonBox height={16} width={180} />
      <SkeletonBox height={12} width={140} />
    </View>
  </View>
);
