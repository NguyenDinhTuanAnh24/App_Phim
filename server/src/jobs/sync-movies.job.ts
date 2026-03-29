import { syncMoviesToDB } from '../services/tmdb.service';
import { prisma } from '../utils/prisma';

export const runSyncNow = async () => {
  console.log('[SYNC] Bắt đầu đồng bộ phim từ TMDB...');
  const start = Date.now();
  try {
    const result = await syncMoviesToDB();
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[SYNC] Hoàn tất trong ${duration}s - Tạo mới: ${result.created}, Cập nhật: ${result.updated}`);
    return result;
  } catch (err: any) {
    console.error('[SYNC] Lỗi đồng bộ phim:', err.message);
    return { created: 0, updated: 0 };
  }
};

export const initSyncIfEmpty = async () => {
  const count = await prisma.movie.count();
  if (count === 0) {
    console.log('[SYNC] Database trống, bắt đầu đồng bộ phim lần đầu...');
    await runSyncNow();
  } else {
    console.log(`[SYNC] Database đã có ${count} phim, bỏ qua đồng bộ tự động.`);
  }
};
