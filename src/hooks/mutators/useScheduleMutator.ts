import { NotificationKind } from '@/context/NotificationContext';
import { Schedule } from '@/types/Schedule';
import request from '@/utils/fetchUtils';
import { KeyedMutator } from 'swr';
import { v4 as uuid } from 'uuid';

export interface ScheduleMutator {
  onAddSchedule: (e: React.FormEvent<HTMLButtonElement>) => void;
  onChangeValue: (key: string, id: string, newValue: any) => void;
  onDeleteSchedule: (id: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLButtonElement>) => Promise<void>;
}

/**
 * Hook for managing schedules
 *
 * @param redirect - Function to redirect to new URL
 * @param addNotification - Function to add notification
 * @param recipeId - ID of the recipe to schedule
 * @param schedules - Array of schedules
 * @param setSchedules - Function to update schedules
 * @returns an object with the following properties:
 * - onAddSchedule: Function to add a new schedule
 * - onChangeValue: Function to change the value of a schedule
 * - onDeleteSchedule: Function to delete a schedule
 * - handleSubmit: Function to submit the form
 */
const useScheduleMutator = (
  redirect: (url: string) => void,
  addNotification: (message: string, type: NotificationKind) => void,
  recipeId: string,
  schedules: Schedule[],
  setSchedules: KeyedMutator<Schedule[]>
) => {
  const onAddSchedule = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSchedules(
      (prevSchedules) => [
        ...(prevSchedules ?? []),
        {
          id: uuid(),
          date: new Date(),
          repeat: 'none',
          endRepeat: new Date()
        }
      ],
      { revalidate: false }
    );
  };

  const onChangeValue = (key: string, id: string, newValue: any) => {
    setSchedules(
      (prevSchedules) =>
        (prevSchedules ?? []).map((schedule) =>
          schedule.id === id ? { ...schedule, [key]: newValue } : schedule
        ),
      { revalidate: false }
    );
  };

  const onDeleteSchedule = (id: string) => {
    setSchedules(
      (prevSchedules) =>
        (prevSchedules ?? []).filter((schedule) => schedule.id !== id),
      { revalidate: false }
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Convert all Date objects to YYYY-MM-DD strings before sending
    const normalizedSchedules = schedules.map((s) => ({
      ...s,
      date: s.date instanceof Date ? s.date.toISOString().slice(0, 10) : '',
      endRepeat:
        s.endRepeat instanceof Date
          ? s.endRepeat.toISOString().slice(0, 10)
          : null
    }));
    try {
      const res = await request(
        `/api/recipe/${recipeId}/schedules/update`,
        'POST',
        JSON.stringify({ data: normalizedSchedules })
      );
      if (!res.ok) {
        const json = await res.json();
        addNotification(json.error.message, 'error');
        return;
      }
      addNotification('Recipe schedules updated successfully.', 'success');
      redirect(`/recipe/${recipeId}`);
    } catch (err) {
      addNotification('Failed to update recipe schedules', 'error');
    }
  };

  return {
    onChangeValue,
    onDeleteSchedule,
    onAddSchedule,
    handleSubmit
  };
};

export default useScheduleMutator;
