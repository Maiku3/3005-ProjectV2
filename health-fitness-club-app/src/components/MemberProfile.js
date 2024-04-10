import React, { useState, useEffect } from 'react';
import './MemberProfile.css';

const MemberProfile = () => {
  const [classes, setClasses] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [healthStats, setHealthStats] = useState([]);
  const [exerciseRoutines, setExerciseRoutines] = useState([]);
  const [fitnessAcheivements, setfitnessAcheivements] = useState([]);
  const [trainingSessions, setTrainingSessions] = useState({ registeredSessions: [], availableSessions: [] });

  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      fetchUserFirstName();
      fetchExerciseRoutines();
      fetchFitnessAcheivements();
      fetchHealthStats();
      fetchClasses();
      fetchTrainingSessions();
    }
  }, []);

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

  const fetchClasses = async () => {
    try {
      const response = await fetch(`/api/classes/${userId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  };

  const handleRegisterClass = async (classId) => {
    try {
      const response = await fetch('/api/register-class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, classId }),
      });
      
      if (!response.ok) {
        throw new Error('Could not complete registration');
      }
  
      // Reload the classes to reflect the new registration status
      await fetchClasses();
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleCancelRegistration = async (classId) => {
    try {
      const response = await fetch('/api/cancel-class', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, classId }),
      });
  
      if (!response.ok) {
        throw new Error('Could not cancel registration');
      }
  
      // Reload the classes to reflect the cancellation
      await fetchClasses();
    } catch (error) {
      console.error('Cancellation failed:', error);
    }
  };

  const fetchTrainingSessions = async () => {
    try {
      const response = await fetch(`/api/list-training-sessions/${userId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const registeredSessions = data.filter(session => session.session_status === 'registered');
      const availableSessions = data.filter(session => session.session_status === 'available');
      
      setTrainingSessions({ registeredSessions, availableSessions });
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  };
  
  const handleRegisterTrainingSession = async (sessionId) => {
    try {
      const response = await fetch('/api/register-training-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, sessionId }),
      });
  
      if (!response.ok) {
        throw new Error('Could not complete registration');
      }
  
      // After successful registration, re-fetch the training sessions to update the UI
      await fetchTrainingSessions();
    } catch (error) {
      console.error('Registration failed:', error);
    }
  }; 

  const handleCancelTrainingSession = async (sessionId) => {
    try {
      const response = await fetch('/api/cancel-training-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, sessionId }),
      });
  
      if (!response.ok) {
        throw new Error('Could not cancel registration');
      }
  
      // After successful cancellation, re-fetch the training sessions to update the UI
      await fetchTrainingSessions();
    } catch (error) {
      console.error('Cancellation failed:', error);
    }
  };  

  const latestHealthMetric = healthStats[0] ? (
    <div className="left-box">
      <h2>Health Stats:</h2>
      <p><strong>Weight</strong>: {healthStats[0].weight} kg</p>
      <p><strong>Height</strong>: {healthStats[0].height} cm</p>
      <p><strong>BMI</strong>: {healthStats[0].bmi}</p>
    </div>
  ) : (
    <div className="left-box">
      <h2>Health Stats:</h2>
      <p>No health stats available</p>
    </div>
  );

  // Separate classes into registered and available
  const registeredClasses = classes.filter((classItem) => classItem.is_registered);
  const availableClasses = classes.filter((classItem) => !classItem.is_registered);

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
            <div className="classes-section">
              <h3>Registered Classes:</h3>
              <ul className="classes-list">
                {registeredClasses.map((classItem) => (
                  <li key={classItem.class_id}>
                    <strong>{classItem.class_name}</strong> - {classItem.date.substring(0, 10)} at {classItem.start_time}, Room: {classItem.room_name}
                    <button className="cancel-btn" onClick={() => handleCancelRegistration(classItem.class_id)}>Cancel Registration</button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="classes-section">
              <h3>Available Classes:</h3>
              <ul className="classes-list">
                {availableClasses.map((classItem) => (
                  <li key={classItem.class_id}>
                    <strong>{classItem.class_name}</strong> - {classItem.date.substring(0, 10)} at {classItem.start_time}, Room: {classItem.room_name}
                    <button className="register-btn" onClick={() => handleRegisterClass(classItem.class_id)}>Register</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="right-box">
            <h2>Registered Training Sessions:</h2>
            <ul className="training-sessions-list">
              {trainingSessions.registeredSessions.map(session => (
                <li key={session.session_id}>
                  <strong>{session.trainer_name}</strong> - {session.date.substring(0, 10)} at {session.start_time}, Room: {session.room_name}
                  <button className="cancel-btn" onClick={() => handleCancelTrainingSession(session.session_id)}>Cancel Reservation</button>
                </li>
              ))}
            </ul>
            <h2>Available Training Sessions:</h2>
            <ul className="training-sessions-list">
              {trainingSessions.availableSessions.map(session => (
                <li key={session.session_id}>
                  <strong>{session.trainer_name}</strong> - {session.date.substring(0, 10)} at {session.start_time}, Room: {session.room_name}
                  <button className="register-btn" onClick={() => handleRegisterTrainingSession(session.session_id)}>Register</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;