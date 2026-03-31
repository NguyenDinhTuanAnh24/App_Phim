import dayjs from 'dayjs';

export const formatDate = (value?: string | Date | null) => {
  if (!value) return '';
  return dayjs(value).format('DD/MM/YYYY');
};