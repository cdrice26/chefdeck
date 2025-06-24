'use client';

import Button from '@/components/forms/Button';
import Input from '@/components/forms/Input';
import ResponsiveForm from '@/components/forms/ResponsiveForm';
import Card from '@/components/ui/Card';
import useIsDark from '@/hooks/useIsDark';
import { Schedule } from '@/types/Schedule';
import getSelectStyles from '@/utils/styles/selectStyles';
import { useState } from 'react';
import Select from 'react-select';
import { v4 as uuid } from 'uuid';

const LABEL_CLASSES = 'flex flex-row items-center gap-2';
const OPTIONS = [
  { name: 'None', value: 'none' },
  { name: 'Weekly', value: 'weekly' },
  { name: 'Monthly (On Date)', value: 'monthly date' },
  { name: 'Monthly (Day of Week)', value: 'monthly day' }
];

export default function ScheduleRecipePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const isDark = useIsDark();

  const onAddSchedule = () => {
    setSchedules([
      ...schedules,
      {
        id: uuid(),
        date: new Date(),
        repeat: 'none',
        endRepeat: null
      }
    ]);
  };

  const onChangeValue = (key: string, id: string, newValue: any) => {
    setSchedules([
      ...(schedules.filter((schedule) => schedule.id !== id) as Schedule[]),
      {
        ...schedules.find((schedule) => schedule.id === id),
        [key]: newValue
      } as Schedule
    ]);
  };

  return (
    <ResponsiveForm onSubmit={() => {}}>
      <h1 className='text-2xl font-bold'>Manage Schedules</h1>
      {schedules.map((schedule) => (
        <Card className='p-4' key={schedule.id}>
          <div className='flex flex-col gap-2'>
            <label className={LABEL_CLASSES}>
              Date:{' '}
              <Input
                type='date'
                value={schedule.date}
                onChange={(e: React.FormEvent<HTMLInputElement>) =>
                  onChangeValue(
                    'date',
                    schedule.id,
                    new Date(e.currentTarget.value)
                  )
                }
              />
            </label>
            <label className={LABEL_CLASSES}>
              <Select
                styles={getSelectStyles(isDark)}
                options={OPTIONS}
                value={
                  OPTIONS.find((option) => schedule.repeat === option.value) ??
                  OPTIONS[0]
                }
                onChange={(option) =>
                  onChangeValue('repeat', schedule.id, option?.value)
                }
              />
            </label>
          </div>
        </Card>
      ))}
      <Button onClick={onAddSchedule}>New Schedule</Button>
      <Button onClick={() => {}}>Save Changes</Button>
    </ResponsiveForm>
  );
}
