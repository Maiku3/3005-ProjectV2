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
  const { email, password, firstName, lastName, phone, address, birthday, role, joinDate, membershipEndDate } = req.body;
  
  try {
    await pool.query('BEGIN');

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

// Endpoint to get list of members
app.get('/api/members', async (req, res) => {
  try {
    const members = await pool.query(
      `SELECT * FROM user_account WHERE role = 'member'`
    );
    res.json(members.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to create a training session with a booking slot 
app.post('/api/create-training-session', async (req, res) => {
  const { trainerId, memberId, date, startTime, endTime } = req.body;
  try {
    await pool.query('BEGIN');
    
    const bookingSlot = await pool.query(
      `INSERT INTO booking_slot (date, start_time, end_time)
       VALUES ($1, $2, $3) 
       RETURNING slot_id`,
       [date, startTime, endTime]
    );

    const slotId = bookingSlot.rows[0].slot_id;

    await pool.query(
      `INSERT INTO training_session (trainer_id, member_id, slot_id)
       VALUES ($1, $2, $3)`,
      [trainerId, memberId, slotId]
    );

    await pool.query('COMMIT');
    res.json({ message: 'New Training Session Created' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: err.message });
  } finally  {
    await pool.end();
  }
});

// Endpoint to get a list of training sessions of a certain trainer
app.get('/api/training-sessions/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const trainingSessions = await pool.query(
      `SELECT * 
      FROM training_session 
      WHERE trainer_id = $1`,
      [userId]
    );
    res.json(trainingSessions.rows);
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

// This route will redirect any requests that don't match an API endpoint or static file to the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});