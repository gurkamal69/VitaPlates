import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function PoseDetail() {
  const { id } = useParams();
  const [pose, setPose] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPose = async () => {
      try {
        const response = await fetch(`https://yoga-api-nzy4.onrender.com/v1/poses/${id}`);
        if (!response.ok) throw new Error('Failed to fetch pose');
        const data = await response.json();
        setPose(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchPose();
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!pose) return <p>Loading...</p>;

  return (
    <div>
      <h2>{pose.english_name}</h2>
      <p>{pose.sanskrit_name}</p>
      <img src={pose.url_png} alt={pose.english_name} />
      <p>{pose.description}</p>
    </div>
  );
}

export default PoseDetail;