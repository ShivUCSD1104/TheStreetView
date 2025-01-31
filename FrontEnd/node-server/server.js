const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
// Keep Node on 5000
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

app.post('/api/compute', async (req, res) => {
  try {
    const { parameters } = req.body;
    // Now call Flask on port 5001
    const response = await axios.post('http://127.0.0.1:5001/compute', { parameters });
    res.json(response.data);
  } catch (error) {
    console.error('Error communicating with Python server:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/iv-surface-data', async (req, res) => {
  try {
    const { ticker } = req.body;
    // Now call Flask on port 5001
    const response = await axios.post('http://127.0.0.1:5001/iv-surface-data', { ticker });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching IV surface data from Python server:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Node.js server running on http://localhost:${PORT}`);
});
