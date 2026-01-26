import { ScheduleMutator } from '@/hooks/mutators/useScheduleMutator';
import { Schedule } from '@/types/Schedule';
import getSelectStyles from '@/utils/styles/getSelectStyles';
import Input from '../forms/Input';
import Select from 'react-select';
import Button from '../forms/Button';
import ResponsiveForm from '../forms/ResponsiveForm';
import Card from '../ui/Card';

const LABEL_CLASSES = 'flex flex-row items-center gap-2 text-nowrap';
const OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly (On Date)', value: 'monthly date' },
  { label: 'Monthly (Day of Week)', value: 'monthly day' }
];

interface ManageSchedulesProps extends ScheduleMutator {
  error: Error | null;
  isLoading: boolean;
  schedules: Schedule[] | null;
  isDark: boolean;
}

const ManageSchedules = ({
  onChangeValue,
  onDeleteSchedule,
  onAddSchedule,
  handleSubmit,
  error,
  isLoading,
  schedules,
  isDark
}: ManageSchedulesProps) => (
  <ResponsiveForm onSubmit={() => {}}>
    <h1 className="text-2xl font-bold">Manage Schedules</h1>
    {error && <p className="text-red-500">Error loading schedules.</p>}
    {isLoading && <p className="text-gray-500">Loading...</p>}
    {schedules &&
      !isLoading &&
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
                  OPTIONS.find((option) => schedule.repeat === option.value) ??
                  OPTIONS[0]
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

export default ManageSchedules;
