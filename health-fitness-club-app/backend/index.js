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

// This route will redirect any requests that don't match an API endpoint or static file to the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
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