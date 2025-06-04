import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import axios from 'axios';

const SPOONACULAR_API_KEY =  import.meta.env.REACT_APP_SPOONACULAR_API_KEY || '779f8e7d8d56469d8fad52233912f6e2';

// Custom debounce function
const debounce = (func, delay) => {
  let timeoutId;
  const debounced = (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
};

const MealSearchModal = ({ isOpen, onClose, onSelectMeal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);

  // Define the debounced function
  const debouncedFetchResults = useRef(
    debounce(async (term) => {
      if (term.length < 2) {
        setSearchResults([]);
        setError(null);
        console.log('Search term too short:', term);
        return;
      }

      try {
        console.log('Making API call with term:', term);
        const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
          params: { query: term, number: 5, addRecipeNutrition: true, apiKey: SPOONACULAR_API_KEY },
        });
        console.log('Spoonacular search response:', response.data);
        const results = response.data.results.map(meal => ({
          ...meal,
          name: meal.title, // Standardize to 'name'
          calories: meal.nutrition?.nutrients.find(n => n.name === 'Calories')?.amount || 0,
          protein: meal.nutrition?.nutrients.find(n => n.name === 'Protein')?.amount || 0,
          carbs: meal.nutrition?.nutrients.find(n => n.name === 'Carbohydrates')?.amount || 0,
        }));
        setSearchResults(results || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching search results:', err.response?.data || err.message);
        let errorMessage = 'Failed to fetch meals. Showing fallback options.';
        if (err.response?.status === 401) {
          errorMessage = 'Invalid API key. Please check your Spoonacular API key.';
        } else if (err.response?.status === 402) {
          errorMessage = 'API quota exceeded. Try again later or upgrade your plan.';
        } else if (err.response?.status === 429) {
          errorMessage = 'Too many requests. Please try again later.';
        }
        setError(errorMessage);
      }
    }, 500)
  ).current;

  useEffect(() => {
    debouncedFetchResults(searchTerm);
    return () => debouncedFetchResults.cancel(); // Cleanup debounce on unmount
  }, [searchTerm]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select a Meal">
      <input
        type="text"
        className="meal-planner-modal-content input"
        placeholder="Search for a meal..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {error && <p className="meal-planner-modal-error">{error}</p>}
      {!error && searchTerm.length > 1 && searchResults.length === 0 && (
        <p className="meal-planner-loading" style={{ animation: 'fadeIn 1s ease-in-out' }}>
          Loading...
        </p>
      )}
      <ul className="meal-planner-search-list">
        {searchResults.map((meal) => (
          <li
            key={meal.id}
            onClick={async () => {
              if (meal.id.toString().startsWith('dummy')) {
                onSelectMeal(meal);
                onClose();
                return;
              }

              try {
                const response = await axios.get(
                  `https://api.spoonacular.com/recipes/${meal.id}/information`,
                  { params: { apiKey: SPOONACULAR_API_KEY } }
                );
                console.log('Spoonacular details response:', response.data);
                const detailedMeal = {
                  id: meal.id,
                  name: meal.name,
                  image: meal.image,
                  ingredients: response.data.extendedIngredients?.map((ing) => ing.original) || ['Ingredients not available'],
                  recipe: response.data.instructions?.replace(/<[^>]+>/g, '') || 'No recipe available.',
                  calories: meal.calories,
                  protein: meal.protein,
                  carbs: meal.carbs,
                };
                onSelectMeal(detailedMeal);
              } catch (err) {
                console.error('Error fetching meal details:', err.response?.data || err.message);
                onSelectMeal({
                  id: meal.id,
                  name: meal.name,
                  image: meal.image,
                  ingredients: ['Ingredients not available'],
                  recipe: 'Recipe not available.',
                  calories: meal.calories,
                  protein: meal.protein,
                  carbs: meal.carbs,
                });
              }
              onClose();
            }}
            style={{ animation: 'slideIn 0.5s ease-in-out' }}
          >
            <img
              src={meal.image || 'https://dummyimage.com/50x50/cccccc/000000&text=No+Image'}
              alt={meal.name}
              className="meal-image"
              style={{ width: '50px', height: '50px', marginRight: '10px', animation: 'fadeIn 0.5s ease-in-out' }}
            />
            {meal.name}
          </li>
        ))}
      </ul>
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes slideIn {
            from {
              transform: translateX(-20px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </Modal>
  );
};

export default MealSearchModal;