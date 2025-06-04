const express = require('express');
const router = express.Router();

// Save a meal plan
router.post('/save', async (req, res) => {
  const db = req.db;
  try {
    const { email, totalDays, date, type, meals } = req.body;

    console.log('Received meal plan save request:', req.body);

    // Validate required fields
    if (!email || !totalDays || !date || !type || !meals || !Array.isArray(meals)) {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }

    // Delete existing meal plans for this email, date, and type
    console.log(`Deleting existing meal plans for email: ${email}, date: ${date}, type: ${type}`);
    await new Promise((resolve, reject) => {
      db.query(
        'DELETE FROM meal_plans WHERE email = ? AND date = ? AND type = ?',
        [email, date, type],
        (err) => {
          if (err) return reject(err);
          console.log('Deletion successful');
          resolve();
        }
      );
    });

    // Insert new meal plans for each day
    console.log(`Inserting ${meals.length} days for email: ${email}`);
    const insertPromises = meals.map((meal, index) => {
      return new Promise((resolve, reject) => {
        const query = 'INSERT INTO meal_plans (email, day_number, total_days, date, type, breakfast, lunch, dinner, calories, protein, carbs, completed_breakfast, completed_lunch, completed_dinner) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [
          email,
          index + 1,
          totalDays,
          date,
          type,
          meal.breakfast || 'No breakfast planned',
          meal.lunch || 'No lunch planned',
          meal.dinner || 'No dinner planned',
          meal.calories || 0,
          meal.protein || 0,
          meal.carbs || 0,
          0, // completed_breakfast
          0, // completed_lunch
          0, // completed_dinner
        ];
        console.log(`Inserting day ${index + 1}:`, values);
        db.query(query, values, (err, result) => {
          if (err) return reject(err);
          console.log(`Inserted day ${index + 1}, result:`, result);
          resolve(result);
        });
      });
    });

    await Promise.all(insertPromises);
    console.log('All meal plans inserted successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error in /save endpoint:', error);
    res.status(500).json({ error: 'Failed to save meal plan', details: error.message });
  }
});

// Get meal plans for a specific email, date, and type
router.get('/:type/:date', async (req, res) => {
  const db = req.db;
  try {
    const { email } = req.query;
    const { type, date } = req.params;

    console.log(`Fetching meal plans for email: ${email}, type: ${type}, date: ${date}`);
    const results = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM meal_plans WHERE email = ? AND date = ? AND type = ? ORDER BY day_number',
        [email, date, type],
        (err, results) => {
          if (err) return reject(err);
          console.log('Query results:', results);
          resolve(results);
        }
      );
    });

    if (!results.length) {
      console.log('No meal plans found');
      return res.json([]);
    }

    const mealPlans = results.map(row => ({
      dayNumber: row.day_number,
      totalDays: row.total_days,
      date: row.date,
      type: row.type,
      breakfast: row.breakfast,
      lunch: row.lunch,
      dinner: row.dinner,
      calories: row.calories,
      protein: row.protein,
      carbs: row.carbs,
      completed: {
        breakfast: row.completed_breakfast,
        lunch: row.completed_lunch,
        dinner: row.completed_dinner
      }
    }));

    console.log('Returning meal plans:', mealPlans);
    res.json(mealPlans);
  } catch (error) {
    console.error('Error in /:type/:date endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch meal plans', details: error.message });
  }
});

// Update completed status
router.patch('/check', async (req, res) => {
  const db = req.db;
  try {
    const { email, date, type, dayNumber, mealType } = req.body;

    console.log(`Updating completion for email: ${email}, date: ${date}, type: ${type}, day: ${dayNumber}, meal: ${mealType}`);
    const mealPlan = await new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM meal_plans WHERE email = ? AND date = ? AND type = ? AND day_number = ?',
        [email, date, type, dayNumber],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        }
      );
    });

    if (!mealPlan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    const field = `completed_${mealType}`;
    const updateQuery = `UPDATE meal_plans SET ${field} = ? WHERE email = ? AND date = ? AND type = ? AND day_number = ?`;
    await new Promise((resolve, reject) => {
      db.query(
        updateQuery,
        [!mealPlan[field], email, date, type, dayNumber],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    console.log(`Updated ${field} for day ${dayNumber}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in /check endpoint:', error);
    res.status(500).json({ error: 'Failed to update completion status', details: error.message });
  }
});

// Update a meal plan
router.put('/update', async (req, res) => {
  const db = req.db;
  try {
    const { email, date, type, meals } = req.body;

    console.log('Received meal plan update request:', req.body);

    // Validate required fields
    if (!email || !date || !type || !meals || !Array.isArray(meals)) {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }

    // Delete existing meal plans for this email, date, and type
    console.log(`Deleting existing meal plans for email: ${email}, date: ${date}, type: ${type}`);
    await new Promise((resolve, reject) => {
      db.query(
        'DELETE FROM meal_plans WHERE email = ? AND date = ? AND type = ?',
        [email, date, type],
        (err) => {
          if (err) return reject(err);
          console.log('Deletion successful');
          resolve();
        }
      );
    });

    // Insert updated meal plans for each day
    console.log(`Inserting ${meals.length} updated days for email: ${email}`);
    const insertPromises = meals.map((meal, index) => {
      return new Promise((resolve, reject) => {
        const query = 'INSERT INTO meal_plans (email, day_number, total_days, date, type, breakfast, lunch, dinner, calories, protein, carbs, completed_breakfast, completed_lunch, completed_dinner) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [
          email,
          index + 1,
          meals.length, // Update total_days to reflect the new number of days
          date,
          type,
          meal.breakfast || 'No breakfast planned',
          meal.lunch || 'No lunch planned',
          meal.dinner || 'No dinner planned',
          meal.calories || 0,
          meal.protein || 0,
          meal.carbs || 0,
          0, // Reset completed_breakfast
          0, // Reset completed_lunch
          0, // Reset completed_dinner
        ];
        console.log(`Inserting updated day ${index + 1}:`, values);
        db.query(query, values, (err, result) => {
          if (err) return reject(err);
          console.log(`Inserted updated day ${index + 1}, result:`, result);
          resolve(result);
        });
      });
    });

    await Promise.all(insertPromises);
    console.log('All updated meal plans inserted successfully');
    res.json({ message: 'Meal plan updated successfully' });
  } catch (error) {
    console.error('Error in /update endpoint:', error);
    res.status(500).json({ error: 'Failed to update meal plan', details: error.message });
  }
});

// Delete a meal plan
router.delete('/delete', async (req, res) => {
  const db = req.db;
  try {
    const { email, date, type } = req.query;

    console.log('Received meal plan delete request:', req.query);

    // Validate required fields
    if (!email || !date || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Delete the meal plan for this email, date, and type
    console.log(`Deleting meal plan for email: ${email}, date: ${date}, type: ${type}`);
    const result = await new Promise((resolve, reject) => {
      db.query(
        'DELETE FROM meal_plans WHERE email = ? AND date = ? AND type = ?',
        [email, date, type],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    if (result.affectedRows === 0) {
      console.log('No meal plan found to delete');
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    console.log('Meal plan deleted successfully, affected rows:', result.affectedRows);
    res.json({ message: 'Meal plan deleted successfully' });
  } catch (error) {
    console.error('Error in /delete endpoint:', error);
    res.status(500).json({ error: 'Failed to delete meal plan', details: error.message });
  }
});

module.exports = router;