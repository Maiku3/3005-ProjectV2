const express = require('express');
const path = require('path');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

// PostgreSQL query to fetch member details including user account information
app.get('/api/memberDetails', async (req, res) => {
  try {
    const memberDetails = await pool.query(`
      SELECT 
        member.*, 
        user_account.email, 
        user_account.first_name, 
        user_account.last_name, 
        user_account.phone, 
        user_account.address, 
        user_account.birthday
      FROM 
        member
      INNER JOIN 
        user_account ON member.user_id = user_account.user_id;
    `);
    res.json(memberDetails.rows);
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