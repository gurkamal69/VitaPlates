import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../API,LoginAndOtherFiles/AuthContext';
import axios from 'axios';
import MealTable from '../components/MealTable';
import MealSearchModal from '../components/MealSearchModal';
import MealDetailsModal from '../components/MealDetailsModal';
import { FiEdit, FiTrash2, FiSave, FiX, FiRefreshCw, FiPlus, FiTrash } from 'react-icons/fi';
import '../styles/Dashboard.css';

const Dashboard = () => {
  console.log('Dashboard rendering');
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [aiDate, setAiDate] = useState(new Date().toISOString().split('T')[0]);
  const [customMealPlans, setCustomMealPlans] = useState([]);
  const [aiMealPlans, setAiMealPlans] = useState([]);
  const [expandedDays, setExpandedDays] = useState({});
  const [isEditing, setIsEditing] = useState({ type: null, date: null });
  const [editMealData, setEditMealData] = useState([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [favoritePoses, setFavoritePoses] = useState([]);
  const [selectedPose, setSelectedPose] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [favoriteExercises, setFavoriteExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const userEmail = useMemo(() => currentUser?.email, [currentUser]);

  useEffect(() => {
    console.log('User changed to:', currentUser?.email || 'No user');
    setCustomMealPlans([]);
    setAiMealPlans([]);
    setExpandedDays({});
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const savedFavorites = localStorage.getItem('favoriteYogaPoses');
      if (savedFavorites) {
        setFavoritePoses(JSON.parse(savedFavorites));
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const savedFavorites = localStorage.getItem('favoriteExercises');
      if (savedFavorites) {
        setFavoriteExercises(JSON.parse(savedFavorites));
      }
    }
  }, [currentUser]);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedYogaFavorites = localStorage.getItem('favoriteYogaPoses');
      setFavoritePoses(savedYogaFavorites ? JSON.parse(savedYogaFavorites) : []);

      const savedExerciseFavorites = localStorage.getItem('favoriteExercises');
      setFavoriteExercises(savedExerciseFavorites ? JSON.parse(savedExerciseFavorites) : []);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAddMeal = (rowIndex, colIndex) => {
    setSelectedCell({ rowIndex, colIndex });
    setIsSearchModalOpen(true);
  };

  const handleSelectMeal = (meal) => {
    const newMealData = [...editMealData];
    const enhancedMeal = {
      ...meal,
      ingredients: meal.ingredients || ['Sample Ingredient 1', 'Sample Ingredient 2'],
      recipe: meal.recipe || 'Sample recipe: Mix ingredients and cook for 10 minutes.',
      image: meal.image || 'https://via.placeholder.com/300x200?text=No+Image+Available',
    };
    newMealData[selectedCell.rowIndex][selectedCell.colIndex] = [
      ...newMealData[selectedCell.rowIndex][selectedCell.colIndex],
      enhancedMeal,
    ];
    setEditMealData(newMealData);
    setIsSearchModalOpen(false);
  };

  const handleRemoveMeal = (rowIndex, colIndex, mealIndex) => {
    const newMealData = [...editMealData];
    newMealData[rowIndex][colIndex] = newMealData[rowIndex][colIndex].filter(
      (_, index) => index !== mealIndex
    );
    setEditMealData(newMealData);
    if (
      selectedCell &&
      selectedCell.rowIndex === rowIndex &&
      selectedCell.colIndex === colIndex
    ) {
      setSelectedMeals(newMealData[rowIndex][colIndex]);
    }
  };

  const handleViewMeal = (rowIndex, colIndex) => {
    console.log('handleViewMeal called with:', { rowIndex, colIndex, meals: editMealData[rowIndex][colIndex] });
    setSelectedMeals(editMealData[rowIndex][colIndex]);
    setSelectedCell({ rowIndex, colIndex });
    setIsDetailsModalOpen(true);
  };

  const openPoseModal = async (pose) => {
    setSelectedPose(pose);
    setVideoUrl(null);
    setLoadingVideo(true);
    await fetchYouTubeVideo(pose.english_name);
  };

  const closePoseModal = () => {
    setSelectedPose(null);
    setVideoUrl(null);
  };

  const fetchYouTubeVideo = async (poseName) => {
    try {
      const query = `${poseName} yoga Yoga With Adriene`;
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          query
        )}&key=${apiKey}&maxResults=1&type=video`
      );
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const videoId = data.items[0].id.videoId;
        setVideoUrl(`https://www.youtube.com/embed/${videoId}`);
      } else {
        setVideoUrl(null);
      }
    } catch (err) {
      console.error('Error fetching YouTube video:', err);
      setVideoUrl(null);
    } finally {
      setLoadingVideo(false);
    }
  };

  const openExerciseModal = (exercise) => {
    setSelectedExercise(exercise);
  };

  const closeExerciseModal = () => {
    setSelectedExercise(null);
  };

  const removeFavoritePose = (poseId) => {
    const updatedFavorites = favoritePoses.filter((pose) => pose.id !== poseId);
    setFavoritePoses(updatedFavorites);
    localStorage.setItem('favoriteYogaPoses', JSON.stringify(updatedFavorites));
  };

  const removeFavoriteExercise = (exerciseId) => {
    const updatedFavorites = favoriteExercises.filter((exercise) => exercise.id !== exerciseId);
    setFavoriteExercises(updatedFavorites);
    localStorage.setItem('favoriteExercises', JSON.stringify(updatedFavorites));
  };

  const MealPlanTable = ({ mealPlanType, date, mealPlans, setMealPlans }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMealPlans = async () => {
      if (!currentUser) {
        setError('Please log in to view meal plans.');
        return;
      }

      if (mealPlans.length > 0 && !error && mealPlans[0]?.email === currentUser.email) {
        console.log(`Skipping fetch for ${mealPlanType} meal plan on ${date} - data already loaded`);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/mealplan/${mealPlanType}/${date}`,
          { params: { email: currentUser.email } }
        );

        const filteredPlans = response.data.filter(plan =>
          plan.breakfast !== 'No breakfast planned' ||
          plan.lunch !== 'No lunch planned' ||
          plan.dinner !== 'No dinner planned'
        );

        const updatedPlans = filteredPlans.map(plan => ({ ...plan, email: currentUser.email }));
        if (JSON.stringify(updatedPlans) !== JSON.stringify(mealPlans)) {
          setMealPlans(updatedPlans);
          setExpandedDays(prev => {
            const newExpandedDays = filteredPlans.reduce((acc, plan) => ({
              ...acc,
              [plan.dayNumber]: prev[plan.dayNumber] || false
            }), {});
            return JSON.stringify(newExpandedDays) !== JSON.stringify(prev) ? newExpandedDays : prev;
          });
        }
      } catch (error) {
        console.error(`Error fetching ${mealPlanType} meal plans:`, {
          message: error.message,
          code: error.code,
          response: error.response,
        });
        if (error.code === 'ECONNREFUSED') {
          setError('Cannot connect to the server. Please ensure the backend server is running on port 5000.');
        } else {
          setError('Failed to fetch meal plans. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      console.log('useEffect triggered with:', { mealPlanType, date, currentUserEmail: userEmail });
      if (currentUser) {
        fetchMealPlans();
      }
    }, [mealPlanType, date, userEmail]);

    const toggleDay = (dayNumber) => {
      setExpandedDays((prev) => ({
        ...prev,
        [dayNumber]: !prev[dayNumber],
      }));
      setIsEditing({ type: null, date: null });
    };

    const handleEdit = (mealPlanType, date) => {
      const numDays = mealPlans.length;
      const initialEditData = Array(3).fill().map(() => Array(numDays).fill([]));

      mealPlans.forEach((plan, dayIndex) => {
        initialEditData[0][dayIndex] = plan.breakfast !== 'No breakfast planned' ? [{
          name: plan.breakfast,
          calories: plan.calories,
          protein: plan.protein,
          carbs: plan.carbs
        }] : [];
        initialEditData[1][dayIndex] = plan.lunch !== 'No lunch planned' ? [{
          name: plan.lunch,
          calories: plan.calories,
          protein: plan.protein,
          carbs: plan.carbs
        }] : [];
        initialEditData[2][dayIndex] = plan.dinner !== 'No dinner planned' ? [{
          name: plan.dinner,
          calories: plan.calories,
          protein: plan.protein,
          carbs: plan.carbs
        }] : [];
      });

      console.log('handleEdit - mealPlans:', mealPlans);
      console.log('handleEdit - initialEditData:', initialEditData);
      setEditMealData(initialEditData);
      setIsEditing({ type: mealPlanType, date });
    };

    const handleSaveEdit = async () => {
      if (!currentUser) {
        setError('Please log in to save changes.');
        return;
      }

      const meals = editMealData[0].map((_, dayIndex) => ({
        breakfast: editMealData[0][dayIndex].length > 0 ? editMealData[0][dayIndex][0].name : 'No breakfast planned',
        lunch: editMealData[1][dayIndex].length > 0 ? editMealData[1][dayIndex][0].name : 'No lunch planned',
        dinner: editMealData[2][dayIndex].length > 0 ? editMealData[2][dayIndex][0].name : 'No dinner planned',
        calories: editMealData[0][dayIndex].length > 0 ? editMealData[0][dayIndex][0].calories || 1200 :
                 editMealData[1][dayIndex].length > 0 ? editMealData[1][dayIndex][0].calories || 1200 :
                 editMealData[2][dayIndex].length > 0 ? editMealData[2][dayIndex][0].calories || 1200 : 1200,
        protein: editMealData[0][dayIndex].length > 0 ? editMealData[0][dayIndex][0].protein || 80 :
                editMealData[1][dayIndex].length > 0 ? editMealData[1][dayIndex][0].protein || 80 :
                editMealData[2][dayIndex].length > 0 ? editMealData[2][dayIndex][0].protein || 80 : 80,
        carbs: editMealData[0][dayIndex].length > 0 ? editMealData[0][dayIndex][0].carbs || 150 :
              editMealData[1][dayIndex].length > 0 ? editMealData[1][dayIndex][0].carbs || 150 :
              editMealData[2][dayIndex].length > 0 ? editMealData[2][dayIndex][0].carbs || 150 : 150,
      }));

      const hasMeals = meals.some(
        meal =>
          meal.breakfast !== 'No breakfast planned' ||
          meal.lunch !== 'No lunch planned' ||
          meal.dinner !== 'No dinner planned'
      );

      if (!hasMeals) {
        setError('Please add at least one meal to your plan before saving.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        await axios.put('http://localhost:5000/api/mealplan/update', {
          email: currentUser.email,
          date: isEditing.date,
          type: isEditing.type,
          meals,
        });

        const fetchResponse = await axios.get(
          `http://localhost:5000/api/mealplan/${isEditing.type}/${isEditing.date}`,
          { params: { email: currentUser.email } }
        );
        const filteredPlans = fetchResponse.data.filter(plan =>
          plan.breakfast !== 'No breakfast planned' ||
          plan.lunch !== 'No lunch planned' ||
          plan.dinner !== 'No dinner planned'
        );
        const updatedPlans = filteredPlans.map(plan => ({ ...plan, email: currentUser.email }));
        setMealPlans(updatedPlans);
        setExpandedDays(filteredPlans.reduce((acc, plan) => ({
          ...acc,
          [plan.dayNumber]: false
        }), {}));
        setIsEditing({ type: null, date: null });
      } catch (error) {
        console.error('Error updating meal plan:', error.response?.data || error.message);
        setError(`Failed to update meal plan: ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    const handleCancelEdit = () => {
      setIsEditing({ type: null, date: null });
      setEditMealData([]);
      setError(null);
    };

    const handleDelete = async (mealPlanType, date) => {
      if (!window.confirm(`Are you sure you want to delete this ${mealPlanType} meal plan for ${date}?`)) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        await axios.delete('http://localhost:5000/api/mealplan/delete', {
          params: { email: currentUser.email, date, type: mealPlanType },
        });
        setMealPlans([]);
        setExpandedDays({});
      } catch (error) {
        console.error('Error deleting meal plan:', error.response?.data || error.message);
        setError(`Failed to delete meal plan: ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    const handleToggleComplete = async (dayNumber, mealType) => {
      if (!currentUser) {
        setError('Please log in to update meal completion.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        console.log('Toggling meal completion with:', { email: currentUser.email, date, type: mealPlanType, dayNumber, mealType });
        const response = await axios.patch('http://localhost:5000/api/mealplan/check', {
          email: currentUser.email,
          date,
          type: mealPlanType,
          dayNumber,
          mealType,
        });
        console.log('Toggle response:', response.data);
        const fetchResponse = await axios.get(
          `http://localhost:5000/api/mealplan/${mealPlanType}/${date}`,
          { params: { email: currentUser.email } }
        );
        const filteredPlans = fetchResponse.data.filter(plan =>
          plan.breakfast !== 'No breakfast planned' ||
          plan.lunch !== 'No lunch planned' ||
          plan.dinner !== 'No dinner planned'
        );
        const updatedPlans = filteredPlans.map(plan => ({ ...plan, email: currentUser.email }));
        setMealPlans(updatedPlans);
      } catch (error) {
        console.error('Error toggling meal completion:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config,
        });
        if (error.response?.status === 404) {
          setError('Meal plan not found for this date. Please create a meal plan first.');
        } else {
          setError('Failed to update meal completion status.');
        }
      } finally {
        setLoading(false);
      }
    };

    const handleMealClick = async (mealName, mealType) => {
      if (mealName === `No ${mealType.toLowerCase()} planned`) return;

      try {
        const apiKey = '779f8e7d8d56469d8fad52233912f6e2';
        const searchResponse = await fetch(
          `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(mealName)}&apiKey=${apiKey}&number=1`
        );

        if (!searchResponse.ok) {
          throw new Error('Failed to search for recipe');
        }

        const searchData = await searchResponse.json();
        if (searchData.results && searchData.results.length > 0) {
          const recipeId = searchData.results[0].id;
          navigate(`/recipe/${recipeId}`);
        } else {
          alert('Recipe not found on Spoonacular.');
        }
      } catch (error) {
        console.error('Error searching for recipe:', error);
        alert('Error fetching recipe. Please try again later.');
      }
    };

    const handleRefresh = () => {
      setMealPlans([]);
      fetchMealPlans();
    };

    if (isEditing.type === mealPlanType && isEditing.date === date) {
      return (
        <div className="meal-plan-table">
          <div className="meal-plan-header">
            <h3>Editing {mealPlanType === 'custom' ? 'Custom' : 'AI'} Meal Plan for {date}</h3>
            <button className="refresh-button" onClick={handleRefresh} title="Refresh" disabled={loading}>
              <FiRefreshCw />
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
          <MealTable
            mealData={editMealData}
            onAddMeal={handleAddMeal}
            onViewMeal={handleViewMeal}
            onRemoveMeal={handleRemoveMeal}
          />
          <div className="edit-controls">
            <button className="action-button save-button" onClick={handleSaveEdit} disabled={loading}>
              <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button className="action-button cancel-button" onClick={handleCancelEdit} disabled={loading}>
              <FiX /> Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="meal-plan-table">
        <div className="meal-plan-header">
          <h3>{mealPlanType === 'custom' ? 'Custom' : 'AI'} Meal Plan for {date}</h3>
          <button className="refresh-button" onClick={handleRefresh} title="Refresh" disabled={loading}>
            <FiRefreshCw />
          </button>
        </div>
        {loading ? (
          <p className="loading-message">Loading...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <>
            {mealPlans.length > 0 && (
              <div className="meal-plan-controls">
                <button className="action-button edit-button" onClick={() => handleEdit(mealPlanType, date)} disabled={loading}>
                  <FiEdit /> Edit
                </button>
                <button className="action-button delete-button" onClick={() => handleDelete(mealPlanType, date)} disabled={loading}>
                  <FiTrash2 /> Delete
                </button>
              </div>
            )}
            {mealPlans.length === 0 ? (
              <p className="no-plan-message">No {mealPlanType === 'custom' ? 'Custom' : 'AI'} Meal Plan for this date</p>
            ) : (
              mealPlans.map((plan) => (
                <div key={plan.dayNumber} className="meal-plan-day">
                  <div
                    className="meal-plan-day-header"
                    onClick={() => toggleDay(plan.dayNumber)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        toggleDay(plan.dayNumber);
                      }
                    }}
                  >
                    <h4>Day {plan.dayNumber}</h4>
                    <span className="toggle-icon">{expandedDays[plan.dayNumber] ? '▲' : '▼'}</span>
                  </div>
                  {expandedDays[plan.dayNumber] && (
                    <div className="meal-plan-details">
                      <p>
                        <strong>Breakfast:</strong>{' '}
                        <span
                          className={plan.breakfast !== 'No breakfast planned' ? 'meal-link' : ''}
                          onClick={() => handleMealClick(plan.breakfast, 'Breakfast')}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleMealClick(plan.breakfast, 'Breakfast');
                            }
                          }}
                        >
                          {plan.breakfast}
                        </span>{' '}
                        {plan.breakfast !== 'No breakfast planned' && (
                          <label className="completion-label">
                            <input
                              type="checkbox"
                              checked={plan.completed?.breakfast || false}
                              onChange={() => handleToggleComplete(plan.dayNumber, 'breakfast')}
                              disabled={loading}
                            />
                            Completed
                          </label>
                        )}
                      </p>
                      <p>
                        <strong>Lunch:</strong>{' '}
                        <span
                          className={plan.lunch !== 'No lunch planned' ? 'meal-link' : ''}
                          onClick={() => handleMealClick(plan.lunch, 'Lunch')}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleMealClick(plan.lunch, 'Lunch');
                            }
                          }}
                        >
                          {plan.lunch}
                        </span>{' '}
                        {plan.lunch !== 'No lunch planned' && (
                          <label className="completion-label">
                            <input
                              type="checkbox"
                              checked={plan.completed?.lunch || false}
                              onChange={() => handleToggleComplete(plan.dayNumber, 'lunch')}
                              disabled={loading}
                            />
                            Completed
                          </label>
                        )}
                      </p>
                      <p>
                        <strong>Dinner:</strong>{' '}
                        <span
                          className={plan.dinner !== 'No dinner planned' ? 'meal-link' : ''}
                          onClick={() => handleMealClick(plan.dinner, 'Dinner')}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleMealClick(plan.dinner, 'Dinner');
                            }
                          }}
                        >
                          {plan.dinner}
                        </span>{' '}
                        {plan.dinner !== 'No dinner planned' && (
                          <label className="completion-label">
                            <input
                              type="checkbox"
                              checked={plan.completed?.dinner || false}
                              onChange={() => handleToggleComplete(plan.dayNumber, 'dinner')}
                              disabled={loading}
                            />
                            Completed
                          </label>
                        )}
                      </p>
                      <p>
                        <strong>Nutrition:</strong> {plan.calories || 0} cal | {plan.protein || 0}g protein | {plan.carbs || 0}g carbs
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-main-content">
          <h1 className="dashboard-greeting">Please login to see dashboard</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-main-content">
        <h1 className="dashboard-greeting">Welcome to Your Dashboard</h1>

        <div className="meal-plan-section">
          <div className="meal-plan-section-header">
            <h2>Favorite Yoga Poses</h2>
          </div>
          {favoritePoses.length === 0 ? (
            <p className="no-plan-message">No favorite yoga poses yet. Add some from the Yoga section!</p>
          ) : (
            <div className="meal-plan-table yoga-scroll-container">
              {favoritePoses.map((pose, idx) => (
                <div className="yoga-pose-card" key={idx}>
                  <div
                    className="yoga-pose-content"
                    onClick={() => openPoseModal(pose)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openPoseModal(pose)}
                    aria-label={`View details for ${pose.english_name}`}
                  >
                    <img
                      src={pose.url_png || 'https://via.placeholder.com/250?text=Yoga+Pose'}
                      alt={pose.english_name}
                      loading="lazy"
                    />
                    <div className="yoga-pose-info">
                      <h3>{pose.english_name}</h3>
                      <p><strong>Sanskrit:</strong> {pose.sanskrit_name}</p>
                      <p><strong>Level:</strong> {pose.level || 'Medium'}</p>
                    </div>
                  </div>
                  <button
                    className="yoga-remove-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavoritePose(pose.id);
                    }}
                    aria-label={`Remove ${pose.english_name} from favorites`}
                  >
                    <FiTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="meal-plan-section">
          <div className="meal-plan-section-header">
            <h2>Favorite Exercises</h2>
          </div>
          {favoriteExercises.length === 0 ? (
            <p className="no-plan-message">No favorite exercises yet. Add some from the Exercise List section!</p>
          ) : (
            <div className="meal-plan-table exercise-scroll-container">
              {favoriteExercises.map((exercise, idx) => (
                <div className="ExerciseList-card" key={idx}>
                  <div
                    className="exercise-content"
                    onClick={() => openExerciseModal(exercise)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openExerciseModal(exercise)}
                    aria-label={`View details for ${exercise.name}`}
                  >
                    <img src={exercise.gifUrl} alt={exercise.name} loading="lazy" />
                    <h4>{exercise.name}</h4>
                    <p><strong>Target:</strong> {exercise.target}</p>
                    <p><strong>Equipment:</strong> {exercise.equipment}</p>
                  </div>
                  <button
                    className="exercise-remove-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavoriteExercise(exercise.id);
                    }}
                    aria-label={`Remove ${exercise.name} from favorites`}
                  >
                    <FiTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="meal-plan-section">
          <div className="meal-plan-section-header">
            <h2>Custom Meal Plans</h2>
            <button className="action-button create-button" onClick={() => navigate('/mealplanner')}>
              <FiPlus /> Create Meal Plan
            </button>
          </div>
          <label className="date-picker-label">
            Select Date:
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="date-picker"
            />
          </label>
          <MealPlanTable
            mealPlanType="custom"
            date={customDate}
            mealPlans={customMealPlans}
            setMealPlans={setCustomMealPlans}
          />
        </div>

        <div className="meal-plan-section">
          <div className="meal-plan-section-header">
            <h2>AI Meal Plans</h2>
            <button className="action-button create-button" onClick={() => navigate('/AIMeal')}>
              <FiPlus /> Create Meal Plan
            </button>
          </div>
          <label className="date-picker-label">
            Select Date:
            <input
              type="date"
              value={aiDate}
              onChange={(e) => setAiDate(e.target.value)}
              className="date-picker"
            />
          </label>
          <MealPlanTable
            mealPlanType="ai"
            date={aiDate}
            mealPlans={aiMealPlans}
            setMealPlans={setAiMealPlans}
          />
        </div>

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

        {selectedPose && (
          <div className="yoga-modal-overlay" onClick={closePoseModal} role="dialog" aria-modal="true">
            <div className="yoga-modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="yoga-modal-close"
                onClick={closePoseModal}
                aria-label="Close modal"
              >
                ×
              </button>
              <h2>{selectedPose.english_name}</h2>
              <div className="yoga-modal-body">
                <div className="yoga-modal-image-section">
                  <img
                    src={selectedPose.url_png || 'https://via.placeholder.com/250?text=Yoga+Pose'}
                    alt={selectedPose.english_name}
                    loading="lazy"
                  />
                </div>
                <div className="yoga-modal-details">
                  <p><strong>Sanskrit:</strong> {selectedPose.sanskrit_name}</p>
                  <p><strong>Description:</strong> {selectedPose.pose_description}</p>
                  <div className="yoga-youtube-frame">
                    {loadingVideo ? (
                      <div className="yoga-loading-spinner">Loading video...</div>
                    ) : videoUrl ? (
                      <iframe
                        width="100%"
                        height="315"
                        src={videoUrl}
                        title={`${selectedPose.english_name} Yoga Tutorial`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <p>No tutorial found for this pose yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedExercise && (
          <div className="ExerciseList-modal-overlay" onClick={closeExerciseModal} role="dialog" aria-modal="true">
            <div className="ExerciseList-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="ExerciseList-close-btn" onClick={closeExerciseModal} aria-label="Close modal">
                ×
              </button>
              <h3>{selectedExercise.name}</h3>
              <img src={selectedExercise.gifUrl} alt={selectedExercise.name} loading="lazy" />
              {Object.entries(selectedExercise).map(([key, value]) => {
                if (["id", "gifUrl", "name"].includes(key)) return null;
                return (
                  <p key={key}>
                    <strong>{key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}:</strong>{" "}
                    {Array.isArray(value) ? value.join(", ") : value}
                  </p>
                );
              })}
              {!selectedExercise.instructions && (
                <p>
                  <strong>Instructions:</strong> Perform the movement in a slow and controlled manner focusing on the {selectedExercise.target}.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;