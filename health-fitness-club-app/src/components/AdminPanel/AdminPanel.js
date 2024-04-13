import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const AdminPanel = ({setUserRole}) => {
  const [classes, setClasses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [roomBookings, setRoomBookings] = useState([]);

  useEffect(() => {
      fetchRoomBookings();
      fetchClasses();
      fetchEquipment();
      fetchPayments();
  }, []);

  const fetchRoomBookings = async () => {
    try {
      const response = await fetch('/api/room-bookings');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setRoomBookings(data);
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  };

  const handleAddClassClick = async () => {
    const className = prompt('Enter the class name:');
    if (!className) return;

    const date = prompt('Enter the date for the class (YYYY-MM-DD):');
    if (!date) return;

    const startTime = prompt('Enter the start time for the class (HH:MM):');
    if (!startTime) return;

    const endTime = prompt('Enter the end time for the class (HH:MM):');
    if (!endTime) return;

    try {
      const roomsResponse = await fetch('/api/rooms');
      const roomsData = await roomsResponse.json();
      const roomNames = roomsData.map(room => room.room_name).join(', ');
      const roomName = prompt(`Enter the room name for the class (${roomNames}):`);
      const room = roomsData.find(r => r.room_name === roomName);
      if (!room) {
        alert('Invalid room name.');
        return;
      }

      const newClassResponse = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          class_name: className,
          date,
          start_time: startTime,
          end_time: endTime,
          room_id: room.room_id,
        }),
      });

      if (newClassResponse.ok) {
        fetchClasses();
        fetchRoomBookings();
      } else {
        const errorData = await newClassResponse.json();
        alert(`Error adding class: ${errorData.message}`);
      }
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
      alert('Failed to add the class. Please try again.');
    }
  };

  const handleRemoveClassClick = async (classId, slotId) => {
    if (window.confirm('Are you sure you want to remove this class?')) {
      try {
        const response = await fetch(`/api/classes/${classId}/${slotId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchClasses();
          fetchRoomBookings();
        } else {
          const errorData = await response.json();
          alert(`Error removing class: ${errorData.message}`);
        }
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        alert('Failed to remove the class. Please try again.');
      }
    }
  };

  const handleEditClassClick = async (classId, slotId) => {
    const newDate = prompt('Enter the new date for the class (YYYY-MM-DD):');
    if (!newDate) return;

    const newStartTime = prompt('Enter the new start time for the class (HH:MM):');
    if (!newStartTime) return;

    const newEndTime = prompt('Enter the new end time for the class (HH:MM):');
    if (!newEndTime) return;

    try {
      const response = await fetch(`/api/classes/${classId}/${slotId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: newDate,
          start_time: newStartTime,
          end_time: newEndTime,
        }),
      });

      if (response.ok) {
        fetchClasses();
        fetchRoomBookings();
      } else {
        const errorData = await response.json();
        alert(`Error updating class: ${errorData.message}`);
      }
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
      alert('Failed to update the class. Please try again.');
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await fetch('/api/equipment');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setEquipment(data);
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  };

  const handleAddEquipmentClick = async () => {
    const name = prompt('Enter the equipment name:');
    if (!name) return;

    const status = prompt('Enter the status of the equipment (Available, Repairing or Unavailable):');
    if (!status) return;

    try {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          status,
        }),
      });

      if (response.ok) {
        fetchEquipment();
      } else {
        const errorData = await response.json();
        alert(`Error adding equipment: ${errorData.message}`);
      }
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
      alert('Failed to add the equipment. Please try again.');
    }
  };

  const handleRemoveEquipmentClick = async (equipmentId) => {
    if (window.confirm('Are you sure you want to remove this equipment?')) {
      try {
        const response = await fetch(`/api/equipment/${equipmentId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchEquipment();
        } else {
          const errorData = await response.json();
          alert(`Error removing equipment: ${errorData.message}`);
        }
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        alert('Failed to remove the equipment. Please try again.');
      }
    }
  };

  const handleSetStatusClick = async (equipmentId) => {
    const status = prompt('Enter the status of the equipment (Available, Repairing, or Unavailable):');
    const validStatuses = ['Available', 'Repairing', 'Unavailable'];
    if (!status || !validStatuses.includes(status)) {
      alert('Error: Invalid status. Please enter one of the following: Available, Repairing, Unavailable.');
      return;
    }

    try {
      const response = await fetch(`/api/equipment/status/${equipmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchEquipment();
      } else {
        const errorData = await response.json();
        alert(`Error setting equipment status: ${errorData.message}`);
      }
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
      alert('Failed to set the equipment status. Please try again.');
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  };

  const handleCancelBookingClick = async (slotId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const response = await fetch(`/api/bookings/cancel/${slotId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchClasses();
          fetchRoomBookings();
        } else {
          const errorData = await response.json();
          alert(`Error cancelling booking: ${errorData.message}`);
        }
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        alert('Failed to cancel the booking. Please try again.');
      }
    }
  };

  return (
    <div className="profile-container">
      <div className="top-bar">
        <h1>Admin Panel</h1>
        <div className="logout-button" onClick={() => setUserRole(null)}>
          <h3>logout</h3>
        </div>
      </div>
      <div className="columns">
        <div className="left-section">
          <div className="box">
            <h2>Room Bookings:</h2>
            {Object.keys(roomBookings).map(room => (
              <div key={room}>
                <h3>{room}</h3>
                <ul>
                  {roomBookings[room].map((booking, index) => (
                    <li key={index}>
                      <strong>{booking.date.substring(0, 10)}</strong> {booking.start_time} - {booking.end_time}
                      <button className="cancel-btn" onClick={() => handleCancelBookingClick(booking.slot_id)}>Cancel Booking</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="box">
            <h2>Classes:</h2>
            <button className="add-goal-button" onClick={handleAddClassClick}>Add Class</button>
            <ul>
              {classes.map((classItem) => (
                <li key={classItem.class_id}>
                  <strong>{classItem.class_name}</strong> - {classItem.date.substring(0, 10)} {classItem.start_time} - {classItem.end_time}
                  <button className="edit-button" onClick={() => handleEditClassClick(classItem.class_id, classItem.slot_id)}>Reschedule</button>
                  <button className="cancel-btn" onClick={() => handleRemoveClassClick(classItem.class_id, classItem.slot_id)}>Remove Class</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="right-section">
          <div className="box">
            <h2>Fitness Equipment:</h2>
            <button className="add-goal-button" onClick={handleAddEquipmentClick}>Add Equipment</button>
            <ul>
              {equipment.map((equip, index) => (
                <li key={equip.equipment_id}>
                  {equip.name} ({equip.status})
                  <button className="edit-button" onClick={() => handleSetStatusClick(equip.equipment_id)}>Set Status</button>
                  <button className="cancel-btn" onClick={() => handleRemoveEquipmentClick(equip.equipment_id)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
          <div className="box">
            <h2>Payments:</h2>
            <ul>
              {payments.map((payment) => (
                <li key={payment.transaction_id}>
                  <strong>${`${payment.sum}`}</strong>
                  {` [Membership Fee] - ${payment.date.substring(0, 10)} | ${payment.first_name} ${payment.last_name} (Method: ${payment.payment_method})`}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;