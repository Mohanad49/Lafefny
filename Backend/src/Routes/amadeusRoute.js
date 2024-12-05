const express = require('express');
const NodeCache = require('node-cache');
const { searchFlights, fetchFlightPriceOffers, bookFlight, getLocationCode
    , fetchHotelIdsByCity,fetchHotelOffers, HOTEL_SEARCH_CONFIG} = require('../Services/amadeusService');
const axios = require('axios');

const router = express.Router();
const hotelCache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// Helper function to send SSE
const sendSSE = (res, data, eventType = 'message') => {
  res.write(`event: ${eventType}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

// Route to search for flights
router.get('/iata-code', async (req, res) => {
  const { locationName, subType } = req.query;
  try {
    const locationCode = await getLocationCode(locationName, subType);
    res.json({ locationCode });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching IATA code' });
  }
});

// Route to search for flights
router.get('/search-flights', async (req, res) => {
  const { origin, destination, departureDate, returnDate, adults, children, infants, travelClass, nonStop, currencyCode, max } = req.query;
  try {
    const flights = await searchFlights(origin, destination, departureDate, returnDate, adults, children, infants, travelClass, nonStop, currencyCode, max);
    res.json(flights);
  } catch (error) {
    res.status(500).json({ error: 'Error searching flights' });
  }
});

// Route to fetch flight price offers
router.get('/flight-price-offers', async (req, res) => {
  const { flightOfferId } = req.query;
  try {
    const priceOffers = await fetchFlightPriceOffers(flightOfferId);
    res.json(priceOffers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching flight price offers' });
  }
});

// Route to book a flight
router.post('/book-flight', async (req, res) => {
  const { flightOffer, traveler } = req.body;
  try {
    const booking = await bookFlight(flightOffer, traveler);
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Error booking flight' });
  }
});

// Hotel search endpoint
router.get('/hotelOffer', async (req, res) => {
  const { cityCode, checkInDate, checkOutDate, adults, roomQuantity } = req.query;

  // Validate required parameters
  if (!cityCode || !checkInDate || !checkOutDate || !adults || !roomQuantity) {
    return res.status(400).json({
      error: 'Missing required parameters. Please provide cityCode, checkInDate, checkOutDate, adults, and roomQuantity.'
    });
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // Create hotel offers generator
    const hotelOffersGenerator = await fetchHotelOffers(
      cityCode,
      checkInDate,
      checkOutDate,
      adults,
      roomQuantity
    );

    // Stream results
    for await (const result of hotelOffersGenerator) {
      if (result.hotels && result.hotels.length > 0) {
        // Send progress event
        res.write(`event: progress\ndata: ${JSON.stringify({ progress: result.progress })}\n\n`);
        
        // Send hotels data
        res.write(`data: ${JSON.stringify({ hotels: result.hotels })}\n\n`);
      }
    }

    // Send completion event
    res.write('event: complete\ndata: {"status": "complete"}\n\n');
    res.end();
  } catch (error) {
    console.error('Error in hotel search:', error);
    res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

router.put("/hotelOffer/bookHotels", async (req, res) => {
  try {
    console.log("Raw request body:", req.body);
    console.log("Content-Type:", req.headers["content-type"]);

    // Extract relevant data from request body
    const { hotelOfferId, guests } = req.body;

    // Validate required fields
    if (!hotelOfferId || !guests) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["hotelOfferId", "guests"]
      });
    }

    // Process the booking (implement your booking logic here)
    // This is a placeholder response
    res.json({
      success: true,
      message: "Hotel booked successfully",
      bookingId: "BOOK" + Date.now(),
      hotelOfferId,
      guests
    });

  } catch (error) {
    console.error("Error booking hotel:", error);
    res.status(500).json({
      error: "Failed to book hotel",
      details: error.message
    });
  }
});

module.exports = router;