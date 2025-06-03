import React, { useState, useEffect, useCallback } from 'react'; 
import '../styles/CalorieCalculator.css';

const CalorieCalculator = () => {
  const initialFormData = {
    gender: 'male',
    age: 25,
    height: 180,
    weight: 80,
    activity: 2
  };

  const [formData, setFormData] = useState(initialFormData);
  const [results, setResults] = useState({ gain: 0, maintain: 0, lose: 0 });

  const calculateCalories = useCallback(() => {
    const { gender, age, height, weight, activity = 0 } = formData;

    try {
        const weightKg = parseFloat(weight);
        const heightCm = parseFloat(height);
        const ageYears = parseFloat(age);
        const weightLbs = weightKg * 2.2046226218;

        const bmr = (10.0 * weightKg) + (6.25 * heightCm) - (5.0 * ageYears) + 
                   (gender === 'male' ? 5.0 : -161.0);

        const activityMET = 3.5;
        const minutesPerWeek = activity * 60;
        const activityCaloriesPerDay = (activityMET * weightKg * minutesPerWeek) / (7 * 24 * 60);
        
        const sedentaryFactor = 1.2;
        const totalDailyEnergy = bmr * sedentaryFactor + activityCaloriesPerDay;

        const tdee = Math.max(1200, totalDailyEnergy);

        setResults({
            gain: Math.round((tdee + 300) / 10) * 10,
            maintain: Math.round(tdee / 10) * 10,
            lose: Math.round((tdee - 500) / 10) * 10
        });

    } catch (error) {
        console.error('Calculation error:', error);
        setResults({ gain: 0, maintain: 0, lose: 0 });
    }
}, [formData]);

  useEffect(() => {
    calculateCalories();
  }, [calculateCalories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'gender' ? value : Number(value)
    }));
  };

  const inputs = [
    { name: 'age', min: 13, max: 100, unit: 'years' },
    { name: 'height', min: 80, max: 250, unit: 'cm' },
    { name: 'weight', min: 40, max: 200, unit: 'kg' },
    { name: 'activity', min: 0, max: 50, unit: 'hours/week' }
  ];

  return (
    <div id="bmr-calculator" className="wrapper">
      <h3>Calorie Calculator</h3>
      <div className="calculator">
        <div className="choose-gender">
          {['male', 'female'].map(gender => (
            <div key={gender} className="segmented-control">
              <input
                id={`calc-gender-${gender}`}
                type="radio"
                name="gender"
                value={gender}
                checked={formData.gender === gender}
                onChange={handleInputChange}
              />
              <label htmlFor={`calc-gender-${gender}`}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </label>
            </div>
          ))}
        </div>

        {inputs.map(({ name, min, max, unit }) => (
          <div key={name} className="range-container">
            <label htmlFor={`calc-${name}`}>
              {name === 'activity' ? (
                `Weekly Activity: ${formData[name]} ${unit}`
              ) : (
                <span className="bold-label">
                  {name.charAt(0).toUpperCase() + name.slice(1)}: {formData[name]} {unit}
                </span>
              )}
            </label>
            <input
              id={`calc-${name}`}
              type="range"
              name={name}
              value={formData[name]}
              min={min}
              max={max}
              onChange={handleInputChange}
            />
          </div>
        ))}
      </div>

      <div className="results">
        {[
          { id: 'gain', label: 'To Gain Weight' },
          { id: 'maintain', label: 'To Maintain' },
          { id: 'lose', label: 'To Lose Weight' }
        ].map(({ id, label }) => (
          <div key={id} className="results-item" id={`calc-target-${id}`}>
            {label}:<br />
            <span>{results[id]} calories</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalorieCalculator;