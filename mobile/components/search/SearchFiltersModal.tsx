import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Colors } from '@/constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SearchFilters {
  minRating?: number;
  maxRating?: number;
  year?: number;
  status?: 'NOW_SHOWING' | 'COMING_SOON';
  genre?: string;
  sortBy?: 'rating' | 'releaseDate' | 'title';
  sortOrder?: 'asc' | 'desc';
}

interface SearchFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
  genres: string[];
}

export const SearchFiltersModal: React.FC<SearchFiltersModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
  genres,
}) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {});

  useEffect(() => {
    if (visible && initialFilters) {
      setFilters(initialFilters);
    }
  }, [visible, initialFilters]);

  const handleReset = () => {
    setFilters({});
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear - i);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={S.modalOverlay}>
        <Pressable style={S.backdrop} onPress={onClose} />
        
        <View style={S.modalContent}>
          {/* Header */}
          <View style={S.header}>
            <Text style={S.headerTitle}>Bộ lọc tìm kiếm</Text>
            <TouchableOpacity onPress={onClose} style={S.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={S.scrollBody}>
            {/* Rating Filter */}
            <View style={S.section}>
              <Text style={S.sectionTitle}>Đánh giá (Tối thiểu)</Text>
              <View style={S.ratingRow}>
                <Text style={S.ratingValue}>
                  {filters.minRating?.toFixed(1) || '0.0'} ⭐
                </Text>
                <Text style={S.ratingLabel}>trở lên</Text>
              </View>
              <Slider
                minimumValue={0}
                maximumValue={10}
                step={0.5}
                value={filters.minRating || 0}
                onValueChange={(value) =>
                  setFilters({ ...filters, minRating: value })
                }
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor="#333"
                thumbTintColor={Colors.primary}
              />
            </View>

            {/* Status Filter */}
            <View style={S.section}>
              <Text style={S.sectionTitle}>Trạng thái</Text>
              <View style={S.tabRow}>
                {[
                  { label: 'Tất cả', value: undefined },
                  { label: 'Đang chiếu', value: 'NOW_SHOWING' },
                  { label: 'Sắp chiếu', value: 'COMING_SOON' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.label}
                    onPress={() =>
                      setFilters({ ...filters, status: option.value as any })
                    }
                    style={[
                      S.tabItem,
                      filters.status === option.value && S.tabItemActive
                    ]}
                  >
                    <Text style={[
                      S.tabText,
                      filters.status === option.value && S.tabTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Year Filter */}
            <View style={S.section}>
              <Text style={S.sectionTitle}>Năm phát hành</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={S.chipRow}>
                  <TouchableOpacity
                    onPress={() => setFilters({ ...filters, year: undefined })}
                    style={[S.chip, !filters.year && S.chipActive]}
                  >
                    <Text style={[S.chipText, !filters.year && S.chipTextActive]}>Tất cả</Text>
                  </TouchableOpacity>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      onPress={() => setFilters({ ...filters, year })}
                      style={[S.chip, filters.year === year && S.chipActive]}
                    >
                      <Text style={[S.chipText, filters.year === year && S.chipTextActive]}>{year}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Genre Filter */}
            <View style={S.section}>
              <Text style={S.sectionTitle}>Thể loại</Text>
              <View style={S.genreGrid}>
                <TouchableOpacity
                  onPress={() => setFilters({ ...filters, genre: undefined })}
                  style={[S.chip, !filters.genre && S.chipActive, { marginBottom: 10 }]}
                >
                  <Text style={[S.chipText, !filters.genre && S.chipTextActive]}>Tất cả</Text>
                </TouchableOpacity>
                {genres.map((genre) => (
                  <TouchableOpacity
                    key={genre}
                    onPress={() => setFilters({ ...filters, genre })}
                    style={[
                      S.chip, 
                      filters.genre === genre && S.chipActive,
                      { marginBottom: 10 }
                    ]}
                  >
                    <Text style={[S.chipText, filters.genre === genre && S.chipTextActive]}>{genre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort Options */}
            <View style={[S.section, { borderBottomWidth: 0 }]}>
              <Text style={S.sectionTitle}>Sắp xếp theo</Text>
              <View style={S.sortGrid}>
                {[
                  { label: 'Đánh giá', value: 'rating' },
                  { label: 'Ngày phát hành', value: 'releaseDate' },
                  { label: 'Tên phim', value: 'title' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        sortBy: option.value as any,
                        sortOrder: filters.sortOrder || 'desc',
                      })
                    }
                    style={[
                      S.sortItem,
                      filters.sortBy === option.value && S.sortItemActive
                    ]}
                  >
                    <Text style={[
                      S.sortText,
                      filters.sortBy === option.value && S.sortTextActive
                    ]}>
                      {option.label}
                    </Text>
                    {filters.sortBy === option.value && (
                      <TouchableOpacity
                        onPress={() =>
                          setFilters({
                            ...filters,
                            sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
                          })
                        }
                      >
                        <Ionicons
                          name={filters.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                          size={16}
                          color={Colors.primary}
                        />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Footer */}
          <View style={S.footer}>
            <TouchableOpacity onPress={handleReset} style={S.resetBtn}>
              <Text style={S.resetBtnText}>Đặt lại</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleApply} style={S.applyBtn}>
              <Text style={S.applyBtnText}>Áp dụng bộ lọc</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const S = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingTop: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
  },
  scrollBody: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  ratingValue: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: '800',
    marginRight: 8,
  },
  ratingLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    borderWidth: 1.5,
    borderColor: '#2A2A2A',
  },
  tabItemActive: {
    backgroundColor: `${Colors.primary}15`,
    borderColor: Colors.primary,
  },
  tabText: {
    textAlign: 'center',
    color: '#888',
    fontWeight: '700',
    fontSize: 13,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 1.5,
    borderColor: '#2A2A2A',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  sortGrid: {
    gap: 10,
  },
  sortItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2A2A2A',
  },
  sortItemActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}08`,
  },
  sortText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  sortTextActive: {
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#222',
    backgroundColor: Colors.background,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
  },
  resetBtnText: {
    color: '#888',
    fontWeight: '700',
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: '800',
  },
});
