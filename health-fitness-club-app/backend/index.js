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
      res.json({ role: userInfo.role });
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

    res.json({ role: newUser.rows[0].role });
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

// This route will redirect any requests that don't match an API endpoint or static file to the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});