import React from 'react';
import Modal from './Modal';
import '../styles/MealDetailsModal.css';

const MealDetailsModal = ({ isOpen, onClose, meals, onChangeFood }) => {
  if (!isOpen) {
    return null;
  }

  console.log('MealDetailsModal props:', { isOpen, meals });

  if (!meals || meals.length === 0) {
    console.log('MealDetailsModal not rendering: meals invalid');
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Meal Details">
      <div className="meal-details-modal-content">
        <button className="meal-planner-button btn" onClick={onChangeFood}>
          Change Food
        </button>
        {meals.map((meal, index) => (
          <div key={index} className="meal-details-section">
            <h3 className="meal-details-title">{meal.name || 'Unnamed Meal'}</h3>
            {/* Display meal image */}
            <div className="meal-details-image-container">
              {meal.image ? (
                <img
                  src={meal.image}
                  alt={meal.name || 'Meal'}
                  className="meal-details-image"
                  onError={(e) => {
                    e.target.style.display = 'none'; // Hide image if it fails to load
                    e.target.nextSibling.style.display = 'block'; // Show fallback message
                  }}
                />
              ) : (
                <p className="meal-details-image-fallback">No image available.</p>
              )}
              <p className="meal-details-image-fallback" style={{ display: 'none' }}>
                Failed to load image.
              </p>
            </div>
            <div className="meal-details-info">
              <h4 className="meal-details-subtitle">Ingredients</h4>
              <ul className="meal-details-list">
                {meal.ingredients && meal.ingredients.length > 0 ? (
                  meal.ingredients.map((ingredient, i) => (
                    <li key={i} className="meal-details-item">
                      {ingredient}
                    </li>
                  ))
                ) : (
                  <li className="meal-details-item meal-details-empty">
                    No ingredients available.
                  </li>
                )}
              </ul>
            </div>
            <div className="meal-details-info">
              <h4 className="meal-details-subtitle">Recipe</h4>
              <p className="meal-details-text">
                {meal.recipe || 'No recipe available.'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default MealDetailsModal;