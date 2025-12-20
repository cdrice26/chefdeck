import { Recipe } from '@/types/Recipe';
import RecipeCard from '../recipe/RecipeCard';

interface DashboardProps {
  recipes: Recipe[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  loaderRef: React.RefObject<HTMLDivElement | null>;
  error: string;
  redirect: (url: string) => void;
  handleImageError: (
    event: React.SyntheticEvent<HTMLImageElement>,
    id: string
  ) => void;
  handleImageLoad: (id: string) => void;
}

const Dashboard = ({
  recipes,
  page,
  hasMore,
  loading,
  loaderRef,
  error,
  redirect,
  handleImageError,
  handleImageLoad
}: DashboardProps) => (
  <div className="m-4">
    <h1 className="text-2xl font-bold mb-4">Your Recipes</h1>
    {error ? (
      <div className="flex flex-col w-full h-full items-center justify-center">
        <h1 className="text-xl font-bold">Error loading recipes</h1>
        <p>Please try again later.</p>
      </div>
    ) : (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => redirect(`/recipe/${recipe.id}`)}
              onImageError={(e) => handleImageError(e, recipe.id)}
              onImageLoad={() => handleImageLoad(recipe.id)}
            />
          ))}
        </div>
        {(hasMore || loading) && (
          <div
            ref={loaderRef}
            className="flex justify-center py-4"
            style={{
              visibility: hasMore ? 'visible' : 'hidden',
              height: 40
            }}
          >
            <span>{loading && page !== 1 ? 'Loading more...' : ''}</span>
          </div>
        )}
        {loading && page === 1 && (
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-lg">Loading Recipes...</h2>
            <p>We're getting your cookbook ready!</p>
          </div>
        )}
        {!loading && recipes.length === 0 && (
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-lg">No recipes found</h2>
            <p>Start adding your recipes!</p>
          </div>
        )}
      </>
    )}
  </div>
);

export default Dashboard;
