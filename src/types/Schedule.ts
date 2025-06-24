export interface Schedule {
  id: string;
  date: Date;
  repeat: 'none' | 'weekly' | 'monthly date' | 'monthly day';
  endRepeat: null | Date;
}
