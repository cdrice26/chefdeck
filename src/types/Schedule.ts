export type Repeat = 'none' | 'weekly' | 'monthly date' | 'monthly day';
export interface Schedule {
  id: string;
  date: Date;
  repeat: Repeat;
  endRepeat: null | Date;
}

export const isValidRepeat = (repeat: string): repeat is Repeat =>
  ['none', 'weekly', 'monthly date', 'monthly day'].includes(repeat);
