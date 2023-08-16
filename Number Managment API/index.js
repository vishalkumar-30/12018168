const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

async function fetchDataWithToken(token) {
  try {
    const response = await axios.get('http://20.244.56.144/train/trains', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error while retrieving data:', error);
    return [];
  }
}

function calculateAdjustedDepartureTime(departureTime, delayMinutes) {
  const departureTimestamp = new Date(departureTime).getTime();
  const adjustedDepartureTimestamp = departureTimestamp + delayMinutes * 60 * 1000;
  return new Date(adjustedDepartureTimestamp);
}

app.get('/trains', async (req, res) => {
  try {
    const userToken = req.headers.authorization.split(' ')[1];
    const trainData = await fetchDataWithToken(userToken);

    const currentTime = new Date();
    const upcomingTrains = trainData.filter(train => {
      const departureTime = new Date(train.departureTime);
      const timeDifference = departureTime - currentTime;
      return timeDifference > 30 * 60 * 1000; // Trains departing in more than 30 minutes
    });

    const sortedTrains = upcomingTrains.sort((a, b) => {
      if (a.price !== b.price) {
        return a.price - b.price;
      } else if (a.availableTickets !== b.availableTickets) {
        return b.availableTickets - a.availableTickets;
      } else {
        const aAdjustedDeparture = calculateAdjustedDepartureTime(a.departureTime, a.delayMinutes);
        const bAdjustedDeparture = calculateAdjustedDepartureTime(b.departureTime, b.delayMinutes);
        return bAdjustedDeparture - aAdjustedDeparture;
      }
    });

    res.json(sortedTrains);
  } catch (error) {
    console.error('Error while processing data:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
