const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000; // or any port you prefer

app.use(cors());
app.use(bodyParser.json());

app.post('/api/compute', async (req, res) => {
  try {
    const { parameters } = req.body;

    const response = await axios.post('http://127.0.0.1:5001/compute', { parameters });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error communicating with Python server:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.listen(PORT, () => {
  console.log(`Node.js server running on http://localhost:${PORT}`);
});