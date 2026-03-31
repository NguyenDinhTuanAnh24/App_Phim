export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api';

export const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://10.0.2.2:3000';

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
export const TMDB_API_BASE = 'https://api.themoviedb.org/3';
export const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY ?? '';

export const Colors = {
  primary: '#E50914',
  primaryGradientStart: '#B00020',
  primaryGradientEnd: '#E50914',
  primaryDark: '#B20710',
  background: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceLight: '#2A2A2A',
  glass: 'rgba(255,255,255,0.1)',
  glassStrong: 'rgba(255,255,255,0.14)',
  glassBorder: 'rgba(255,255,255,0.2)',
  shadow: 'rgba(0,0,0,0.6)',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  skeleton: '#2A2A2A',
  googleBackground: '#FFFFFF',
  googleBlue: '#4285F4',
  googleText: '#111111',
  overlayLight: 'rgba(0,0,0,0)',
  overlayDark: 'rgba(0,0,0,0.8)',
  overlayDarkStrong: 'rgba(0,0,0,0.9)',
  seat: {
    available: '#3A3A3A',
    selected: '#E50914',
    booked: '#444444',
    locked: '#F59E0B',
    vip: '#92400E',
    couple: '#831843',
  },
  tiers: {
    'Đồng': '#CD7F32',
    'Bạc': '#C0C0C0',
    'Vàng': '#FFD700',
    'Kim cương': '#B9F2FF',
  },
  admin: {
    background: '#0A0A0A',
    surface: 'rgba(255,255,255,0.08)',
    surfaceLight: 'rgba(255,255,255,0.14)',
    primary: '#E50914',
    primaryLight: '#FF4D5A',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    badge: '#B00020',
    cards: {
      revenue: 'rgba(229,9,20,0.22)',
      bookings: 'rgba(176,0,32,0.2)',
      users: 'rgba(255,255,255,0.08)',
      movies: 'rgba(255,255,255,0.1)',
    },
  },
};

export const MAX_SEATS = 8;
export const SEAT_LOCK_SECONDS = 600;
