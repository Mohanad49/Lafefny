const express = require('express');
const NodeCache = require('node-cache');
const { searchFlights, fetchFlightPriceOffers, bookFlight, getLocationCode, fetchHotelIdsByCity, fetchHotelOffers, HOTEL_SEARCH_CONFIG } = require('../Services/amadeusService');
const axios = require('axios');
const Amadeus = require('amadeus');

const router = express.Router();
const hotelCache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour
const Tourist = require("../Models/touristModel");

// Initialize Amadeus client with hardcoded test credentials for now
// TODO: Move these to environment variables
const amadeus = new Amadeus({
  clientId: 'N3uPbC1PBqiAABwKGuhActAWH7GCyFRM',
  clientSecret: 'z1oiA6PDf8oWoYum'
});

// Helper function to send SSE
const sendSSE = (res, data, eventType = 'message') => {
  res.write(`event: ${eventType}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

const handleAmadeusError = (error) => {
  console.error('Amadeus API error:', {
    status: error.response?.status,
    code: error.response?.data?.errors?.[0]?.code,
    detail: error.response?.data?.errors?.[0]?.detail
  });
  throw error;
};

// Validate dates
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regex)) return false;
  const date = new Date(dateString);
  const timestamp = date.getTime();
  if (typeof timestamp !== "number" || Number.isNaN(timestamp)) return false;
  return dateString === date.toISOString().split("T")[0];
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
router.post("/hotelOffer", async (req, res) => {
  const {
    cityCode,
    checkInDate,
    checkOutDate,
    adults,
    roomQuantity,
    currency = "EUR",
    countryOfResidence,
    priceRange,
    paymentPolicy,
    boardType,
    includeClosed,
    bestRateOnly,
    lang,
  } = req.body;

  // Validate dates
  if (!isValidDate(checkInDate) || !isValidDate(checkOutDate)) {
    return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
  }

  try {
    // Get access token
    const tokenResponse = await axios.post(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: 'N3uPbC1PBqiAABwKGuhActAWH7GCyFRM',
        client_secret: 'z1oiA6PDf8oWoYum',
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const accessToken = tokenResponse.data.access_token;

    // Get list of hotels by city code
    const hotelsByCityResponse = await axios.get(
      "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city",
      {
        params: { cityCode },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const hotelsByCity = hotelsByCityResponse.data.data;
    if (hotelsByCity.length === 0) {
      return res.status(404).json({ error: "No hotels found for the given city code" });
    }

    // Use the geocode from the first hotel to get the list of hotels by geocode
    const { latitude, longitude } = hotelsByCity[0].geoCode;

    const hotelsByGeocodeResponse = await axios.get(
      "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode",
      {
        params: { latitude, longitude },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const hotelsByGeocode = hotelsByGeocodeResponse.data.data;
    if (hotelsByGeocode.length === 0) {
      return res.status(404).json({ error: "No hotels found for the given geocode" });
    }

    // Get list of available offers by hotel IDs in chunks
    const hotelIds = hotelsByGeocode.map((hotel) => hotel.hotelId);
    const chunkSize = 50;
    const hotelOffers = [];

    for (let i = 0; i < hotelIds.length; i += chunkSize) {
      const chunk = hotelIds.slice(i, i + chunkSize).join(",");
      const hotelOffersResponse = await axios.get(
        "https://test.api.amadeus.com/v3/shopping/hotel-offers",
        {
          params: {
            hotelIds: chunk,
            adults,
            checkInDate,
            checkOutDate,
            roomQuantity,
            currency,
            countryOfResidence,
            priceRange,
            paymentPolicy,
            boardType,
            includeClosed,
            bestRateOnly,
            lang,
          },
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      hotelOffers.push(...hotelOffersResponse.data.data);
    }

    res.json({ data: hotelOffers });
  } catch (error) {
    console.error("Error fetching hotel offers:", error.response?.data || error.message);

    if (error.response) {
      if (error.response.status === 404) {
        if (error.response.data.errors && error.response.data.errors[0].code === 38196) {
          return res.status(404).json({
            error: "Resource not found: The targeted resource doesn't exist",
          });
        }
        return res.status(404).json({ error: "Resource not found" });
      }
      if (error.response.status === 400) {
        if (error.response.data.errors && error.response.data.errors[0].code === 425) {
          return res.status(400).json({ error: "Invalid date: Amadeus Error - INVALID DATE" });
        }
      }
    }

    res.status(500).json({ error: error.response?.data || "Failed to fetch hotel offers" });
  }
});

// Book hotel endpoint
router.put("/bookHotels", async (req, res) => {
  try {
    const { username, newBookedHotelId } = req.body;

    if (!username || !newBookedHotelId) {
      return res.status(400).json({
        message: "Missing required fields",
        received: { username, newBookedHotelId },
      });
    }

    // Get current tourist data
    const tourist = await Tourist.findOne({ username });

    if (!tourist) {
      return res.status(404).json({
        message: "Tourist not found",
        username: username,
      });
    }

    // Ensure BookedHotels is initialized as an array and add new hotel
    const currentHotels = tourist.BookedHotels || [];
    const updatedHotels = [...currentHotels, newBookedHotelId];

    const updatedTourist = await Tourist.findOneAndUpdate(
      { username },
      { $set: { BookedHotels: updatedHotels } },
      { new: true }
    );

    res.status(200).json({
      message: "Hotel booked successfully",
      bookedHotels: updatedTourist.BookedHotels,
    });
  } catch (error) {
    console.error("Hotel booking error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;