const express = require('express');
const NodeCache = require('node-cache');
const { searchFlights, fetchFlightPriceOffers, bookFlight, getLocationCode
    , fetchHotelIdsByCity,fetchHotelOffers, HOTEL_SEARCH_CONFIG} = require('../Services/amadeusService');

const router = express.Router();

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
    if (!traveler.touristId) {
      return res.status(400).json({ error: 'Tourist ID is required' });
    }

    const booking = await bookFlight(flightOffer, traveler);
    res.json(booking);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ 
      error: 'Error booking flight',
      details: error.message 
    });
  }
});


//hotel booking
router.get('/search-hotels', async (req, res) => {
  const { cityCode, checkInDate, checkOutDate, adults, roomQuantity } = req.query;

  try {
    // Input validation
    if (!cityCode || !checkInDate || !checkOutDate || !adults) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['cityCode', 'checkInDate', 'checkOutDate', 'adults']
      });
    }

    const hotelIds = await fetchHotelIdsByCity(cityCode.toUpperCase());
    
    if (!hotelIds?.length) {
      return res.status(404).json({ error: 'No hotels found in specified city' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Process hotel offers
    const hotelOffersGenerator = fetchHotelOffers(
      hotelIds,
      checkInDate,
      checkOutDate,
      parseInt(adults),
      parseInt(roomQuantity || 1)
    );

    for await (const result of hotelOffersGenerator) {
      const sseMessage = {
        type: 'batch',
        data: {
          hotels: result.hotels,
          progress: result.progress
        }
      };

      res.write(`data: ${JSON.stringify(sseMessage)}\n\n`);
    }

    // Send completion message
    res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Hotel search error:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'Hotel search failed',
        details: error.message 
      });
    }
    
    // If headers already sent, send error through SSE
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: error.message
    })}\n\n`);
    res.end();
  }
});

router.get('/hotel-offers', async (req, res) => {
  const { hotelId } = req.query;
  try {
    const offers = await getHotelOffers(hotelId);
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving hotel offers' });
  }
});

router.get('/hotel-room-details', async (req, res) => {
  const { offerId } = req.query;
  try {
    const roomDetails = await getHotelRoomDetails(offerId);
    res.json(roomDetails);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving hotel room details' });
  }
});

router.post('/book-hotel', async (req, res) => {
  const { offerId, guestDetails, touristId } = req.body;
  try {
    const booking = await bookHotel(offerId, guestDetails, touristId);
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Error booking hotel' });
  }
});

module.exports = router;