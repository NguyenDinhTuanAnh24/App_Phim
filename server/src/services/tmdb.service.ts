import axios from 'axios';
import { prisma } from '../utils/prisma';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

const tmdbApi = axios.create({
  baseURL: TMDB_BASE,
  params: { api_key: TMDB_API_KEY },
});

export const fetchNowPlayingMovies = async () => {
  const { data } = await tmdbApi.get('/movie/now_playing', {
    params: { language: 'vi-VN', region: 'VN', page: 1 },
  });
  return data.results.slice(0, 20);
};

export const fetchUpcomingMovies = async () => {
  const { data } = await tmdbApi.get('/movie/upcoming', {
    params: { language: 'vi-VN', region: 'VN', page: 1 },
  });
  return data.results.slice(0, 20);
};

export const fetchMovieDetail = async (tmdbId: number) => {
  const { data } = await tmdbApi.get(`/movie/${tmdbId}`, {
    params: { language: 'vi-VN' },
  });
  return data;
};

export const fetchMovieCredits = async (tmdbId: number) => {
  const { data } = await tmdbApi.get(`/movie/${tmdbId}/credits`, {
    params: { language: 'vi-VN' },
  });
  const cast = data.cast.slice(0, 10);
  const director = data.crew.find((c: any) => c.job === 'Director');
  return { cast, director: director?.name || 'N/A' };
};

export const fetchMovieVideos = async (tmdbId: number) => {
  const { data } = await tmdbApi.get(`/movie/${tmdbId}/videos`, {
    params: { language: 'vi-VN' },
  });
  let trailer = data.results.find(
    (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
  );
  // Fallback to English trailers
  if (!trailer) {
    const { data: enData } = await tmdbApi.get(`/movie/${tmdbId}/videos`, {
      params: { language: 'en-US' },
    });
    trailer = enData.results.find(
      (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
    );
  }
  return trailer?.key || null;
};

export const syncMoviesToDB = async () => {
  if (!TMDB_API_KEY) {
    console.log('[TMDB] Chưa cấu hình TMDB_API_KEY trong .env');
    return { created: 0, updated: 0 };
  }

  let created = 0;
  let updated = 0;

  const [nowPlaying, upcoming] = await Promise.all([
    fetchNowPlayingMovies(),
    fetchUpcomingMovies(),
  ]);

  const allMovies = [
    ...nowPlaying.map((m: any) => ({ ...m, _status: 'NOW_SHOWING' as const })),
    ...upcoming.map((m: any) => ({ ...m, _status: 'COMING_SOON' as const })),
  ];

  // Deduplicate by tmdb id
  const seen = new Set<number>();
  const uniqueMovies = allMovies.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  for (const movie of uniqueMovies) {
    try {
      const existing = await prisma.movie.findUnique({
        where: { tmdb_id: movie.id },
      });

      const [detail, credits, trailerKey] = await Promise.all([
        fetchMovieDetail(movie.id),
        fetchMovieCredits(movie.id),
        fetchMovieVideos(movie.id),
      ]);

      const movieData = {
        tmdb_id: movie.id,
        title: detail.title || movie.title,
        original_title: detail.original_title || movie.original_title,
        overview: detail.overview || movie.overview || 'Chưa có mô tả.',
        poster_url: movie.poster_path
          ? TMDB_IMAGE_BASE + movie.poster_path
          : '',
        backdrop_url: movie.backdrop_path
          ? TMDB_BACKDROP_BASE + movie.backdrop_path
          : '',
        trailer_key: trailerKey,
        genres: detail.genres?.map((g: any) => g.name) || [],
        cast: credits.cast.map((c: any) => ({
          name: c.name,
          character: c.character,
          profile_path: c.profile_path
            ? TMDB_IMAGE_BASE + c.profile_path
            : null,
        })),
        director: credits.director,
        duration: detail.runtime || 0,
        rating: detail.vote_average || 0,
        language: detail.original_language || 'en',
        status: movie._status,
        release_date: detail.release_date
          ? new Date(detail.release_date)
          : new Date(),
      };

      if (existing) {
        await prisma.movie.update({
          where: { tmdb_id: movie.id },
          data: movieData,
        });
        updated++;
      } else {
        await prisma.movie.create({ data: movieData });
        created++;
      }

      // Rate-limit to avoid TMDB throttle
      await new Promise((r) => setTimeout(r, 250));
    } catch (err: any) {
      console.error(
        `[TMDB] Lỗi đồng bộ phim ${movie.title} (${movie.id}):`,
        err.message
      );
    }
  }

  console.log(`[TMDB] Đã đồng bộ ${created} phim mới, cập nhật ${updated} phim`);
  return { created, updated };
};
