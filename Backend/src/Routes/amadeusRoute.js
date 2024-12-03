const express = require('express');
const NodeCache = require('node-cache');
const { searchFlights, fetchFlightPriceOffers, bookFlight, getLocationCode
    , fetchHotelIdsByCity,fetchHotelOffers, HOTEL_SEARCH_CONFIG} = require('../Services/amadeusService');
const axios = require('axios'); // Add this line

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
router.post("/hotelOffer", async (req, res) => {
  const {
    cityCode,
    checkInDate,
    checkOutDate,
    adults,
    roomQuantity,
    page = 1,
    limit = 10
  } = req.body;

  // Set headers for streaming
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Validate dates
  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regex)) return false;
    const date = new Date(dateString);
    const timestamp = date.getTime();
    if (typeof timestamp !== "number" || Number.isNaN(timestamp)) return false;
    return dateString === date.toISOString().split("T")[0];
  };

  if (!isValidDate(checkInDate) || !isValidDate(checkOutDate)) {
    return res
      .status(400)
      .json({ error: "Invalid date format. Use YYYY-MM-DD." });
  }

  try {
    console.log('Starting hotel search with params:', {
      cityCode,
      checkInDate,
      checkOutDate,
      adults,
      roomQuantity,
      page,
      limit
    });

    // Step 1: Get hotel IDs for the city
    const hotelIds = await fetchHotelIdsByCity(cityCode.toUpperCase());
    if (!hotelIds || hotelIds.length === 0) {
      return res
        .status(404)
        .json({ error: "No hotels found for the given city code" });
    }

    console.log(`Found ${hotelIds.length} hotels for city ${cityCode}`);

    // Step 2: Get hotel offers using the service function
    const hotelOffersGenerator = fetchHotelOffers(
      hotelIds,
      checkInDate,
      checkOutDate,
      parseInt(adults),
      parseInt(roomQuantity)
    );

    let allHotelOffers = [];
    let lastError = null;
    let searchStats = {
      processed: 0,
      validHotelsFound: 0,
      total: hotelIds.length
    };

    try {
      for await (const result of hotelOffersGenerator) {
        if (result.hotels && result.hotels.length > 0) {
          allHotelOffers.push(...result.hotels);
          
          if (result.progress) {
            searchStats = {
              ...searchStats,
              processed: result.progress.processed,
              validHotelsFound: result.progress.validHotelsFound
            };
          }

          // Calculate current page of results
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedHotels = allHotelOffers.slice(startIndex, endIndex);

          // Stream the current state
          res.write(JSON.stringify({
            data: paginatedHotels,
            pagination: {
              currentPage: page,
              totalPages: Math.ceil(allHotelOffers.length / limit),
              totalHotels: allHotelOffers.length,
              limit
            },
            progress: searchStats,
            warning: lastError ? "Some hotels could not be fetched" : undefined
          }) + '\n');
        }
      }
    } catch (error) {
      console.error('Error in hotel offers generator:', error);
      lastError = error;
      
      if (error.code === 'ClientError' && 
          error.response?.result?.errors?.[0]?.code === 38194) {
        return res.status(429).json({ 
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: 60
        });
      }
    }

    // Send final response
    res.end(JSON.stringify({
      data: allHotelOffers.slice((page - 1) * limit, page * limit),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(allHotelOffers.length / limit),
        totalHotels: allHotelOffers.length,
        limit
      },
      progress: {
        processed: searchStats.processed,
        total: hotelIds.length,
        validHotelsFound: searchStats.validHotelsFound
      },
      warning: lastError ? "Some hotels could not be fetched" : undefined
    }));

  } catch (error) {
    console.error(
      "Error fetching hotel offers:",
      error.response?.data || error.message
    );

    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error || 
                        error.response?.result?.errors?.[0]?.detail ||
                        error.message || 
                        "Failed to fetch hotel offers";

    res.status(statusCode).json({ error: errorMessage });
  }
});

router.get('/search-hotels', async (req, res) => {
  const { 
    cityCode, 
    checkInDate, 
    checkOutDate, 
    adults, 
    roomQuantity,
    page = 1,
    limit = 20 
  } = req.query;

  try {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Helper function to send SSE
    const sendEvent = (eventType, data) => {
      res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    if (!cityCode || !checkInDate || !checkOutDate || !adults) {
      sendEvent('error', {
        error: 'Missing required parameters',
        required: ['cityCode', 'checkInDate', 'checkOutDate', 'adults'],
        received: req.query
      });
      return res.end();
    }

    // Get hotel IDs
    const allHotelIds = await fetchHotelIdsByCity(cityCode.toUpperCase());
    
    if (!allHotelIds || allHotelIds.length === 0) {
      sendEvent('error', {
        error: 'No hotels found in the specified city',
        cityCode: cityCode.toUpperCase()
      });
      return res.end();
    }

    // Send initial pagination info
    sendEvent('pagination', {
      page: parseInt(page),
      limit: parseInt(limit),
      total: allHotelIds.length,
      totalPages: Math.ceil(allHotelIds.length / parseInt(limit))
    });

    // Calculate pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedHotelIds = allHotelIds.slice(startIndex, endIndex);

    // Process hotels and stream results
    const hotelOffersGenerator = fetchHotelOffers(
      paginatedHotelIds,
      checkInDate,
      checkOutDate,
      parseInt(adults),
      parseInt(roomQuantity)
    );

    for await (const result of hotelOffersGenerator) {
      sendEvent('hotels', result);
    }

    // Send completion event
    sendEvent('complete', { message: 'Search completed' });
    res.end();

  } catch (error) {
    console.error('Hotel search error:', error);
    sendEvent('error', {
      error: 'Error searching hotels',
      details: error.message
    });
    res.end();
  }
});

router.put("/hotelOffer/bookHotels", async (req, res) => {
  try {
    console.log("Raw request body:", req.body);
    console.log("Content-Type:", req.headers["content-type"]);

    const { username, newBookedHotelId } = req.body;
    console.log("Parsed request:", { username, newBookedHotelId });

    if (!username || !newBookedHotelId) {
      console.log("Missing fields:", { username, newBookedHotelId });
      return res.status(400).json({
        message: "Missing required fields",
        received: { username, newBookedHotelId },
      });
    }

    // Get current tourist data
    const tourist = await Tourist.findOne({ username });
    console.log("Found tourist:", tourist);

    if (!tourist) {
      return res.status(404).json({
        message: "Tourist not found",
        username: username,
      });
    }

    // Ensure BookedHotels is initialized as an array
    const currentHotels = tourist.BookedHotels || [];
    const updatedHotels = [...currentHotels, newBookedHotelId];

    console.log("Current hotels:", currentHotels);
    console.log("Updated hotels:", updatedHotels);

    const updatedTourist = await Tourist.findOneAndUpdate(
      { username },
      { $set: { BookedHotels: updatedHotels } },
      { new: true }
    );

    console.log("Updated tourist:", updatedTourist);

    res.status(200).json({
      message: "Hotel booked successfully",
      bookedHotels: updatedTourist.BookedHotels,
    });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;