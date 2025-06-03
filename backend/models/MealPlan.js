const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true },
  type: { type: String, enum: ['custom', 'ai'], required: true },
  breakfast: { type: String, default: 'No breakfast planned' },
  lunch: { type: String, default: 'No lunch planned' },
  dinner: { type: String, default: 'No dinner planned' },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  completed: {
    breakfast: { type: Boolean, default: false },
    lunch: { type: Boolean, default: false },
    dinner: { type: Boolean, default: false }
  }
});

module.exports = mongoose.model('MealPlan', mealPlanSchema);