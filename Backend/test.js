// backend/test-server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  res.json({ 
    message: 'Test login successful',
    email: req.body.email 
  });
});

app.listen(5000, () => {
  console.log('Test server running on http://localhost:5000');
});