import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = '@app_phim/search_history';
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  filters?: {
    minRating?: number;
    maxRating?: number;
    year?: number;
    status?: string;
    genre?: string;
  };
}

export const searchHistoryService = {
  // Lấy lịch sử tìm kiếm
  getHistory: async (): Promise<SearchHistoryItem[]> => {
    try {
      const data = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  },

  // Thêm một tìm kiếm vào lịch sử
  addToHistory: async (
    query: string,
    filters?: SearchHistoryItem['filters']
  ): Promise<void> => {
    try {
      const history = await searchHistoryService.getHistory();
      
      // Loại bỏ duplicate (nếu query đã tồn tại)
      const filteredHistory = history.filter((item) => item.query !== query);

      // Thêm item mới vào đầu
      const newItem: SearchHistoryItem = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        query,
        timestamp: Date.now(),
        filters,
      };

      const updatedHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);

      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  },

  // Xóa một item khỏi lịch sử
  removeFromHistory: async (id: string): Promise<void> => {
    try {
      const history = await searchHistoryService.getHistory();
      const updatedHistory = history.filter((item) => item.id !== id);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error removing from search history:', error);
    }
  },

  // Xóa toàn bộ lịch sử
  clearHistory: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  },
};
