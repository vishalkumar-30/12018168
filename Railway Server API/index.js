const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Function to fetch data from John Doe Railways API
// Function to fetch data from John Doe Railways API with an authentication token
async function fetchTrainData() {
  try {
    const response = await axios.get('http://20.244.56.144/train/trains', {
      headers: {
        Authorization: `Bearer }` // Assuming Bearer token authentication
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching train data:', error);
    return [];
  }
}


// Function to calculate adjusted departure time considering delays
function calculateAdjustedDepartureTime(departureTime, delayMinutes) {
  const departureTimestamp = new Date(departureTime).getTime();
  const adjustedDepartureTimestamp = departureTimestamp + delayMinutes * 60 * 1000;
  return new Date(adjustedDepartureTimestamp);
}

// API endpoint to get train schedules
app.get('/trains', async (req, res) => {
  try {
    // assuming i am taking token in body
    let token=req.data.token
    const trainData = await fetchTrainData(token);

    const currentTime = new Date();
    const filteredTrains = trainData.filter(train => {
      const departureTime = new Date(train.departureTime);
      const timeDifference = departureTime - currentTime;
      return timeDifference > 30 * 60 * 1000; // Trains departing in > 30 minutes
    });

    const sortedTrains = filteredTrains.sort((a, b) => {
      // Sort criteria: Price (ascending), Tickets (descending), Departure time (descending)
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
    console.error('Error processing train data:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
