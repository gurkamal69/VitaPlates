import React, { useState, useContext } from 'react';
import { AuthContext } from '../API_LoginAndOtherFiles/AuthContext';
import MealTable from '../components/MealTable';
import MealSearchModal from '../components/MealSearchModal';
import MealDetailsModal from '../components/MealDetailsModal';
import CustomizeTableModal from '../components/CustomizeTableModal';
import axios from 'axios';
import "@copilotkit/react-ui/styles.css";
import '../styles/MealPlanning.css';
import '../styles/Home.css';

const SPOONACULAR_API_KEY =  import.meta.env.REACT_APP_SPOONACULAR_API_KEY || '779f8e7d8d56469d8fad52233912f6e2';

const fetchMealData = async (query) => {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?query=${query}&addRecipeNutrition=true&apiKey=${SPOONACULAR_API_KEY}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch meal data from Spoonacular API.');
    }
    const data = await response.json();
    return data.results.map(meal => ({
      ...meal,
      name: meal.title, // Standardize to 'name'
      calories: meal.nutrition?.nutrients.find(n => n.name === 'Calories')?.amount || 0,
      protein: meal.nutrition?.nutrients.find(n => n.name === 'Protein')?.amount || 0,
      carbs: meal.nutrition?.nutrients.find(n => n.name === 'Carbohydrates')?.amount || 0,
    })) || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const MealPlanning = () => {
  const { currentUser } = useContext(AuthContext);
  const [mealData, setMealData] = useState(
    Array(3).fill().map(() => Array(7).fill([]))
  );
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [error, setError] = useState(null);

  const handleAddMeal = (rowIndex, colIndex) => {
    console.log('Adding meal to row:', rowIndex, 'col:', colIndex);
    setSelectedCell({ rowIndex, colIndex });
    setIsSearchModalOpen(true);
  };

  const handleSelectMeal = (meal) => {
    console.log('Selected meal:', meal);
    console.log('Selected cell:', selectedCell);
    const newMealData = [...mealData];
    newMealData[selectedCell.rowIndex][selectedCell.colIndex] = [
      ...newMealData[selectedCell.rowIndex][selectedCell.colIndex],
      meal,
    ];
    console.log('Updated mealData:', JSON.stringify(newMealData, null, 2));
    setMealData(newMealData);
    setIsSearchModalOpen(false);
  };

  const handleRemoveMeal = (rowIndex, colIndex, mealIndex) => {
    const newMealData = [...mealData];
    newMealData[rowIndex][colIndex] = newMealData[rowIndex][colIndex].filter(
      (_, index) => index !== mealIndex
    );
    setMealData(newMealData);
    if (
      selectedCell &&
      selectedCell.rowIndex === rowIndex &&
      selectedCell.colIndex === colIndex
    ) {
      setSelectedMeals(newMealData[rowIndex][colIndex]);
    }
  };

  const handleViewMeal = (rowIndex, colIndex) => {
    setSelectedMeals(mealData[rowIndex][colIndex]);
    setSelectedCell({ rowIndex, colIndex });
    setIsDetailsModalOpen(true);
  };

  const handleCustomizeTable = (rows, cols) => {
    setMealData(
      Array(rows).fill().map(() => Array(cols).fill([]))
    );
  };

  const handleSaveMealPlan = async () => {
    if (!currentUser) {
      alert('Please log in to save a meal plan.');
      return;
    }

    console.log('Current user:', currentUser);
    console.log('mealData before saving:', JSON.stringify(mealData, null, 2));

    const today = new Date().toISOString().split('T')[0];
    const totalDays = mealData[0].length;
    const meals = mealData[0].map((_, dayIndex) => ({
      breakfast: mealData[0][dayIndex].length > 0 ? mealData[0][dayIndex][0].name : 'No breakfast planned',
      lunch: mealData[1][dayIndex].length > 0 ? mealData[1][dayIndex][0].name : 'No lunch planned',
      dinner: mealData[2][dayIndex].length > 0 ? mealData[2][dayIndex][0].name : 'No dinner planned',
      calories:
        mealData[0][dayIndex].length > 0 ? mealData[0][dayIndex][0].calories || 0 :
        mealData[1][dayIndex].length > 0 ? mealData[1][dayIndex][0].calories || 0 :
        mealData[2][dayIndex].length > 0 ? mealData[2][dayIndex][0].calories || 0 : 0,
      protein:
        mealData[0][dayIndex].length > 0 ? mealData[0][dayIndex][0].protein || 0 :
        mealData[1][dayIndex].length > 0 ? mealData[1][dayIndex][0].protein || 0 :
        mealData[2][dayIndex].length > 0 ? mealData[2][dayIndex][0].protein || 80 : 0,
      carbs:
        mealData[0][dayIndex].length > 0 ? mealData[0][dayIndex][0].carbs || 0 :
        mealData[1][dayIndex].length > 0 ? mealData[1][dayIndex][0].carbs || 0 :
        mealData[2][dayIndex].length > 0 ? mealData[2][dayIndex][0].carbs || 0 : 0,
    }));

    console.log('Meals to save:', meals);

    const hasMeals = meals.some(
      meal =>
        meal.breakfast !== 'No breakfast planned' ||
        meal.lunch !== 'No lunch planned' ||
        meal.dinner !== 'No dinner planned'
    );

    if (!hasMeals) {
      alert('Please add at least one meal to your plan before saving.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/mealplan/save', {
        email: currentUser.email,
        totalDays,
        date: today,
        type: 'custom',
        meals,
      });
      console.log('Save response:', response.data);
      alert('Custom meal plan saved successfully!');
    } catch (error) {
      console.error('Error saving meal plan:', error.response?.data || error.message);
      alert(`Failed to save meal plan: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="meal-planner-container">
      <div className="meal-planner-info">
        <div className="row align-items-center">
          <div className="col-md-8 que-text">
            <h2 className="fw-bold">What is VitaPlates?</h2>
            <p className="page-description">
              <b style={{ fontWeight: 800 }}>VitaPlates</b> is a purposeful and strategic approach to thoughtfully curating your meals for a defined timeframe, typically a week, to bring structure and intention to your eating habits. It encompasses meticulously selecting a variety of recipes that align with your tastes, nutritional goals, and lifestyle, while compiling a comprehensive shopping list of all necessary ingredients to ensure seamless execution.</p><p className="page-description"> Additionally, it involves carefully scheduling when each meal—breakfast, lunch, dinner, and even snacks—will be prepared or consumed, creating a harmonious rhythm整理: rhythm for you and your household. Tailored to accommodate individual preferences, specific dietary requirements, or family dynamics, <b style={{ fontWeight: 800 }}>VitaPlates</b> fosters a personalized dining experience.
            </p>
            <br/><br/>
          </div>
          <img src="diet-plan-schedule.png" className="diet-plan-schedule-png" alt="diet-plan-schedule." />
        </div>
      </div>
    
      <div className="meal-planner-controls">
        <h2>🍽️ Weekly Meal Planner</h2>
      </div>
      <div className="meal-planner-controls">
        <button
          className="meal-planner-button btn"
          onClick={() => setIsCustomizeModalOpen(true)}
        >
          Customize Table
        </button>
        <a
          className="meal-planner-button btn"
          href="/AIMeal"
        >
          AI Meal Plan
        </a>
        <button
          className="meal-planner-button btn"
          onClick={() => {
            console.log('Save Meal Plan button clicked');
            handleSaveMealPlan();
          }}
        >
          Save Meal Plan
        |</button>
      </div>
      {error && <p className="meal-planner-error">{error}</p>}
      <MealTable
        mealData={mealData}
        onAddMeal={handleAddMeal}
        onViewMeal={handleViewMeal}
        onRemoveMeal={handleRemoveMeal}
      />
      <MealSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectMeal={handleSelectMeal}
      />
      <MealDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        meals={selectedMeals}
        onChangeFood={() => {
          setIsDetailsModalOpen(false);
          setIsSearchModalOpen(true);
        }}
      />
      <CustomizeTableModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        onSubmit={handleCustomizeTable}
      />
      <br/><br/>
      <div className="meal-planner-info">
        <h2>Why is Meal Planning Important?</h2>
        <p className="page-description">
          Meal planning offers numerous benefits that enhance efficiency, health, and well-being. First, it saves time by reducing the need to make daily decisions about what to cook or eat. With a plan, grocery shopping becomes more organized, as you buy only what’s needed, avoiding unnecessary trips to the store. This efficiency also cuts costs by minimizing food waste and impulse purchases, helping you stick to a budget.</p>
        <p className="page-description">
          Meal planning promotes healthier eating habits. By choosing recipes in advance, you can ensure meals are balanced, incorporating vegetables, lean proteins, and whole grains while avoiding reliance on processed or fast foods. It’s especially valuable for those with specific dietary goals, like weight loss, managing medical conditions, or following vegetarian or vegan diets.</p>
        <p className="page-description">
          Finally, meal planning supports broader goals, whether financial, environmental, or personal. It allows for batch cooking to save energy, aligns with sustainable practices by reducing waste, and helps you stay committed to fitness or lifestyle objectives. In essence, meal planning is a practical tool for organizing life, improving health, and achieving balance in a busy world.</p>
      </div>
    </div>
  );
};

export default MealPlanning;