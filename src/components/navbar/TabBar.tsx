import { Recipe } from '@/types/Recipe';
import Tab from './Tab';
import { usePathname, useRouter } from 'next/navigation';

interface TabBarProps {
  currentRecipe?: Recipe | null;
}

const TabBar = ({ currentRecipe }: TabBarProps) => {
  const url = usePathname();
  const router = useRouter();
  return (
    <div className='flex flex-row justify-center items-center gap-4'>
      <ul className='flex flex-row justify-center items-center gap-4 bg-gray-100 rounded-full p-2 shadow-md dark:bg-[#222]'>
        <Tab
          label='Recipes'
          isActive={url === '/dashboard'}
          onClick={() => router.push('/dashboard')}
        />
        {currentRecipe && (
          <Tab
            label={currentRecipe.title}
            isActive={url === `/recipes/${currentRecipe.id}`}
            onClick={() =>
              (window.location.href = `/recipes/${currentRecipe.id}`)
            }
          />
        )}
        <Tab
          label='Schedule'
          isActive={url === '/schedule'}
          onClick={() => router.push('/schedule')}
        />
        <Tab
          label='Groceries'
          isActive={url === '/groceries'}
          onClick={() => router.push('/groceries')}
        />
      </ul>
    </div>
  );
};

export default TabBar;
