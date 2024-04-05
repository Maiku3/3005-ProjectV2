const express = require('express');
const path = require('path');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

// PostgreSQL sample query:
app.get('/api/members', async (req, res) => {
  try {
    const allMembers = await pool.query('SELECT * FROM member');
    res.json(allMembers.rows);
  } catch (err) {
    console.error(err.message);
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