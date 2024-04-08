import React, { useState, useEffect } from 'react';
import './MemberProfile.css';

const MemberProfile = () => {
  const [healthStats, setHealthStats] = useState([]);

  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    const fetchHealthStats = async () => {
      try {
        const response = await fetch(`/api/health-stats/${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setHealthStats(data);
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
      }
    };

    if (userId) {
      fetchHealthStats();
    }
  }, []);

  const latestHealthMetric = healthStats[0] ? (
    <div className="health-stat-box">
      <p>Weight: {healthStats[0].weight} kg</p>
      <p>Height: {healthStats[0].height} cm</p>
      <p>BMI: {healthStats[0].bmi}</p>
    </div>
  ) : (
    <div className="health-stat-box">
      <p>No health stats available</p>
    </div>
  );

  return (
    <div className="profile-container">
      Welcome, {userId}
      <div className="left-section">
        {latestHealthMetric}
        <div className="box">Other Box 1</div>
        <div className="box">Other Box 2</div>
      </div>
      <div className="right-section">
        <div className="box">Right Box 1</div>
        <div className="box">Right Box 2</div>
      </div>
    </div>
  );
};

export default MemberProfile;