import React, { useEffect, useState, useRef } from 'react';
import '../styles/YogaDownload.css';
import { FiHeart } from 'react-icons/fi'; // Using react-icons for the heart icon

function YogaDownload() {
  const [poses, setPoses] = useState([]);
  const [error, setError] = useState(null);
  const [selectedPose, setSelectedPose] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  // State for favorited poses
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('favoriteYogaPoses');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  // Timer states
  const [timerDuration, setTimerDuration] = useState(60); // Default to 60 seconds
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch('https://yoga-api-nzy4.onrender.com/v1/poses')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => setPoses(data))
      .catch((err) => setError(err.message));
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('favoriteYogaPoses', JSON.stringify(favorites));
  }, [favorites]);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timeLeft]);

  const startTimer = () => {
    if (timeLeft > 0) setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    clearInterval(timerRef.current);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    clearInterval(timerRef.current);
    setTimeLeft(timerDuration);
  };

  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value) || 60;
    setTimerDuration(newDuration);
    setTimeLeft(newDuration);
    setIsTimerRunning(false);
    clearInterval(timerRef.current);
  };

  const openModal = async (pose) => {
    setSelectedPose(pose);
    setVideoUrl(null);
    setLoadingVideo(true);
    resetTimer(); // Reset timer when opening a new pose
    await fetchYouTubeVideo(pose.english_name);
  };

  const closeModal = () => {
    setSelectedPose(null);
    setVideoUrl(null);
    resetTimer(); // Reset timer when closing modal
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Toggle favorite status for a pose
  const toggleFavorite = (pose) => {
    setFavorites((prevFavorites) => {
      const isFavorited = prevFavorites.some((fav) => fav.id === pose.id);
      if (isFavorited) {
        // Remove from favorites
        return prevFavorites.filter((fav) => fav.id !== pose.id);
      } else {
        // Add to favorites
        return [...prevFavorites, pose];
      }
    });
  };

  return (
    <div className="yoga-download-page">
      <header className="yoga-header">
        <h1>Explore Yoga Poses</h1>
        <p>Discover the art of yoga with our curated collection of poses, complete with tutorials and detailed descriptions.</p>
      </header>
      {error && <p className="yoga-error" role="alert">Error: {error}</p>}
      <div className="yoga-pose-grid">
        {poses.length === 0 && !error && <p className="yoga-loading">Loading poses...</p>}
        {poses.map((pose, idx) => {
          const isFavorited = favorites.some((fav) => fav.id === pose.id);
          return (
            <div
              className="yoga-pose-card"
              key={idx}
              onClick={() => openModal(pose)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openModal(pose)}
              aria-label={`View details for ${pose.english_name}`}
            >
              <img
                src={pose.url_png || 'https://via.placeholder.com/250?text=Yoga+Pose'}
                alt={pose.english_name}
                loading="lazy"
              />
              <div className="yoga-pose-info">
                <div className="yoga-pose-header">
                  <h3>{pose.english_name}</h3>
                  <button
                    className="yoga-favorite-button"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent modal from opening when clicking the button
                      toggleFavorite(pose);
                    }}
                    aria-label={isFavorited ? `Remove ${pose.english_name} from favorites` : `Add ${pose.english_name} to favorites`}
                  >
                    <FiHeart className={isFavorited ? 'favorited' : ''} />
                  </button>
                </div>
                <p><strong>Sanskrit:</strong> {pose.sanskrit_name}</p>
                <p><strong>Level:</strong> {pose.level || 'Medium'}</p>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPose && (
        <div className="yoga-modal-overlay" onClick={closeModal} role="dialog" aria-modal="true">
          <div className="yoga-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="yoga-modal-close"
              onClick={closeModal}
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
                <div className="yoga-timer">
                  <h3>Practice Timer</h3>
                  <div className="yoga-timer-display">{formatTime(timeLeft)}</div>
                  <div className="yoga-timer-controls">
                    <input
                      type="number"
                      min="1"
                      value={timerDuration}
                      onChange={handleDurationChange}
                      disabled={isTimerRunning}
                      aria-label="Set timer duration in seconds"
                    />
                    <button
                      onClick={startTimer}
                      disabled={isTimerRunning || timeLeft === 0}
                      aria-label="Start timer"
                    >
                      Start
                    </button>
                    <button
                      className="btn"
                      onClick={pauseTimer}
                      disabled={!isTimerRunning}
                      aria-label="Pause timer"
                    >
                      Pause
                    </button>
                    <button
                      onClick={resetTimer}
                      disabled={timeLeft === timerDuration && !isTimerRunning}
                      aria-label="Reset timer"
                    >
                      Reset
                    </button>
                  </div>
                </div>
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
    </div>
  );
}

export default YogaDownload;