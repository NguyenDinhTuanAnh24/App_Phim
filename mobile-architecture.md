# Mobile App Architecture - Movie Booking (React Native)

## Tech Stack
- **Framework**: React Native + TypeScript (Expo SDK 51)
- **Navigation**: Expo Router v3 (file-based routing) + React Navigation v6
- **UI**: NativeWind v4 (Tailwind for RN) + React Native Paper
- **State**: Zustand
- **HTTP**: Axios + TanStack Query v5
- **Realtime**: Socket.io-client
- **Storage**: AsyncStorage (token) + SecureStore (sensitive)
- **QR**: expo-camera (scan) + react-native-qrcode-svg (display)
- **Maps**: react-native-maps (cinema locations)
- **Payment**: expo-web-browser (VNPay URL) + Linking
- **Notifications**: expo-notifications (push)
- **Image**: expo-image (lazy load posters)

## Directory Structure
```
movie-booking/
├── backend/          # Backend API (existing)
└── mobile/
    ├── app/
    │   ├── (auth)/           # Auth screens (login, register, otp)
    │   ├── (tabs)/           # Bottom tab navigator
    │   │   ├── _layout.tsx   # Tab config
    │   │   ├── index.tsx     # Home
    │   │   ├── search.tsx    # Search
    │   │   ├── tickets.tsx   # My tickets
    │   │   └── profile.tsx   # Profile
    │   ├── movie/[id].tsx    # Movie details
    │   ├── showtime/[id].tsx # Select showtime
    │   ├── booking/
    │   │   ├── seats/[showtimeId].tsx  # Seat selection (realtime)
    │   │   ├── food.tsx      # Select combo
    │   │   ├── checkout.tsx  # Confirm + payment
    │   │   └── success/[id].tsx        # Success + QR
    │   ├── cinema/[id].tsx   # Cinema details + map
    │   ├── _layout.tsx       # Root layout (auth guard)
    │   └── +not-found.tsx
    ├── components/
    │   ├── home/
    │   │   ├── BannerCarousel.tsx
    │   │   ├── MovieCard.tsx
    │   │   ├── MovieSection.tsx
    │   │   └── GenreFilter.tsx
    │   ├── booking/
    │   │   ├── SeatMap.tsx
    │   │   ├── SeatLegend.tsx
    │   │   ├── CountdownTimer.tsx
    │   │   ├── FoodComboCard.tsx
    │   │   └── QRTicket.tsx
    │   ├── cinema/
    │   │   ├── ShowtimeGrid.tsx
    │   │   └── CinemaMap.tsx
    │   └── ui/
    │       ├── BottomSheet.tsx
    │       ├── SkeletonLoader.tsx
    │       └── Toast.tsx
    ├── hooks/
    │   ├── useSocket.ts
    │   ├── useBooking.ts
    │   ├── useMovies.ts
    │   └── useAuth.ts
    ├── stores/
    │   ├── authStore.ts
    │   ├── bookingStore.ts
    │   └── socketStore.ts
    ├── services/
    │   ├── api.ts
    │   ├── auth.service.ts
    │   ├── movie.service.ts
    │   ├── booking.service.ts
    │   └── payment.service.ts
    ├── constants/
    │   ├── colors.ts
    │   └── config.ts
    └── app.json
```

## Navigation Flow

### Root Layout (_layout.tsx)
- Check token in SecureStore
- If not logged in → redirect to (auth)/login
- If logged in → redirect to (tabs)/

### Booking Stack Flow
```
(tabs)/index → movie/[id] → showtime/[id] → booking/seats/[showtimeId]
→ booking/food → booking/checkout → booking/success/[id]
```

### Bottom Tabs
- 🏠 Home → (tabs)/index
- 🔍 Search → (tabs)/search
- 🎫 Tickets → (tabs)/tickets (requires auth)
- 👤 Profile → (tabs)/profile (requires auth)

### Modal Screens (presentModal)
- Date picker
- City/Cinema selector
- Filter (genre, format)
- QR Scanner (for staff)

## Key Screens

### 1. Home (tabs)/index.tsx
- Horizontal banner carousel (movie posters)
- "Hot Movies" section
- "Coming Soon" section
- Genre filter chips
- Pull-to-refresh

### 2. Movie Details movie/[id].tsx
- Full-screen backdrop image
- Poster with overlay info
- Trailer button (YouTube/WebBrowser)
- Rating, genre, duration, language
- Collapsible description
- Cast list (horizontal scroll)
- Sticky "BOOK NOW" CTA

### 3. Showtime Selection showtime/[id].tsx
- Date picker (7 days)
- Cinema selector dropdown
- Showtime grid by hour
- Color-coded badges (availability)
- Format filter: 2D | 3D | IMAX
- Language: Vietsub | Dubbed

### 4. Seat Selection booking/seats/[showtimeId].tsx
- 2D scrollable seat map (pinch-to-zoom)
- Seat colors:
  - Gray = Available
  - Red = Booked
  - Yellow = Locked (by someone)
  - Blue = Selected
  - Purple = VIP
- Socket.io realtime: seatLocked, seatUnlocked, seatBooked
- Max 8 seats per booking
- 10-minute countdown timer
- Bottom bar: selected seats + total + Continue

### 5. Food Combo booking/food.tsx
- FlatList of food combos (image, name, price)
- Quantity controls
- Real-time total

### 6. Checkout booking/checkout.tsx
- Summary: movie, cinema, time, seats, combo
- Voucher input + API validation
- Payment method: VNPay | Momo | ATM Card
- Final total after discount
- "PAY" button → opens VNPay via expo-web-browser

### 7. Success booking/success/[id].tsx
- Confetti animation
- Large QR code
- Ticket info: movie, cinema, seats, date/time
- "Save to Photos" button
- "Go Home" button

### 8. My Tickets (tabs)/tickets.tsx
- Tabs: Upcoming | Watched | Cancelled
- TicketCard: poster + info + status
- Tap → fullscreen QR

### 9. Profile (tabs)/profile.tsx
- Avatar + name + email
- Loyalty points progress bar
- Menu: Personal info | Change password | Notifications | Logout

## Socket.io Realtime Seats

```typescript
// useSocket.ts
const socket = io(SOCKET_URL, { auth: { token } })

// On entering seat selection:
socket.emit('joinShowtime', showtimeId)

// Listen for:
socket.on('seatLocked', ({ seatId, lockedBy }) => {
  // Update UI: seatId becomes yellow
})

socket.on('seatUnlocked', ({ seatId }) => {
  // Update UI: seatId becomes gray
})

socket.on('seatBooked', ({ seatId }) => {
  // Update UI: seatId becomes red permanently
})

// On leaving:
socket.emit('leaveShowtime', showtimeId)
```

## Required Packages

```bash
# Expo
npx create-expo-app mobile --template blank-typescript
expo install expo-router expo-secure-store expo-image expo-camera \
  expo-media-library expo-notifications expo-web-browser expo-linking \
  react-native-maps react-native-gesture-handler react-native-reanimated \
  react-native-safe-area-context react-native-screens

# NPM
npm install @react-navigation/native @react-navigation/bottom-tabs \
  @react-navigation/stack @gorhom/bottom-sheet nativewind zustand \
  axios @tanstack/react-query socket.io-client \
  react-native-qrcode-svg react-native-confetti-cannon \
  react-native-paper dayjs react-native-skeleton-placeholder
```

## Implementation Notes

- Use Expo Go for quick testing, EAS Build for production
- Handle Android back button correctly in booking flow
- SeatMap needs react-native-gesture-handler for pinch-to-zoom
- VNPay opens via expo-web-browser → deep link callback
- Deep link scheme: `movieapp://payment/return?vnp_ResponseCode=00`
- Add "movieapp" scheme and intentFilters in app.json
- Auto-refresh token via Axios interceptor
- Offline mode: show cached data, toast "No network"
