const express = require('express');
const path = require('path');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query(
      `SELECT * FROM user_account WHERE email = $1 AND password = $2`,
      [email, password]
    );
    if (user.rows.length > 0) {
      const userInfo = user.rows[0];
      res.json({ role: userInfo.role, id: userInfo.user_id });
    } else {
      res.status(400).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { email, password, firstName, lastName, phone, address, birthday, role, joinDate, membershipEndDate, weight, height, bmi, paymentMethod } = req.body;
  
  try {
    await pool.query('BEGIN');

    // Check if the email already exists
    const emailCheck = await pool.query(
      `SELECT 1 FROM user_account WHERE email = $1`,
      [email]
    );

    if (emailCheck.rowCount > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const newUser = await pool.query(
      `INSERT INTO user_account (email, password, first_name, last_name, phone, address, birthday, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [email, password, firstName, lastName, phone, address, birthday, role]
    );

    const user_id = newUser.rows[0].user_id;

    await pool.query(
      `INSERT INTO member (user_id, join_date, membership_end_date)
       VALUES ($1, $2, $3)`,
      [user_id, joinDate, membershipEndDate]
    );

    await pool.query(
      `INSERT INTO health_metric (member_id, weight, height, bmi, date)
       VALUES ($1, $2, $3, $4, $5)`,
      [user_id, weight, height, bmi, joinDate]
    );

    await pool.query(
      `INSERT INTO payment (member_id, sum, date, payment_method)
       VALUES ($1, $2, $3, $4)`,
      [user_id, 99.99, joinDate, paymentMethod]
    );

    await pool.query('COMMIT');
    res.json({ role: newUser.rows[0].role, id: user_id });
  } catch (err) {
    await pool.query('ROLLBACK');
    
    console.error(err.message);
    if (err.code === '23505') {
      res.status(400).json({ error: 'User already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// Backend endpoint to get first name for a specific user
app.get('/api/first-name/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const userDetails = await pool.query(
      `SELECT first_name FROM user_account WHERE user_id = $1`,
      [userId]
    );
    if (userDetails.rows.length > 0) {
      res.json(userDetails.rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Backend endpoint to get exercise routines for a specific user
app.get('/api/exercise-routines/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const exerciseRoutines = await pool.query(
      `SELECT * FROM exercise_routine WHERE member_id = $1 ORDER BY routine_id`,
      [userId]
    );
    res.json(exerciseRoutines.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Backend endpoint to get completed fitness goals for a specific user
app.get('/api/fitness-achievements/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const completedGoals = await pool.query(
      `SELECT * FROM fitness_goal WHERE member_id = $1 AND is_completed = TRUE ORDER BY goal_id`,
      [userId]
    );
    res.json(completedGoals.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get health metrics for a specific user
app.get('/api/health-stats/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const healthMetrics = await pool.query(
      `SELECT * FROM health_metric WHERE member_id = $1 ORDER BY date DESC`,
      [userId]
    );
    res.json(healthMetrics.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

/*
Trainer Functionality
*/
// Endpoint to get list of members
app.get('/api/members', async (req, res) => {
  try {
    const members = await pool.query(
      `SELECT * FROM user_account 
      WHERE role = 'Member'`
    );
    res.json(members.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to create a training session with a booking slot 
app.post('/api/create-training-session', async (req, res) => {
  const { userId, memberId, date, startTime, endTime, selectedRoom} = req.body;
  try {
    await pool.query('BEGIN');
    const bookingSlot = await pool.query(
      `INSERT INTO booking_slot (date, start_time, end_time, room_id)
       VALUES ($1, $2, $3, $4) 
       RETURNING slot_id`,
       [date, startTime, endTime, selectedRoom]
    );

    const slotId = bookingSlot.rows[0].slot_id;

    const trainingSession = await pool.query(
      `INSERT INTO training_session (trainer_id, member_id, slot_id)
       VALUES ($1, $2, $3)`,
      [userId, memberId || null, slotId]
    );

    await pool.query('COMMIT');
    res.json({message: 'New Training Session Created' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get a list of training sessions of a certain trainer
app.get('/api/training-sessions/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const trainingSessions = await pool.query(
      `SELECT ts.*, bs.date, bs.start_time, bs.end_time, r.room_name
       FROM training_session ts
       JOIN booking_slot bs ON ts.slot_id = bs.slot_id
       JOIN room r ON bs.room_id = r.room_id  -- Join with the room table
       WHERE ts.trainer_id = $1`,
      [userId]
    );
    res.json(trainingSessions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get rooms for dropdown
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await pool.query(
      `SELECT * FROM room`
    );
    res.json(rooms.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Backend endpoint to get all classes with registration status for a specific user
app.get('/api/classes/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const classesData = await pool.query(
      `SELECT cl.class_id, cl.class_name, bs.date, bs.start_time, r.room_name,
       CASE WHEN cr.member_id = $1 THEN true ELSE false END AS is_registered
       FROM class cl
       JOIN booking_slot bs ON cl.slot_id = bs.slot_id
       JOIN room r ON cl.room_id = r.room_id
       LEFT JOIN class_registration cr ON cl.class_id = cr.class_id AND cr.member_id = $1
       ORDER BY bs.date, bs.start_time`,
      [userId]
    );
    res.json(classesData.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Backend endpoint to register a user for a class
app.post('/api/register-class', async (req, res) => {
  const { userId, classId } = req.body;
  try {
    await pool.query(
      `INSERT INTO class_registration (member_id, class_id) VALUES ($1, $2)`,
      [userId, classId]
    );
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Backend endpoint to cancel a user's registration for a class
app.delete('/api/cancel-class', async (req, res) => {
  const { userId, classId } = req.body;
  try {
    const result = await pool.query(
      `DELETE FROM class_registration WHERE member_id = $1 AND class_id = $2`,
      [userId, classId]
    );
    if (result.rowCount > 0) {
      res.json({ message: 'Cancellation successful' });
    } else {
      res.status(404).json({ message: 'Registration not found' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Backend endpoint to get all training sessions including available sessions
app.get('/api/list-training-sessions/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const trainingSessionsData = await pool.query(
      `SELECT
          ts.session_id,
          ts.trainer_id,
          u.first_name || ' ' || u.last_name AS trainer_name,
          ts.member_id,
          bs.date,
          bs.start_time,
          bs.end_time,
          r.room_name,
          CASE WHEN ts.member_id = $1 THEN 'registered' ELSE 'available' END AS session_status
       FROM
          training_session ts
       JOIN
          booking_slot bs ON ts.slot_id = bs.slot_id
       JOIN
          room r ON bs.room_id = r.room_id
       JOIN
          trainer t ON ts.trainer_id = t.user_id
       JOIN
          user_account u ON t.user_id = u.user_id
       WHERE
          ts.member_id = $1 OR ts.member_id IS NULL
       ORDER BY
          bs.date, bs.start_time`,
      [userId]
    );
    res.json(trainingSessionsData.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Backend endpoint to register for a training session
app.post('/api/register-training-session', async (req, res) => {
  const { userId, sessionId } = req.body;
  try {
    const updateData = await pool.query(
      `UPDATE training_session
       SET member_id = $1
       WHERE session_id = $2 AND member_id IS NULL
       RETURNING *`,
      [userId, sessionId]
    );

    if (updateData.rowCount === 0) {
      return res.status(404).json({ message: 'Session not found or already registered' });
    }

    res.json(updateData.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Backend endpoint to cancel a training session registration
app.post('/api/cancel-training-session', async (req, res) => {
  const { userId, sessionId } = req.body;
  try {
    const updateData = await pool.query(
      `UPDATE training_session
       SET member_id = NULL
       WHERE session_id = $1 AND member_id = $2
       RETURNING *`, // This will return the updated row
      [sessionId, userId]
    );

    if (updateData.rowCount === 0) {
      return res.status(404).json({ message: 'Session not found or not registered by this user' });
    }

    res.json(updateData.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Backend endpoint to get personal information for a specific user
app.get('/api/personal-info/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const userInfo = await pool.query(
      `SELECT first_name, last_name, email, phone, address, birthday FROM user_account WHERE user_id = $1`,
      [userId]
    );
    if (userInfo.rows.length > 0) {
      res.json(userInfo.rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Backend endpoint to update personal information for a specific user
app.put('/api/update-info/:userId', async (req, res) => {
  const { userId } = req.params;
  const { field, value } = req.body;

  const updateQuery = {
    email: `UPDATE user_account SET email = $1 WHERE user_id = $2 RETURNING email`,
    phone: `UPDATE user_account SET phone = $1 WHERE user_id = $2 RETURNING phone`,
    address: `UPDATE user_account SET address = $1 WHERE user_id = $2 RETURNING address`,
  };

  try {
    const updateResult = await pool.query(updateQuery[field], [value, userId]);
    if (updateResult.rows.length > 0) {
      res.json(updateResult.rows[0]);
    } else {
      res.status(404).json({ error: 'Update failed or no changes made' });
    }
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      console.error(err.message);
      res.status(500).json({ error: err.message });
    }
  }
});

// Backend endpoint to get fitness goals for a specific member
app.get('/api/fitness-goals/:memberId', async (req, res) => {
  const { memberId } = req.params;
  try {
    const fitnessGoals = await pool.query(
      `SELECT goal_id, goal_description, target_date, start_date, is_completed FROM fitness_goal WHERE member_id = $1`,
      [memberId]
    );
    res.json(fitnessGoals.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Backend endpoint to add a new fitness goal for a specific member
app.post('/api/fitness-goals/:memberId', async (req, res) => {
  const { memberId } = req.params;
  const { goalDescription, targetDate } = req.body;
  const startDate = new Date();

  try {
    const newGoal = await pool.query(
      `INSERT INTO fitness_goal (member_id, goal_description, target_date, start_date, is_completed)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [memberId, goalDescription, targetDate, startDate, false]
    );
    res.status(201).json(newGoal.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Backend endpoint to delete a fitness goal for a specific member
app.delete('/api/fitness-goals/:goalId', async (req, res) => {
  const { goalId } = req.params;

  try {
    await pool.query(
      `DELETE FROM fitness_goal WHERE goal_id = $1`,
      [goalId]
    );
    res.status(200).json({ message: 'Goal deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Backend endpoint to mark a fitness goal as completed for a specific member
app.put('/api/fitness-goals/complete/:goalId', async (req, res) => {
  const { goalId } = req.params;

  try {
    const updateGoal = await pool.query(
      `UPDATE fitness_goal SET is_completed = TRUE WHERE goal_id = $1 RETURNING *`,
      [goalId]
    );
    if (updateGoal.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(updateGoal.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Backend endpoint to update weight, height, and recalculate BMI
app.put('/api/health-metrics/:memberId', async (req, res) => {
  const { memberId } = req.params;
  let { weight, height } = req.body;

  // Start a database transaction
  try {
    await pool.query('BEGIN');

    const existingMetrics = await pool.query(
      `SELECT weight, height FROM health_metric WHERE member_id = $1 ORDER BY date DESC LIMIT 1`,
      [memberId]
    );

    if (existingMetrics.rowCount === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Health metrics not found for the given member ID' });
    }

    if (weight === 0 || height === 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Height or weight cannot be zero' });
    }

    const newBMI = weight / Math.pow(height / 100, 2);

    // Ensure new values do not exceed defined scale and precision
    if (newBMI >= 1000 || weight >= 10000 || height >= 1000) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Numeric field overflow' });
    }

    const updateHealthMetrics = await pool.query(
      `UPDATE health_metric
       SET weight = $1,
           height = $2,
           bmi = $3
       WHERE member_id = $4
       RETURNING *`,
      [weight, height, newBMI, memberId]
    );

    await pool.query('COMMIT');

    res.json(updateHealthMetrics.rows[0]);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Backend endpoint to handle the addition of a new exercise routine
app.post('/api/exercise-routines', async (req, res) => {
  const { member_id, routine_name, description } = req.body;

  try {
    const newRoutine = await pool.query(
      `INSERT INTO exercise_routine (member_id, routine_name, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [member_id, routine_name, description]
    );

    res.status(201).json(newRoutine.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/exercise-routines/:routineId', async (req, res) => {
  const { routineId } = req.params;

  try {
    const deleteRoutine = await pool.query(
      `DELETE FROM exercise_routine
       WHERE routine_id = $1
       RETURNING *`,
      [routineId]
    );

    if (deleteRoutine.rowCount === 0) {
      return res.status(404).json({ error: 'Exercise routine not found' });
    }

    res.status(200).json({ message: 'Exercise routine removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Backend endpoint to fetch the list of room bookings
app.get('/api/room-bookings', async (req, res) => {
  try {
    const roomBookingsQuery = `
      SELECT r.room_name, bs.date, bs.start_time, bs.end_time, bs.slot_id
      FROM booking_slot bs
      INNER JOIN room r ON bs.room_id = r.room_id
      ORDER BY r.room_name, bs.date, bs.start_time
    `;
    const roomBookingsResult = await pool.query(roomBookingsQuery);
    const roomBookingsData = roomBookingsResult.rows;

    const organizedBookings = {};
    roomBookingsData.forEach(booking => {
      const roomName = booking.room_name;
      if (!organizedBookings[roomName]) {
        organizedBookings[roomName] = [];
      }
      organizedBookings[roomName].push({
        date: booking.date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        slot_id: booking.slot_id,
      });
    });

    res.json(organizedBookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/classes', async (req, res) => {
  try {
    const classesQuery = `
      SELECT c.class_name, bs.date, bs.start_time, bs.end_time, c.class_id, c.slot_id
      FROM class c
      INNER JOIN booking_slot bs ON c.slot_id = bs.slot_id
      ORDER BY bs.date, bs.start_time
    `;
    const classesResult = await pool.query(classesQuery);
    const classesData = classesResult.rows;

    res.json(classesData);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get a list of existing rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const roomsQuery = `SELECT * FROM room`;
    const roomsResult = await pool.query(roomsQuery);
    res.json(roomsResult.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to create a new class
app.post('/api/classes', async (req, res) => {
  const { class_name, date, start_time, end_time, room_id } = req.body;
  try {
    await pool.query('BEGIN');

    const bookingSlotQuery = `
      INSERT INTO booking_slot (date, start_time, end_time, room_id)
      VALUES ($1, $2, $3, $4) RETURNING slot_id`;

    const bookingSlotResult = await pool.query(bookingSlotQuery, [date, start_time, end_time, room_id]);
    const slotId = bookingSlotResult.rows[0].slot_id;

      const classQuery = `
        INSERT INTO class (class_name, room_id, slot_id)
        VALUES ($1, $2, $3)`;
      await pool.query(classQuery, [class_name, room_id, slotId]);
  
      await pool.query('COMMIT');
      res.status(201).json({ message: 'Class added successfully!' });
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error(err.message);
      res.status(500).json({ error: err.message });
    }
});

// Backend endpoint to remove a class from the database
app.delete('/api/classes/:classId/:slotId', async (req, res) => {
  const { classId, slotId } = req.params;
  try {
    await pool.query('BEGIN');

    await pool.query('DELETE FROM class_registration WHERE class_id = $1', [classId]);

    await pool.query('DELETE FROM class WHERE class_id = $1', [classId]);

    await pool.query('DELETE FROM booking_slot WHERE slot_id = $1', [slotId]);

    await pool.query('COMMIT');
    res.status(200).json({ message: 'Class removed successfully!' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/classes/:classId/:slotId', async (req, res) => {
  const { classId, slotId } = req.params;
  const { date, start_time, end_time } = req.body;
  try {
    const updateQuery = `
      UPDATE booking_slot
      SET date = $1, start_time = $2, end_time = $3
      WHERE slot_id = $4
    `;
    const updateResult = await pool.query(updateQuery, [date, start_time, end_time, slotId]);

    if (updateResult.rowCount === 0) {
      throw new Error('No booking slot found with the provided slot_id.');
    }

    res.status(200).json({ message: 'Class updated successfully!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get a list of existing equipment
app.get('/api/equipment', async (req, res) => {
  try {
    const equipmentQuery = `SELECT * FROM equipment`;
    const equipmentResult = await pool.query(equipmentQuery);
    res.json(equipmentResult.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to create new equipment
app.post('/api/equipment', async (req, res) => {
  const { name, status } = req.body;
  try {
    const newEquipmentQuery = `
      INSERT INTO equipment (name, status)
      VALUES ($1, $2)
      RETURNING *`;
    const newEquipmentResult = await pool.query(newEquipmentQuery, [name, status]);
    res.status(201).json(newEquipmentResult.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to delete equipment by id
app.delete('/api/equipment/:equipmentId', async (req, res) => {
  const { equipmentId } = req.params;
  try {
    const deleteEquipmentQuery = `DELETE FROM equipment WHERE equipment_id = $1`;
    const deleteResult = await pool.query(deleteEquipmentQuery, [equipmentId]);

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: 'No equipment found with the provided ID.' });
    }

    res.status(200).json({ message: 'Equipment removed successfully!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to update the status of equipment by id
app.patch('/api/equipment/status/:equipmentId', async (req, res) => {
  const { equipmentId } = req.params;
  const { status } = req.body;
  const validStatuses = ['Available', 'Repairing', 'Unavailable'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Status must be one of the following: Available, Repairing, Unavailable.' });
  }

  try {
    const updateStatusQuery = `
      UPDATE equipment
      SET status = $1
      WHERE equipment_id = $2
      RETURNING *`;
    const updateResult = await pool.query(updateStatusQuery, [status, equipmentId]);

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ message: 'No equipment found with the provided ID.' });
    }

    res.status(200).json({ message: 'Equipment status updated successfully!', equipment: updateResult.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get a list of all payments
app.get('/api/payments', async (req, res) => {
  try {
    const paymentsQuery = `
      SELECT p.transaction_id, p.member_id, p.sum, p.date, p.payment_method,
             u.first_name, u.last_name
      FROM payment AS p
      JOIN user_account AS u ON p.member_id = u.user_id
      ORDER BY p.date DESC`;
    const paymentsResult = await pool.query(paymentsQuery);
    res.json(paymentsResult.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to cancel a booking
app.delete('/api/bookings/cancel/:slotId', async (req, res) => {
  const { slotId } = req.params;
  try {
    await pool.query('BEGIN');
    
    const classQuery = 'SELECT class_id FROM class WHERE slot_id = $1';
    const classRes = await pool.query(classQuery, [slotId]);

    if (classRes.rowCount > 0) {
      const classId = classRes.rows[0].class_id;
      await pool.query('DELETE FROM class_registration WHERE class_id = $1', [classId]);

      await pool.query('DELETE FROM class WHERE class_id = $1', [classId]);
    } else {
      await pool.query('DELETE FROM training_session WHERE slot_id = $1', [slotId]);
    }

    await pool.query('DELETE FROM booking_slot WHERE slot_id = $1', [slotId]);
    
    await pool.query('COMMIT');
    res.status(200).json({ message: 'Booking cancelled successfully!' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});


// This route will redirect any requests that don't match an API endpoint or static file to the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});