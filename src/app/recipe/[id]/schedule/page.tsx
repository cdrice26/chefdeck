'use client';

import Button from '@/components/forms/Button';
import Input from '@/components/forms/Input';
import ResponsiveForm from '@/components/forms/ResponsiveForm';
import Card from '@/components/ui/Card';
import { useNotification } from '@/context/NotificationContext';
import useIsDark from '@/hooks/useIsDark';
import useRequireAuth from '@/hooks/useRequireAuth';
import useSchedules from '@/hooks/useSchedules';
import request from '@/utils/fetchUtils';
import getSelectStyles from '@/utils/styles/selectStyles';
import { useParams, useRouter } from 'next/navigation';
import Select from 'react-select';
import { v4 as uuid } from 'uuid';

const LABEL_CLASSES = 'flex flex-row items-center gap-2 text-nowrap';
const OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly (On Date)', value: 'monthly date' },
  { label: 'Monthly (Day of Week)', value: 'monthly day' }
];

export default function ScheduleRecipePage() {
  const router = useRouter();
  useRequireAuth(router.replace);

  const { id } = useParams() as { id: string };

  const { schedules, setSchedules } = useSchedules(id);

  const { addNotification } = useNotification();

  const isDark = useIsDark();

  const onAddSchedule = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSchedules([
      ...schedules,
      {
        id: uuid(),
        date: new Date(),
        repeat: 'none',
        endRepeat: new Date()
      }
    ]);
  };

  const onChangeValue = (key: string, id: string, newValue: any) => {
    setSchedules(
      schedules.map((schedule) =>
        schedule.id === id ? { ...schedule, [key]: newValue } : schedule
      )
    );
  };

  const onDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter((schedule) => schedule.id !== id));
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
        `/api/recipe/${id}/schedules/update`,
        'POST',
        JSON.stringify({ data: normalizedSchedules })
      );
      if (!res.ok) {
        const json = await res.json();
        addNotification(json.error.message, 'error');
        return;
      }
      addNotification('Recipe schedules updated successfully.', 'success');
      router.push(`/recipe/${id}`);
    } catch (err) {
      addNotification('Failed to update recipe schedules', 'error');
    }
  };

  return (
    <ResponsiveForm onSubmit={() => {}}>
      <h1 className="text-2xl font-bold">Manage Schedules</h1>
      {schedules &&
        schedules?.map((schedule) => (
          <Card className="p-4" key={schedule.id}>
            <div className="flex flex-col gap-2">
              <label className={LABEL_CLASSES}>
                Date:
                <Input
                  type="date"
                  value={
                    schedule.date instanceof Date
                      ? schedule.date?.toISOString().slice(0, 10)
                      : schedule.date
                  }
                  onChange={(e: React.FormEvent<HTMLInputElement>) =>
                    onChangeValue(
                      'date',
                      schedule.id,
                      e.currentTarget.value
                        ? new Date(e.currentTarget.value)
                        : null
                    )
                  }
                />
              </label>
              <label className={LABEL_CLASSES}>
                Repeat:
                <Select
                  styles={getSelectStyles(isDark)}
                  options={OPTIONS}
                  value={
                    OPTIONS.find(
                      (option) => schedule.repeat === option.value
                    ) ?? OPTIONS[0]
                  }
                  onChange={(option) =>
                    onChangeValue('repeat', schedule.id, option?.value)
                  }
                  className="w-full"
                />
              </label>
              {schedule.repeat !== 'none' && schedule.repeat && (
                <label className={LABEL_CLASSES}>
                  End On:{' '}
                  <Input
                    type="date"
                    value={
                      schedule.endRepeat instanceof Date
                        ? schedule.endRepeat.toISOString().slice(0, 10)
                        : ''
                    }
                    onChange={(e: React.FormEvent<HTMLInputElement>) =>
                      onChangeValue(
                        'endRepeat',
                        schedule.id,
                        e.currentTarget.value
                          ? new Date(e.currentTarget.value)
                          : null
                      )
                    }
                  />
                </label>
              )}
              <Button
                type="button"
                onClick={() => onDeleteSchedule(schedule.id)}
                className="mt-2 bg-red-500 text-white"
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      <Button onClick={onAddSchedule}>New Schedule</Button>
      <Button onClick={handleSubmit}>Save Changes</Button>
    </ResponsiveForm>
  );
}
