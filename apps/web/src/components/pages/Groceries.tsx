import Input from '@/components/forms/Input';
import Button from '@/components/forms/Button';
import ResponsiveForm from '@/components/forms/ResponsiveForm';
import GroceryList from '@/components/groceries/GroceryList';
import { GroceriesFetcher } from '@/hooks/fetchers/useGroceries';
import { today } from '@/utils/dateUtils';

interface GroceriesProps extends GroceriesFetcher {
  handlePrint: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Groceries = ({
  groceries,
  handleGroceriesRequest,
  handlePrint
}: GroceriesProps) => (
  <ResponsiveForm onSubmit={handleGroceriesRequest}>
    <h1 className="font-bold text-2xl mb-4">Grocery List</h1>
    <div className="flex flex-col sm:flex-row gap-4 justify-start max-w-lg w-full">
      <label className="flex flex-row w-full items-center gap-2">
        <span className="whitespace-nowrap">From:</span>
        <Input
          type="date"
          name="fromDate"
          className="w-full"
          defaultValue={today()}
        />
      </label>
      <label className="flex flex-row w-full items-center gap-2">
        <span className="whitespace-nowrap">To:</span>
        <Input
          type="date"
          name="toDate"
          className="w-full"
          defaultValue={today()}
        />
      </label>
      <Button>Get</Button>
    </div>
    <GroceryList groceries={groceries} />
    {groceries ? <Button onClick={handlePrint}>Print</Button> : <></>}
    <div className="text-xs text-gray-500 mt-4">
      Grocery list generation depends on WordNet. WordNet is a registered
      trademark of Princeton University. ChefDeck is neither associated with nor
      endorsed by Princeton University.
    </div>
    <div className="text-xs text-gray-500">
      Princeton University "About WordNet." WordNet. Princeton University. 2010.
    </div>
  </ResponsiveForm>
);

export default Groceries;
