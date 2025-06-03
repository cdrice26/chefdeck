import ResponsiveForm from '@/components/forms/ResponsiveForm';
import Input from '@/components/forms/Input';
import { Direction, Ingredient, Recipe } from '@/types/Recipe';
import { useState } from 'react';
import Button from '../forms/Button';

interface RecipeFormProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  recipe?: Recipe | null;
}

const RecipeForm = ({ handleSubmit, recipe = null }: RecipeFormProps) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients || []
  );
  const [directions, setDirections] = useState<Direction[]>(
    recipe?.directions || []
  );

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string | number
  ) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value
    };
    setIngredients(updatedIngredients);
  };

  const handleDirectionChange = (index: number, value: string) => {
    const updatedDirections = [...directions];
    updatedDirections[index].content = value;
    setDirections(updatedDirections);
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: null, name: '', amount: 0, unit: '' }
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addDirection = () => {
    setDirections([...directions, { id: null, content: '' }]);
  };

  const removeDirection = (index: number) => {
    setDirections(directions.filter((_, i) => i !== index));
  };

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      {recipe && <input type='hidden' name='id' value={recipe.id} readOnly />}
      <h1>New Recipe</h1>
      <label>
        Recipe Name: <Input name='title' placeholder='Name' required />
      </label>
      <label>
        Yield:{' '}
        <Input
          name='yield'
          placeholder='Yield'
          type='number'
          min='1'
          required
        />
      </label>
      <label>
        Image URL: <Input name='image' placeholder='Image URL' type='url' />
      </label>
      <label>
        Time (in minutes):{' '}
        <Input name='time' placeholder='Time' type='number' min='1' required />
      </label>

      <h2>Ingredients</h2>
      {ingredients.map((ingredient, index) => (
        <div key={index} className='flex gap-2'>
          <Input
            name={`ingredients[${index}].name`}
            placeholder='Ingredient Name'
            value={ingredient.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleIngredientChange(index, 'name', e.target.value)
            }
            required
          />
          <Input
            name={`ingredients[${index}].amount`}
            placeholder='Amount'
            type='number'
            min='0'
            value={ingredient.amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleIngredientChange(index, 'amount', Number(e.target.value))
            }
            required
          />
          <Input
            name={`ingredients[${index}].unit`}
            placeholder='Unit (e.g., cups, grams)'
            value={ingredient.unit}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleIngredientChange(index, 'unit', e.target.value)
            }
          />
          <Button type='button' onClick={() => removeIngredient(index)}>
            Remove
          </Button>
        </div>
      ))}
      <Button type='button' onClick={addIngredient}>
        Add Ingredient
      </Button>

      <h2>Directions</h2>
      {directions.map((direction, index) => (
        <div key={index} className='flex gap-2'>
          <Input
            name={`directions[${index}]`}
            placeholder={`Direction ${index + 1}`}
            value={direction.content}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleDirectionChange(index, e.target.value)
            }
            required
          />
          <Button type='button' onClick={() => removeDirection(index)}>
            Remove
          </Button>
        </div>
      ))}
      <Button type='button' onClick={addDirection}>
        Add Direction
      </Button>

      <Button type='submit'>Submit Recipe</Button>
    </ResponsiveForm>
  );
};

export default RecipeForm;
