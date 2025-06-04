import React, { useEffect, useState, useContext } from "react";
import { Link } from 'react-router-dom';
import { AuthContext } from '../API_LoginAndOtherFiles/AuthContext';
import CustomizeTableModal from '../components/CustomizeTableModal';
import axios from 'axios';
import '../styles/PrePlannedMeals.css';

const PrePlannedMeals = () => {
  const { currentUser } = useContext(AuthContext);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(7);

  const fetchMealPlan = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.spoonacular.com/mealplanner/generate?timeFrame=week&targetCalories=2000&healthy&apiKey=779f8e7d8d56469d8fad52233912f6e2`
      );
      const data = await response.json();
      setMealPlan(data.week);
    } catch (error) {
      console.error("Failed to fetch meal plan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMealPlan();
  }, []);

  const handleCustomizeTable = (newRows, newCols) => {
    setRows(newRows);
    setCols(newCols);
  };

  const handleSaveAIMealPlan = async () => {
    if (!currentUser) {
      alert('Please log in to save a meal plan.');
      return;
    }

    if (!mealPlan) {
      alert('No meal plan to save. Please generate a meal plan first.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const days = Object.keys(mealPlan);
    const totalDays = days.length;
    const meals = days.map(dayKey => {
      const mealsForDay = mealPlan[dayKey]?.meals || [];
      return {
        breakfast: mealsForDay[0]?.title || 'No breakfast planned',
        lunch: mealsForDay[1]?.title || 'No lunch planned',
        dinner: mealsForDay[2]?.title || 'No dinner planned',
        calories: 0,
        protein: 0,
        carbs: 0
      };
    });

    try {
      await axios.post('http://localhost:5000/api/mealplan/save', {
        email: currentUser.email,
        totalDays,
        date: today,
        type: 'ai',
        meals
      });
      alert('AI meal plan saved successfully!');
    } catch (error) {
      console.error('Error saving AI meal plan:', error);
      alert('Failed to save AI meal plan.');
    }
  };

  const days = Array.from({ length: cols }, (_, i) => `day${i + 1}`);
  const mealTypes = Array.from({ length: rows }, (_, i) => `MEAL ${i + 1}`);

  return (
    <div className="PrePlannedcontainer">
      <div className="PrePlannedheader">
        <h1 className="PrePlannedtitle">Your Weekly Meal Plan</h1>
        <div>
          <button className="PrePlannedgenerate-btn btn" onClick={fetchMealPlan}>
            Generate New Plan
          </button>
          <button
            className="PrePlannedgenerate-btn btn"
            onClick={() => setIsCustomizeModalOpen(true)}
          >
            Customize Table
          </button>
          <button
            className="PrePlannedgenerate-btn btn"
            onClick={handleSaveAIMealPlan}
          >
            Save Meal Plan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="PrePlannedloading">
          <div className="PrePlannedspinner"></div>
          <p>Loading your meal plan...</p>
        </div>
      ) : mealPlan ? (
        <div className="PrePlannedmeals-grid">
          <table className="PrePlannedmeal-table">
            <thead>
              <tr>
                <th className="PrePlannedtable-header">DAYS</th>
                {days.map(day => (
                  <th key={day} className="PrePlannedtable-header">
                    {day.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mealTypes.map((mealType, mealIndex) => (
                <tr key={mealType} className="PrePlannedtable-row">
                  <td className="PrePlannedmeal-type"><strong>{mealType}</strong></td>
                  {days.map(day => {
                    const mealsForDay = mealPlan[Object.keys(mealPlan)[days.indexOf(day)]]?.meals || [];
                    const meal = mealsForDay[mealIndex];
                    return (
                      <td key={`${day}-${mealType}`} className="PrePlannedtable-cell">
                        {meal ? (
                          <div className="PrePlannedmeal-card">
                            <img
                              src={`https://spoonacular.com/recipeImages/${meal.id}-312x231.jpg`}
                              alt={meal.title}
                              className="PrePlannedmeal-img"
                            />
                            <Link to={`/recipe/${meal.id}`} className="PrePlannedview-recipe-link">
                              {meal.title}
                            </Link>
                          </div>
                        ) : (
                          <div className="PrePlannedno-meal">
                            <span className="PrePlannedplaceholder-icon">📝</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="PrePlannederror">
          <p>No meal plan found. Please try generating a new plan.</p>
        </div>
      )}
      <CustomizeTableModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        onSubmit={handleCustomizeTable}
      />
    </div>
  );
};

export default PrePlannedMeals;