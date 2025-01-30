const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post('/api/compute', async (req, res) => {
  try {
    console.log('Proxying request to Flask:', req.body);
    const response = await axios.post('http://127.0.0.1:5001/compute', req.body);
    console.log('Flask response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Node proxy error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Node.js server running on http://localhost:${PORT}`);
});