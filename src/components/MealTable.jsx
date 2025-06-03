import React from 'react';
import PropTypes from 'prop-types';

const MealTable = ({ mealData, onAddMeal, onViewMeal, onRemoveMeal }) => {
  const defaultRowLabels = ['Breakfast', 'Lunch', 'Dinner'];
  const defaultColLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const FALLBACK_IMAGE = 'https://dummyimage.com/50x50/cccccc/000000&text=No+Image';
  const MAX_MEALS_PER_CELL = 3;

  console.log('MealTable mealData:', mealData);

  if (!mealData || !mealData.length || !mealData[0]) {
    console.warn('Invalid mealData: returning fallback UI');
    return <div>No meal data available. Please provide valid meal data.</div>;
  }

  return (
    <table className="meal-planner-table">
      <thead>
        <tr>
          <th>DAYS</th>
          {mealData[0].map((_, colIndex) => (
            <th key={colIndex}>
              {colIndex < defaultColLabels.length ? defaultColLabels[colIndex] : `Day ${colIndex + 1}`}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {mealData.map((row, rowIndex) => (
          <tr key={rowIndex}>
            <th>
              {rowIndex < defaultRowLabels.length ? defaultRowLabels[rowIndex] : `Meal ${rowIndex + 1}`}
            </th>
            {row.map((meals, colIndex) => (
              <td key={colIndex}>
                {meals.length > 0 ? (
                  <div className="meal-planner-table-cell-content">
                    {meals.map((meal, mealIndex) => (
                      <div
                        key={mealIndex}
                        className="meal-planner-table-meal-item"
                        onClick={() => {
                          console.log(`Clicked meal in cell (${rowIndex}, ${colIndex}):`, meal);
                          onViewMeal(rowIndex, colIndex);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            console.log(`Keyboard activated meal in cell (${rowIndex}, ${colIndex}):`, meal);
                            onViewMeal(rowIndex, colIndex);
                          }
                        }}
                        aria-label={`View details for ${meal.name || 'meal'}`}
                      >
                        <img
                          src={meal.image || FALLBACK_IMAGE}
                          alt={meal.name || 'Meal'}
                          className="meal-image"
                          onError={(e) => {
                            console.warn(`Image failed to load for meal: ${meal.name || 'unknown'}, using fallback`);
                            console.warn(`Failed URL: ${meal.image}`);
                            e.target.src = FALLBACK_IMAGE;
                          }}
                        />
                        <span className="meal-planner-table-cell-text">
                          {(meal.name || 'Unnamed Meal').length > 20
                            ? `${(meal.name || 'Unnamed Meal').slice(0, 20)}...`
                            : meal.name || 'Unnamed Meal'}
                        </span>
                        <button
                          className="meal-planner-table-remove-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(`Remove meal clicked for cell (${rowIndex}, ${colIndex}), mealIndex: ${mealIndex}`);
                            onRemoveMeal(rowIndex, colIndex, mealIndex);
                          }}
                          title={`Remove ${meal.name || 'meal'}`}
                          aria-label={`Remove ${meal.name || 'meal'}`}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                    <button
                      className="meal-planner-table-add-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`Add meal clicked for cell (${rowIndex}, ${colIndex})`);
                        onAddMeal(rowIndex, colIndex);
                      }}
                      title="Add Another Meal"
                      aria-label="Add another meal"
                    >
                      📝
                    </button>
                  </div>
                ) : (
                  <button
                    className="meal-planner-table-cell-button"
                    onClick={() => {
                      console.log(`Add first meal clicked for cell (${rowIndex}, ${colIndex})`);
                      onAddMeal(rowIndex, colIndex);
                    }}
                    title="Add Meal"
                    aria-label="Add first meal"
                  >
                    📝
                  </button>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

MealTable.propTypes = {
  mealData: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          image: PropTypes.string,
          ingredients: PropTypes.arrayOf(PropTypes.string),
          recipe: PropTypes.string,
          calories: PropTypes.number,
          protein: PropTypes.number,
          carbs: PropTypes.number,
        })
      )
    )
  ).isRequired,
  onAddMeal: PropTypes.func.isRequired,
  onViewMeal: PropTypes.func.isRequired,
  onRemoveMeal: PropTypes.func.isRequired,
};

export default MealTable;