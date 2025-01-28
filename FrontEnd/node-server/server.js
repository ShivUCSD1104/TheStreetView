const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000; // or any port you prefer

app.use(bodyParser.json());

// Endpoint to receive parameters from the frontend
app.post('/api/compute', async (req, res) => {
  try {
    const { parameters } = req.body;

    // Send parameters to the Python server
    const response = await axios.post('http://localhost:5000/compute', { parameters });

    // Send the processed data back to the frontend
    res.json(response.data);
  } catch (error) {
    console.error('Error communicating with Python server:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Node.js server running on http://localhost:${PORT}`);
});