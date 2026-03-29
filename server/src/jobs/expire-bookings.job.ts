import cron from 'node-cron';
import { cancelExpiredBookings } from '../services/booking.service';

export const startExpireBookingsJob = () => {
  // Run every minute to check for expired bookings
  cron.schedule('* * * * *', async () => {
    try {
      const expiredCount = await cancelExpiredBookings();
      if (expiredCount > 0) {
        console.log(`Cancelled ${expiredCount} expired bookings`);
      }
    } catch (error) {
      console.error('Error in expire-bookings job:', error);
    }
  });

  console.log('Expire bookings cron job started');
};