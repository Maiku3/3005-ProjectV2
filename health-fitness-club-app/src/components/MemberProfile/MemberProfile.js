import React, { useState, useEffect } from 'react';
import './MemberProfile.css';

const MemberProfile = ({setUserRole}) => {
  const [classes, setClasses] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [healthStats, setHealthStats] = useState([]);
  const [fitnessGoals, setFitnessGoals] = useState([]);
  const [personalInfo, setPersonalInfo] = useState({});
  const [exerciseRoutines, setExerciseRoutines] = useState([]);
  const [fitnessAcheivements, setfitnessAcheivements] = useState([]);
  const [isViewingDashboard, setIsViewingDashboard] = useState(true);
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
      fetchPersonalInfo();
      fetchFitnessGoals();
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchFitnessAcheivements();
      fetchHealthStats();
    }
  }, [isViewingDashboard]);

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

  const fetchPersonalInfo = async () => {
    try {
      const response = await fetch(`/api/personal-info/${userId}`);
      if (!response.ok) {
        throw new Error('Could not fetch personal information');
      }
      const data = await response.json();
      setPersonalInfo(data);
    } catch (error) {
      console.error('Error fetching personal information:', error);
    }
  }

  const handleEdit = (field) => {
    const newValue = prompt(`Enter your new ${field}:`);

    if (newValue === null) return;
  
    if (field === 'email' && !validateEmail(newValue)) {
      alert('Please enter a valid email address.');
      return;
    }
  
    updatePersonalInfo(field, newValue);
  };

  const validateEmail = (email) => {
    // Simple email validation regex
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()\[\]\\.,;:\s@"]+\.)+[^<>()\[\]\\.,;:\s@"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  const updatePersonalInfo = async (field, value) => {
    try {
      const response = await fetch(`/api/update-info/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ field, value }),
      });
  
      if (!response.ok) {
        if (response.status === 409) {
          alert('Email already exists. Please use a different email.');
        } else {
          throw new Error('Failed to update information');
        }
      } else {
        const updatedInfo = await response.json();
        setPersonalInfo(prevInfo => ({ ...prevInfo, [field]: updatedInfo[field] }));
      }
    } catch (error) {
      console.error('Error updating personal information:', error);
    }
  };

  const fetchFitnessGoals = async () => {
    try {
      const response = await fetch(`/api/fitness-goals/${userId}`);
      if (!response.ok) {
        throw new Error('Could not fetch fitness goals');
      }
      const data = await response.json();
      setFitnessGoals(data);
    } catch (error) {
      console.error('Error fetching fitness goals:', error);
    }
  };

  const addFitnessGoal = async () => {
    const goalDescription = prompt('Enter your new fitness goal:');
    if (!goalDescription) return; // User cancelled the prompt

    const targetDate = prompt('Enter the target date (YYYY-MM-DD):');
    if (!targetDate) return; // User cancelled the prompt

    try {
      const response = await fetch(`/api/fitness-goals/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goalDescription, targetDate }),
      });

      if (!response.ok) {
        throw new Error('Failed to add new fitness goal');
      }

      const newGoal = await response.json();
      setFitnessGoals(fitnessGoals => [...fitnessGoals, newGoal]);
    } catch (error) {
      console.error('Error adding new fitness goal:', error);
    }
  };

  const removeFitnessGoal = async (goalId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this goal?');
    if (!confirmDelete) return; // User cancelled the delete action

    try {
      const response = await fetch(`/api/fitness-goals/${goalId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete fitness goal');
      }

      // Update the UI by filtering out the deleted goal
      setFitnessGoals(fitnessGoals => fitnessGoals.filter(goal => goal.goal_id !== goalId));
    } catch (error) {
      console.error('Error deleting fitness goal:', error);
    }
  };

  const completeFitnessGoal = async (goalId) => {
    try {
      const response = await fetch(`/api/fitness-goals/complete/${goalId}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to complete fitness goal');
      }

      const updatedGoal = await response.json();

      // Update the UI by mapping over the current goals and updating the completed one
      setFitnessGoals(fitnessGoals => fitnessGoals.map(goal => {
        if (goal.goal_id === updatedGoal.goal_id) {
          return updatedGoal;
        }
        return goal;
      }));
    } catch (error) {
      console.error('Error completing fitness goal:', error);
    }
  };

  const editHealthMetric = async (metric) => {
    if (healthStats.length === 0) {
      alert('No health stats to edit.');
      return;
    }
  
    const newValue = prompt(`Enter new ${metric}:`);
    if (isNaN(newValue) || newValue === null || newValue.trim() === '') {
      alert('Please enter a valid number');
      return;
    }
  
    // Prepare the request body with both weight and height
    const requestBody = { weight: healthStats[0].weight, height: healthStats[0].height };
    requestBody[metric] = parseFloat(newValue);
  
    try {
      const response = await fetch(`/api/health-metrics/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update ${metric}`);
      }
  
      const updatedHealthMetric = await response.json();
  
      // Update the most recent health stats record in state
      setHealthStats([updatedHealthMetric, ...healthStats.slice(1)]);
    } catch (error) {
      console.error(`Error updating ${metric}:`, error);
    }
  };

  const addExerciseRoutine = async () => {
    const routineName = prompt('Enter the exercise routine name:');
    if (!routineName || routineName.trim() === '') {
      alert('Exercise routine name is required.');
      return;
    }
  
    const description = prompt('Enter the exercise routine description:');
    if (!description || description.trim() === '') {
      alert('Exercise routine description is required.');
      return;
    }
  
    try {
      const response = await fetch('/api/exercise-routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ member_id: userId, routine_name: routineName, description: description }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add exercise routine');
      }
  
      const newRoutine = await response.json();
      setExerciseRoutines([...exerciseRoutines, newRoutine]);
    } catch (error) {
      console.error('Error adding exercise routine:', error);
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

  const removeExerciseRoutine = async (routineId) => {
    if (!window.confirm('Are you sure you want to remove this exercise routine?')) {
      return;
    }
  
    try {
      const response = await fetch(`/api/exercise-routines/${routineId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to remove exercise routine');
      }
  
      // Filter out the removed routine and update state
      setExerciseRoutines(exerciseRoutines.filter(routine => routine.routine_id !== routineId));
    } catch (error) {
      console.error('Error removing exercise routine:', error);
    }
  };  

  // Separate classes into registered and available
  const registeredClasses = classes.filter((classItem) => classItem.is_registered);
  const availableClasses = classes.filter((classItem) => !classItem.is_registered);

  return (
    <div className="profile-container">
      {isViewingDashboard ? (
        <>
          <div className="top-bar">
            <h1>Welcome, {firstName}</h1>
            <div className="profile-picture" onClick={() => setIsViewingDashboard(false)}>
              <h1>{firstName[0]}</h1>
            </div>
          </div>
          <div className="columns">
            <div className="left-section">
              <div className="left-box">
                <h2>Exercise Routines:</h2>
                <button className="add-goal-button" onClick={addExerciseRoutine}>Add Exercise Routine</button>
                <ul>
                  {exerciseRoutines.map(routine => (
                    <li key={routine.routine_id}>
                      <strong>{routine.routine_name}</strong>: {routine.description}
                      <button className="cancel-btn" onClick={() => removeExerciseRoutine(routine.routine_id)}>Remove</button>
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
                  <h2>Registered Classes:</h2>
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
                  <h2>Available Classes:</h2>
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
        </>
      ) : (
        <>
          <div className="top-bar">
            <h1>Manage Your Profile</h1>
            <div className="back-to-dashboard" onClick={() => setIsViewingDashboard(true)}>
              <h3>back to dashboard</h3>
            </div>
            <div className="logout" onClick={() => setUserRole(null)}>
              <h3>logout</h3>
            </div>
          </div>
          <div className="profile-management-container">
            <div className="middle-box">
              <h2>Personal Information:</h2>
              <p><strong>Email</strong>: {personalInfo.email} <button className="edit-button" onClick={() => handleEdit('email')}>Edit</button></p>
              <p><strong>Phone</strong>: {personalInfo.phone} <button className="edit-button" onClick={() => handleEdit('phone')}>Edit</button></p>
              <p><strong>Address</strong>: {personalInfo.address} <button className="edit-button" onClick={() => handleEdit('address')}>Edit</button></p>
            </div>
            <div className="middle-box">
              <h2>Fitness Goals:</h2>
              <button onClick={addFitnessGoal} className="add-goal-button">Add Goal</button>
              <ul>
                {fitnessGoals.map(goal => (
                  <li key={goal.goal_id}>
                    <strong>Description:</strong> {goal.goal_description} <br/>
                    <strong>Start Date:</strong> {goal.start_date.substring(0, 10)} <br/>
                    <strong>Target Date:</strong> {goal.target_date.substring(0, 10)} <br/>
                    <strong>Status:</strong>
                    <span className={goal.is_completed ? 'status-completed' : ''}>
                      {goal.is_completed ? 'Completed' : 'In Progress'}
                    </span>
                    {!goal.is_completed && (
                      <button onClick={() => completeFitnessGoal(goal.goal_id)} className="button-complete">Complete Goal</button>
                    )}
                    <button onClick={() => removeFitnessGoal(goal.goal_id)} className="button-remove">Remove Goal</button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="middle-box">
              <h2>Health Stats:</h2>
              <p>
                <strong>Weight:</strong> {healthStats[0].weight} kg
                <button className="edit-button" onClick={() => editHealthMetric('weight')}>Edit</button>
              </p>
              <p>
                <strong>Height:</strong> {healthStats[0].height} cm
                <button className="edit-button" onClick={() => editHealthMetric('height')}>Edit</button>
              </p>
              <p>
                <strong>BMI:</strong> {healthStats[0].bmi}
              </p>
            </div>
          </div>
        </>
      )}
      
    </div>
  );
};

export default MemberProfile;