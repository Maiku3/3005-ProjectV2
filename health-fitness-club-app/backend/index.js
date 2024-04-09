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

// This route will redirect any requests that don't match an API endpoint or static file to the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});