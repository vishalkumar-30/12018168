const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.get('/numbers', async (req, res) => {
  try {
    const urls = req.query.url || [];
    if (!Array.isArray(urls)) {
      return res.status(400).json({ error: 'Invalid query parameter format' });
    }

    const promises = urls.map(async url => {
      try {
        const response = await axios.get(url, { timeout: 500 }); // Set timeout to 500 milliseconds
        return response.data.numbers || [];
      } catch (error) {
        return [];
      }
    });

    const responses = await Promise.all(promises);

    const mergedNumbers = responses.reduce((acc, numbers) => {
      return acc.concat(numbers);
    }, []);

    const uniqueSortedNumbers = Array.from(new Set(mergedNumbers)).sort((a, b) => a - b);

    res.json({ numbers: uniqueSortedNumbers });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`number-management-service listening at http://localhost:${port}`);
});