'use client';

import useIsDark from '@/hooks/useIsDark';
import useRequireAuth from '@/hooks/useRequireAuth';
import useScheduledRecipes from '@/hooks/useScheduledRecipes';
import { ScheduleDisplay } from '@/types/Schedule';
import { getDatesBetween, getDaysInMonth, MONTHS } from '@/utils/dateUtils';
import { getButtonColorClass, isValidColor } from '@/utils/styles/colorUtils';
import getSelectStyles from '@/utils/styles/selectStyles';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const Select = dynamic(() => import('react-select'), { ssr: false });

const Schedule = () => {
  useRequireAuth();
  const { scheduledRecipes, setStartDate, setEndDate, startDate, endDate } =
    useScheduledRecipes();
  const router = useRouter();
  const isDark = useIsDark();

  const [year, setYear] = useState(new Date().getFullYear());
  const [yearInput, setYearInput] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  useEffect(() => {
    setStartDate(new Date(year, month, 1));
    setEndDate(new Date(year, month, getDaysInMonth(year, month)));
  }, [year, month]);

  useEffect(() => {
    if (yearInput < 10000 && yearInput >= 1900 && !isNaN(yearInput)) {
      setYear(yearInput);
    }
  }, [yearInput]);

  const recipesOnDates = useMemo(() => {
    const daysBefore = startDate.getDay();
    const daysAfter = 6 - endDate.getDay();
    const daysInMonth = getDatesBetween(startDate, endDate);

    return [
      ...new Array(daysBefore)
        .fill(null)
        .map(() => ({ date: null, recipes: [] })),
      ...daysInMonth.map((date) => ({
        date,
        recipes: scheduledRecipes.filter((recipe) => {
          const s = recipe.scheduledDate;
          return (
            s.getFullYear() === date.getFullYear() &&
            s.getMonth() === date.getMonth() &&
            s.getDate() === date.getDate()
          );
        })
      })),
      ...new Array(daysAfter)
        .fill(null)
        .map(() => ({ date: null, recipes: [] }))
    ];
  }, [scheduledRecipes, startDate, endDate]);

  const handleButtonClick = (id: string) => {
    router.push(`/recipe/${id}`);
  };

  return (
    <div className='w-full h-full flex flex-col'>
      <h1 className='p-2 flex flex-row items-center gap-2 relative'>
        <Select
          options={MONTHS}
          value={MONTHS.find((mon) => mon.value === month)}
          onChange={(option) => setMonth((option as { value: number })?.value)}
          className='box-border h-full'
          styles={getSelectStyles(isDark)}
        />
        <input
          type='number'
          value={yearInput}
          onChange={(e: React.FormEvent<HTMLInputElement>) =>
            setYearInput(parseInt(e?.currentTarget?.value))
          }
          onBlur={() => setYearInput(year)}
          min={1900}
          max={9999}
          className='rounded-md border-gray-300 dark:border-white dark:bg-[#333] border-1 h-full p-1 w-20'
        />
      </h1>
      <div className='grid grid-cols-7 w-full flex-grow'>
        {recipesOnDates.map((date, index) => (
          <div key={index} className='w-full h-full p-1 overflow-y-auto'>
            <h1>{date?.date?.getDate() ?? ''}</h1>
            {date.recipes.map((recipe: ScheduleDisplay, index) => (
              <button
                key={index}
                className={`${getButtonColorClass(
                  isValidColor(recipe?.recipeColor)
                    ? recipe?.recipeColor
                    : 'white'
                )} w-full p-1 rounded-lg text-left shadow-md text-xs md:text-md hyphens-auto`}
                onClick={() => handleButtonClick(recipe?.recipeId)}
              >
                {recipe?.recipeTitle}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
