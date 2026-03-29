import { Prisma } from '@prisma/client';

// Booking types
export type BookingWithDetails = Prisma.BookingGetPayload<{
  include: {
    showtime: {
      include: {
        movie: {
          select: {
            title: true,
            poster_url: true,
            duration: true,
          }
        },
        room: {
          include: {
            cinema: {
              select: {
                name: true,
                address: true,
              }
            }
          }
        }
      }
    },
    booking_items: {
      include: {
        seat: {
          select: {
            row: true,
            col: true,
            type: true,
          }
        }
      }
    },
    food_items: {
      include: {
        combo: {
          select: {
            name: true,
            price: true,
          }
        }
      }
    },
    user: {
      select: {
        name: true,
        email: true,
      }
    }
  }
}>

export type SeatType = 'STANDARD' | 'VIP' | 'COUPLE' | 'DISABLED';

// Request types for Express
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export {};