import React, { useState, useEffect } from 'react';
import './MemberProfile.css';

const MemberProfile = () => {
  const [firstName, setFirstName] = useState('');
  const [healthStats, setHealthStats] = useState([]);
  const [exerciseRoutines, setExerciseRoutines] = useState([]);
  const [fitnessAcheivements, setfitnessAcheivements] = useState([]);

  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    const fetchUserFirstName = async () => {
      try {
        const response = await fetch(`/api/first-name/${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setFirstName(data.first_name);
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
      }
    };

    const fetchExerciseRoutines = async () => {
      try {
        const response = await fetch(`/api/exercise-routines/${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(`Data: \n${data}`)
        setExerciseRoutines(data);
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
      }
    };

    const fetchFitnessAcheivements = async () => {
      try {
        const response = await fetch(`/api/fitness-achievements/${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setfitnessAcheivements(data);
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
      }
    };

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
      fetchUserFirstName();
      fetchExerciseRoutines();
      fetchFitnessAcheivements();
      fetchHealthStats();
    }
  }, []);

  const latestHealthMetric = healthStats[0] ? (
    <div className="left-box">
      <h2>Health Stats:</h2>
      <p>Weight: {healthStats[0].weight} kg</p>
      <p>Height: {healthStats[0].height} cm</p>
      <p>BMI: {healthStats[0].bmi}</p>
    </div>
  ) : (
    <div className="left-box">
      <h2>Health Stats:</h2>
      <p>No health stats available</p>
    </div>
  );

  return (
    <div className="profile-container">
      <div className="top-bar">
        <h1>Welcome, {firstName}</h1>
        <div className="profile-picture">
          <h1>{firstName[0]}</h1>
        </div>
      </div>
      <div className="columns">
        <div className="left-section">
          <div className="left-box">
            <h2>Exercise Routines:</h2>
            <ul>
              {exerciseRoutines.map(routine => (
                <li key={routine.routine_id}>
                  <strong>{routine.routine_name}</strong>: {routine.description}
                </li>
              ))}
            </ul>
          </div>
          <div className="left-box">
            <h2>Fitness Acheivements:</h2>
            <ul>
              {fitnessAcheivements.map(acheivement => (
                <li key={acheivement.goal_id}>
                  {acheivement.goal_description}
                </li>
              ))}
            </ul>
          </div>
          {latestHealthMetric}
        </div>
        <div className="right-section">
          <div className="right-box">
            <h2>Classes:</h2>
            Right Box 1
          </div>
          <div className="right-box">
            <h2>Training Sessions:</h2>
            Right Box 2
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;