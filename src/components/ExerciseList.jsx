import React, { useEffect, useState } from "react";
import "../styles/ExerciseList.css";
import { FiHeart } from 'react-icons/fi'; // Using react-icons for the heart icon

const ExerciseList = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [page, setPage] = useState(1);
  // State for favorited exercises
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('favoriteExercises');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  const exercisesPerPage = 20;

  // Fetch all exercises on mount
  const fetchExercises = async () => {
    try {
      const response = await fetch("https://exercisedb.p.rapidapi.com/exercises", {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": "08524f83dbmsh6a29bb542a0cdcep14f229jsn1cd0db687d00", // Replace with your RapidAPI key
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
      });
      const data = await response.json();
      setExercises(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('favoriteExercises', JSON.stringify(favorites));
  }, [favorites]);

  // Pagination calculations
  const totalPages = Math.ceil(exercises.length / exercisesPerPage);
  const indexOfLast = page * exercisesPerPage;
  const indexOfFirst = indexOfLast - exercisesPerPage;
  const currentExercises = exercises.slice(indexOfFirst, indexOfLast);

  const nextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  // Modal open/close handlers
  const openModal = (exercise) => {
    setSelectedExercise(exercise);
  };

  const closeModal = () => {
    setSelectedExercise(null);
  };

  // Toggle favorite status for an exercise
  const toggleFavorite = (exercise) => {
    setFavorites((prevFavorites) => {
      const isFavorited = prevFavorites.some((fav) => fav.id === exercise.id);
      if (isFavorited) {
        // Remove from favorites
        return prevFavorites.filter((fav) => fav.id !== exercise.id);
      } else {
        // Add to favorites
        return [...prevFavorites, exercise];
      }
    });
  };

  return (
    <div className="ExerciseList-container">
      <h2 className="ExerciseList-heading">🏋️‍♂️ Exercise List</h2>

      {loading ? (
        <p>Loading exercises...</p>
      ) : (
        <>
          <div className="ExerciseList-grid">
            {currentExercises.map((exercise) => {
              const isFavorited = favorites.some((fav) => fav.id === exercise.id);
              return (
                <div
                  key={exercise.id}
                  className="ExerciseList-card"
                  onClick={() => openModal(exercise)}
                >
                  <img src={exercise.gifUrl} alt={exercise.name} loading="lazy" />
                  <div className="exercise-header">
                    <h4>{exercise.name}</h4>
                    <button
                      className="exercise-favorite-button"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent modal from opening when clicking the button
                        toggleFavorite(exercise);
                      }}
                      aria-label={isFavorited ? `Remove ${exercise.name} from favorites` : `Add ${exercise.name} to favorites`}
                    >
                      <FiHeart className={isFavorited ? 'favorited' : ''} />
                    </button>
                  </div>
                  <p><strong>Target:</strong> {exercise.target}</p>
                  <p><strong>Equipment:</strong> {exercise.equipment}</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {selectedExercise && (
        <div className="ExerciseList-modal-overlay" onClick={closeModal}>
          <div className="ExerciseList-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="ExerciseList-close-btn" onClick={closeModal}>
              ×
            </button>
            <h3>{selectedExercise.name}</h3>
            <img src={selectedExercise.gifUrl} alt={selectedExercise.name} />
            
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
              <p><strong>Instructions:</strong> Perform the movement in a slow and controlled manner focusing on the {selectedExercise.target}.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseList;