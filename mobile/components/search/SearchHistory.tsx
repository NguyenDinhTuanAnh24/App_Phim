import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchHistoryItem } from '@/services/storage/search-history';
import { Colors } from '@/constants';

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onSelectHistory: (item: SearchHistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onClearAll: () => void;
  visible?: boolean;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({
  history,
  onSelectHistory,
  onDeleteHistory,
  onClearAll,
  visible = true,
}) => {
  if (!visible || history.length === 0) {
    return null;
  }

  return (
    <View style={S.container}>
      <View style={S.header}>
        <Text style={S.headerTitle}>Tìm kiếm gần đây</Text>
        <TouchableOpacity onPress={onClearAll} activeOpacity={0.7}>
          <Text style={S.clearText}>Xóa tất cả</Text>
        </TouchableOpacity>
      </View>

      <View style={S.list}>
        {history.slice(0, 5).map((item) => (
          <TouchableOpacity
            key={item.id}
            style={S.historyItem}
            onPress={() => onSelectHistory(item)}
            activeOpacity={0.7}
          >
            <View style={S.itemLeft}>
              <View style={S.iconBox}>
                <Ionicons name="time-outline" size={18} color="#666" />
              </View>
              <View style={S.content}>
                <Text style={S.queryText} numberOfLines={1}>
                  {item.query}
                </Text>
                {item.filters && Object.keys(item.filters).length > 0 && (
                  <View style={S.filterRow}>
                    {item.filters.genre && <Text style={S.filterSmallTag}>{item.filters.genre}</Text>}
                    {item.filters.year && <Text style={S.filterSmallTag}>{item.filters.year}</Text>}
                    {item.filters.minRating && <Text style={S.filterSmallTag}>{item.filters.minRating}+⭐</Text>}
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => onDeleteHistory(item.id)}
              style={S.deleteBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={18} color="#444" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const S = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  clearText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    backgroundColor: '#111',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 32,
    height: 32,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  queryText: {
    color: '#DDD',
    fontSize: 14,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  filterSmallTag: {
    color: '#555',
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#151515',
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 10,
  }
});
