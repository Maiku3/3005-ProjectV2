import React, { useState, useEffect } from 'react';
import './TrainerSchedule.css';

const TrainerSchedule = ({setUserRole}) => {
  const [date, setDate] = useState(''); 
  const [rooms, setRooms] = useState([]); 
  const [endTime, setEndTime] = useState('');
  const [members, setMembers] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [selectedMember, setSelectedMember] = useState(null);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [isSessionCreated, setIsSessionCreated] = useState(false); 

  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      fetchMembers();
      fetchRooms();
      fetchTrainingSessions();
    }
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/members`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('ERROR: Unable to fetch members', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch(`/api/rooms`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setRooms(data);
      setSelectedRoom(data[0].room_id);
    } catch (error) {
      console.error('ERROR: Unable to fetch rooms', error);
    }
  };

  const fetchTrainingSessions = async () => {
    try {
      const response = await fetch(`/api/training-sessions/${userId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setTrainingSessions(data);
    } catch (error) {
      console.error('ERROR: Unable to fetch training sessions', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/create-training-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, memberId: null, date, startTime, endTime, selectedRoom }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      setIsSessionCreated(true);
      fetchTrainingSessions();
      const data = await response.json();
    } catch (error) {
      console.error('ERROR: Unable to submit new training session', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelSession = async (sessionId, slotId) => {
    if (window.confirm('Are you sure you want to cancel this training session?')) {
      try {
        const response = await fetch('/api/delete-training-session', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId, slotId }),
        });
    
        if (response.ok) {
          fetchTrainingSessions();
        } else {
          console.error('Failed to cancel the session.');
        }
      } catch (error) {
        console.error('Error cancelling the session:', error);
      }
    }
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  const closeModal = () => {
    setSelectedMember(null);
  };
  
  return (
    <div>
      <div className="profile-container">
        <div className="top-bar">
          <h1>Trainer Panel</h1>
          <div className="logout-button" onClick={() => setUserRole(null)}>
            <h3>logout</h3>
          </div>
        </div>
        <div className="columns">
          <div className="left-section">
            <div className="member-box">
              <h2>Schedule a Training Session:</h2>
              <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                  <label htmlFor="date">Date:</label>
                  <input 
                    type="date" 
                    id="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="startTime">Start Time:</label>
                  <input 
                    type="time"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endTime">End Time:</label>
                  <input 
                    type="time" 
                    id="endTime" 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="room">Room:</label>
                  <select 
                    id="room"
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                  >
                    {rooms.map((room) => (
                      <option key={room.room_id} value={room.room_id}>
                        {room.room_name} 
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Create Session'}
                  </button>
                </div>
                {isSessionCreated && (
                  <p className="success-message">Session Created Successfully!</p>
                )} 
              </form>
            </div>
          </div>
          <div className="right-section">
            <div className="box">
              <h2>Members</h2>
              <ul>
                {members.map((member) => (
                  <li key={member.user_id} onClick={() => handleMemberClick(member)}>
                    {member.first_name} {member.last_name}
                  </li>
                ))}
              </ul>
              {selectedMember && (
                <div className="modal" onClick={closeModal}>
                  <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <span className="close" onClick={closeModal}>&times;</span>
                    <h3>{selectedMember.first_name} {selectedMember.last_name}</h3>
                    <p>{selectedMember.email}</p>
                    <p>{selectedMember.phone}</p>
                    <p>{selectedMember.address}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="box">
              <h2>Training Sessions:</h2>
              {trainingSessions.length > 0 ? (
                <ul>
                  {trainingSessions.map((session) => (
                    <li key={session.slot_id}>
                      Date: {session.date.substring(0, 10)} at {session.start_time} to {session.end_time}, Room: {session.room_name}
                      <button className="cancel-btn" onClick={() => cancelSession(session.session_id, session.slot_id)}>Cancel</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No training sessions found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerSchedule;