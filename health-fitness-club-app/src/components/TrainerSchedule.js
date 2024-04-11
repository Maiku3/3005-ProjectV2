import React, { useState, useEffect } from 'react';

const TrainerSchedule = () => {
  const [members, setMembers] = useState([]);

  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
   const fetchMembers = async () => {
     try {
       const response = await fetch(`/api/members`);
       if (!response.ok) {
         throw new Error('Network response was not ok');
       }
       const data = await response.json();
       console.log(`Data: \n${data}`)
       setMembers(data);
     } catch (error) {
       console.error('There has been a problem with your fetch operation:', error);
     }
   };

   if (userId) {
    fetchMembers();
  }
  }, []);

  return (
    <div>
      <h1>Trainer Schedule</h1>
      <p>This is the Trainer Schedule component where trainers can manage their schedules and view member profiles.</p>
      <ul>
        {members.map((member) => (
          <li key={member.id}>{member.first_name} {member.last_name}</li>
        ))}
      </ul>
    </div>
  );
};

export default TrainerSchedule;