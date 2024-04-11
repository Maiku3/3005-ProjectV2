import React, { useState, useEffect } from 'react';

const TrainerSchedule = () => {
  const [members, setMembers] = useState([]);
  const [date, setDate] = useState(''); 
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [rooms, setRooms] = useState([]); 
  const [trainingSessions, setTrainingSessions] = useState([]);

  const userId = sessionStorage.getItem("userId");

  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [isSessionCreated, setIsSessionCreated] = useState(false); 

  useEffect(() => {
  // Fetch members
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
    // Fetch rooms for dropdown
    const fetchRooms = async () => {
      try {
        const response = await fetch(`/api/rooms`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setRooms(data);
        setSelectedRoom(data[0].room_id); // Set default room
      } catch (error) {
        console.error('ERROR: Unable to fetch rooms', error);
      }
    };

    // Fetch training sessions with userId
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

    if (userId) {
      fetchMembers();
      fetchRooms();
      fetchTrainingSessions();
    }
  }, []);

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
      setIsSessionCreated(true);  // Show success
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('ERROR: Unable to submit new training session', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Trainer Schedule</h1>
      <p>This is the Trainer Schedule component where trainers can manage their schedules and view member profiles.</p>
      <ul>
        {members.map((member) => (
          <li key={member.id}>{member.first_name} {member.last_name}</li>
        ))}
      </ul>

      <h2>Schedule a Training Session</h2> {/* Added heading */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="date">Date:</label>
          <input 
            type="date" 
            id="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label htmlFor="startTime">Start Time:</label>
          <input 
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label htmlFor="endTime">End Time:</label>
          <input 
            type="time" 
            id="endTime" 
            value={endTime} 
            onChange={(e) => setEndTime(e.target.value)}
            required 
          />
        </div>
        <div>
          <label htmlFor="room">Room:</label>
          <select id="room" value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
            {rooms.map((room) => (
              <option key={room.room_id} value={room.room_id}>
                {room.room_name} 
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disbaled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Create Session'}
        </button>
        {isSessionCreated && (
          <p style={{ color: 'green' }}>Session Created Successfully!</p>
         )} 
      </form> 
      <h2>
        Training Sessions
      </h2>
      {trainingSessions.length > 0 ? (
        <ul>
          {trainingSessions.map((session) => (
            <li key={session.slot_id}>
              Date: {session.date.substring(0, 10)} at {session.start_time} to {session.end_time}, Room: {session.room_name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No training sessions found.</p>
      )}
    </div>
  );
};

export default TrainerSchedule;