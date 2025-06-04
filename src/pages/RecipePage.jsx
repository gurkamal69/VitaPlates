import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/RecipePage.css';

const RecipePage = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const recipeResponse = await fetch(
          `https://api.spoonacular.com/recipes/${id}/information?apiKey=779f8e7d8d56469d8fad52233912f6e2`
        );
        if (!recipeResponse.ok) {
          throw new Error('Failed to fetch recipe');
        }
        const recipeData = await recipeResponse.json();
        console.log('Recipe Data:', recipeData); // Debug API response
        const nutritionResponse = await fetch(
          `https://api.spoonacular.com/recipes/${id}/nutritionWidget.json?apiKey=779f8e7d8d56469d8fad52233912f6e2`
        );
        if (!nutritionResponse.ok) {
          throw new Error('Failed to fetch nutrition data');
        }
        const nutritionData = await nutritionResponse.json();
        console.log('Nutrition Data:', nutritionData); // Debug API response
        setRecipe(recipeData);
        setNutrition(nutritionData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="recipe-page-wrapper">
        <div className="recipe-loading">
          <div className="recipe-spinner"></div>
          <p>Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="recipe-page-wrapper">
        <div className="recipe-error">
          <h2>Oops! Something went wrong.</h2>
          <p>{error || 'Recipe not found.'}</p>
          <a href="/" className="recipe-error-button">Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-page-wrapper">
      <div className="recipe-container recipe-animate-fade-in">
        <div className="recipe-header">
          <h1 className="recipe-title">{recipe.title}</h1>
          <div className="recipe-meta">
            <span className="recipe-meta-item">
              <i className="fas fa-utensils"></i> Servings: {recipe.servings}
            </span>
            <span className="recipe-meta-item">
              <i className="fas fa-clock"></i> Ready in {recipe.readyInMinutes} mins
            </span>
          </div>
        </div>
        <div className="recipe-image-wrapper">
          <img
            src={recipe.image || '/placeholder-recipe.jpg'}
            alt={recipe.title}
            className="recipe-image recipe-animate-scale-in"
          />
        </div>
        <div className="recipe-content">
          <section className="recipe-summary">
            <h2>Overview</h2>
            <div
              className="recipe-text"
              dangerouslySetInnerHTML={{ __html: recipe.summary }}
            />
          </section>
          <section className="recipe-ingredients">
            <h2>Ingredients</h2>
            {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 ? (
              <ul className="ingredients-list">
                {recipe.extendedIngredients.map(ingredient => (
                  <li key={ingredient.id} className="ingredient-item">
                    {ingredient.original}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No ingredients available.</p>
            )}
          </section>
          <section className="recipe-nutrition">
            <h2>Nutrition Information (per serving)</h2>
            {nutrition && nutrition.nutrients ? (
              <ul className="nutrition-list">
                {nutrition.nutrients
                  .filter(nutrient => ['Calories', 'Protein', 'Carbohydrates', 'Fat'].includes(nutrient.name))
                  .map(nutrient => (
                    <li key={nutrient.name} className="nutrition-item">
                      <span className="nutrition-name">{nutrient.name}:</span>
                      <span className="nutrition-value">{nutrient.amount} {nutrient.unit}</span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p>No nutrition information available.</p>
            )}
          </section>
          <section className="recipe-instructions">
            <h2>Instructions</h2>
            <div
              className="recipe-text"
              dangerouslySetInnerHTML={{
                __html: recipe.instructions || '<p>No instructions available.</p>',
              }}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default RecipePage;