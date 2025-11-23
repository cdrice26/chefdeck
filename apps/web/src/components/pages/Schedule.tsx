import {
  RecipeDate,
  ScheduledRecipes
} from '@/hooks/fetchers/useScheduledRecipes';
import { ScheduleDisplay } from '@/types/Schedule';
import { MONTHS } from '@/utils/dateUtils';
import { getButtonColorClass, isValidColor } from '@/utils/styles/colorUtils';
import getSelectStyles from '@/utils/styles/selectStyles';
import dynamic from 'next/dynamic';
import { IoHome, IoChevronBack, IoChevronForward } from 'react-icons/io5';

const Select = dynamic(() => import('react-select'), { ssr: false });

interface ScheduleProps extends ScheduledRecipes {
  handleButtonClick: (id: string) => void;
  isDark: boolean;
}

const Schedule = ({
  error,
  isLoading,
  recipesOnDates,
  setYearInput,
  setMonth,
  year,
  yearInput,
  month,
  handleButtonClick,
  isDark
}: ScheduleProps) => (
  <>
    <div className="w-full h-full flex flex-col">
      <h1 className="p-2 flex flex-row items-center justify-center gap-2 relative">
        <button
          className="h-full px-3"
          onClick={() => {
            setYearInput(new Date().getFullYear());
            setMonth(new Date().getMonth());
          }}
        >
          <IoHome size={20} />
        </button>
        <button
          className="h-full px-3"
          onClick={() => {
            if (month === 0) {
              setMonth(11);
              setYearInput((oldYear: number) => oldYear - 1);
            } else setMonth((oldMonth: number) => oldMonth - 1);
          }}
        >
          <IoChevronBack size={20} />
        </button>
        <Select
          options={MONTHS}
          value={MONTHS.find((mon) => mon.value === month)}
          onChange={(option) => setMonth((option as { value: number })?.value)}
          className="box-border h-full flex-grow max-w-100"
          styles={getSelectStyles(isDark)}
          isSearchable={false}
          isClearable={false}
        />
        <input
          type="number"
          value={yearInput}
          onChange={(e: React.FormEvent<HTMLInputElement>) =>
            setYearInput(parseInt(e?.currentTarget?.value))
          }
          onBlur={() => setYearInput(year)}
          min={1900}
          max={9999}
          className="rounded-md border-gray-300 dark:border-white dark:bg-[#333] border-1 h-full p-1 flex-grow max-w-50"
        />
        <button
          className="h-full px-3"
          onClick={() => {
            if (month === 11) {
              setMonth(0);
              setYearInput((oldYear) => oldYear + 1);
            } else setMonth((oldMonth) => oldMonth + 1);
          }}
        >
          <IoChevronForward size={20} />
        </button>
      </h1>
      {error && (
        <p className="text-red-500 flex w-full h-full justify-center items-center">
          Error loading schedule.
        </p>
      )}
      {isLoading && (
        <p className="text-gray-500 flex w-full h-full justify-center items-center">
          Loading schedule...
        </p>
      )}
      {!isLoading && !error && (
        <div className="grid grid-cols-7 w-full flex-grow">
          {recipesOnDates?.map((date: RecipeDate, index: number) => (
            <div key={index} className="w-full h-full p-1 overflow-y-auto">
              <h1>{date?.date?.getDate() ?? ''}</h1>
              {date.recipes.map((recipe: ScheduleDisplay, index: number) => (
                <button
                  key={index}
                  className={`${getButtonColorClass(
                    isValidColor(recipe?.recipeColor)
                      ? recipe?.recipeColor
                      : 'white'
                  )} w-full p-1 rounded-lg text-left shadow-md text-xs md:text-lg hyphens-auto`}
                  onClick={() => handleButtonClick(recipe?.recipeId)}
                >
                  {recipe?.recipeTitle}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  </>
);

export default Schedule;
