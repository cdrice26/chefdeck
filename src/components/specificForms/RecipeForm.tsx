import ResponsiveForm from '@/components/forms/ResponsiveForm';
import Input from '@/components/forms/Input';
import { Direction, Ingredient, Recipe } from '@/types/Recipe';
import { useEffect, useState } from 'react';
import Button from '../forms/Button';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import SortableItem from '../forms/SortableItem';
import { v4 as uuid } from 'uuid';
import ColorSelector from '../forms/ColorSelector';
import { OptionType } from '../forms/TagSelector';
import dynamic from 'next/dynamic';
import useAvailableTags from '@/hooks/useAvailableTags';

const TagSelector = dynamic(() => import('@/components/forms/TagSelector'), {
  ssr: false
});

interface RecipeFormProps {
  handleSubmit: (e: FormData) => void;
  recipe?: Recipe | null;
}

interface StatePair {
  state: any;
  setter: React.Dispatch<React.SetStateAction<any>>;
}

/**
 * RecipeForm component
 *
 * A controlled form component for creating or updating a recipe. The form uses
 * drag-and-drop for ordering ingredients and directions (via @dnd-kit) and
 * exposes a `handleSubmit` callback that receives a populated `FormData`
 * instance containing all form values and appended tags.
 *
 * Key behavior:
 * - If a `recipe` prop is provided, the form will initialize fields (ingredients,
 *   directions, tags) from that object to support updates.
 * - Ingredients and directions are sortable and can be added/removed dynamically.
 * - Tags are managed via the `TagSelector` (creatable multi-select) and appended
 *   to the submitted FormData as `tags[]`.
 * - Color selection is handled via `ColorSelector` and included as a hidden `color` field.
 *
 * Props:
 * - `handleSubmit` (formData: FormData) => void : Callback invoked with the prepared FormData when the form is submitted.
 * - `recipe?` (Recipe | null) : Optional existing recipe to populate the form for editing.
 *
 * @param {RecipeFormProps} props - Component props
 * @returns {JSX.Element} The rendered recipe form
 */
const RecipeForm = ({ handleSubmit, recipe = null }: RecipeFormProps) => {
  const [tags, setTags] = useState<OptionType[]>([]);
  const { availableTags } = useAvailableTags();

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const ingredientSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [directions, setDirections] = useState<Direction[]>([]);

  const directionsSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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

  const addItem =
    ({ state, setter }: StatePair) =>
    () =>
      setter([...state, { id: uuid(), content: '' }]);

  const addIngredient = addItem({ state: ingredients, setter: setIngredients });
  const addDirection = addItem({ state: directions, setter: setDirections });

  const removeItem =
    ({ state, setter }: StatePair) =>
    (index: number) => {
      setter(state.filter((_: any, i: number) => i !== index));
    };

  const removeIngredient = removeItem({
    state: ingredients,
    setter: setIngredients
  });
  const removeDirection = removeItem({
    state: directions,
    setter: setDirections
  });

  const handleDrag =
    ({ state, setter }: StatePair) =>
    (event: any) => {
      const { active, over } = event;

      if (active && over) {
        const oldIndex = state.findIndex((item: any) => item.id === active.id);
        const newIndex = state.findIndex((item: any) => item.id === over.id);

        if (oldIndex !== newIndex) {
          setter((items: any[]) => {
            return arrayMove(items, oldIndex, newIndex);
          });
        }
      }
    };

  const handleIngredientDrag = handleDrag({
    state: ingredients,
    setter: setIngredients
  });

  const handleDirectionDrag = handleDrag({
    state: directions,
    setter: setDirections
  });

  const handleSubmitInternal = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    tags.forEach((tag) => formData.append('tags[]', tag.value));

    handleSubmit(formData);
  };

  useEffect(() => {
    if (recipe) {
      setIngredients(recipe.ingredients || []);
      setDirections(recipe.directions || []);
      setTags(recipe.tags?.map((tag) => ({ label: tag, value: tag })) || []);
    }
  }, [recipe]);

  return (
    <ResponsiveForm onSubmit={handleSubmitInternal}>
      {recipe && <input type="hidden" name="id" value={recipe.id} readOnly />}
      <h1 className="text-2xl font-bold">{recipe ? 'Update' : 'New'} Recipe</h1>
      <label>
        Recipe Name:{' '}
        <Input
          name="title"
          placeholder="Name"
          defaultValue={recipe?.title}
          required
        />
      </label>
      <label>
        Yield:{' '}
        <Input
          name="yield"
          placeholder="Yield"
          type="number"
          min="1"
          defaultValue={recipe?.servings}
          required
        />
      </label>
      <label>
        Image (Optional): <Input name="image" type="file" />
      </label>
      <label>
        Time (in minutes):{' '}
        <Input
          name="time"
          placeholder="Time"
          type="number"
          min="1"
          defaultValue={recipe?.minutes}
          required
        />
      </label>

      <h2>Ingredients</h2>
      <DndContext
        sensors={ingredientSensors}
        collisionDetection={closestCenter}
        onDragEnd={handleIngredientDrag}
      >
        <SortableContext
          items={ingredients.map((ingredient) => ingredient.id)}
          strategy={verticalListSortingStrategy}
        >
          {ingredients.map((ingredient, index) => (
            <SortableItem key={ingredient.id} id={ingredient.id}>
              <Input
                name={`ingredientNames`}
                placeholder="Ingredient Name"
                value={ingredient?.name ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleIngredientChange(index, 'name', e.target.value)
                }
                required
              />
              <Input
                name={`ingredientAmounts`}
                placeholder="Amount"
                type="number"
                min="0"
                step="any"
                value={ingredient?.amount ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleIngredientChange(
                    index,
                    'amount',
                    Number(e.target.value)
                  )
                }
                required
              />
              <Input
                name={`ingredientUnits`}
                placeholder="Unit (e.g., cups, grams)"
                value={ingredient?.unit ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleIngredientChange(index, 'unit', e.target.value)
                }
              />
              <Button type="button" onClick={() => removeIngredient(index)}>
                Remove
              </Button>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      <Button type="button" onClick={addIngredient}>
        Add Ingredient
      </Button>

      <h2>Directions</h2>
      <DndContext
        sensors={directionsSensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDirectionDrag}
      >
        <SortableContext
          items={directions.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {directions.map((direction, index) => (
            <SortableItem key={direction.id} id={direction.id}>
              <Input
                name={`directions`}
                placeholder={`Direction ${index + 1}`}
                value={direction?.content ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleDirectionChange(index, e.target.value)
                }
                required
              />
              <Button type="button" onClick={() => removeDirection(index)}>
                Remove
              </Button>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      <Button type="button" onClick={addDirection}>
        Add Direction
      </Button>
      <ColorSelector defaultValue={recipe?.color} />
      <TagSelector
        value={tags}
        onChange={setTags}
        initialOptions={availableTags}
      />
      <Button type="submit">{recipe ? 'Update' : 'Submit'} Recipe</Button>
    </ResponsiveForm>
  );
};

export default RecipeForm;
