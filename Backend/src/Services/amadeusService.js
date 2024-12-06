const Amadeus = require('amadeus');
const NodeCache = require('node-cache');
const Tourist = require('../Models/touristModel');
const express = require('express');
const axios = require('axios');

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: 'vDUF1bbbWPDJMBYfRbBruoQY1iGM3zWI',
  clientSecret: 'b8q0GIvRtLvjpAiw'
});

// Initialize cache with 1-hour TTL
const cache = new NodeCache({ stdTTL: 3600 });

const getAmadeusToken = async () => {
  try {
    const cachedToken = cache.get('amadeus_token');
    if (cachedToken) {
      return cachedToken;
    }

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.statusText}`);
    }

    const tokenData = await authResponse.json();
    const token = tokenData.access_token;
    
    // Cache token for 29 minutes
    cache.set('amadeus_token', token, 1740);
    
    return token;
  } catch (error) {
    console.error('Error getting Amadeus token:', error);
    throw new Error('Failed to authenticate with Amadeus API');
  }
};

// Helper function to handle API errors
const handleAmadeusError = (error) => {
  console.error('Amadeus API error:', {
    status: error.response?.status,
    code: error.response?.data?.errors?.[0]?.code,
    detail: error.response?.data?.errors?.[0]?.detail
  });
  throw error;
};

// Get location code (IATA code)
const getLocationCode = async (locationName, subType = 'CITY') => {
  const cacheKey = `location_${locationName}_${subType}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }

  try {
    const response = await amadeus.referenceData.locations.get({
      keyword: locationName,
      subType: subType
    });

    if (response.data.length === 0) {
      throw new Error('Location not found');
    }

    const locationCode = response.data[0].iataCode;
    cache.set(cacheKey, locationCode);
    return locationCode;
  } catch (error) {
    handleAmadeusError(error);
  }
};

// Search flights
const searchFlights = async (origin, destination, departureDate, returnDate, adults = '1', children = '0', infants = '0', travelClass = 'ECONOMY', nonStop = false, currencyCode = 'USD', max = '10') => {
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      travelClass,
      nonStop,
      currencyCode,
      max
    });
    return response.data;
  } catch (error) {
    handleAmadeusError(error);
  }
};

// Fetch flight price offers
const fetchFlightPriceOffers = async (flightOfferId) => {
  try {
    const response = await amadeus.shopping.flightOffers.pricing.post(
      JSON.stringify({
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [flightOfferId]
        }
      })
    );
    return response.data;
  } catch (error) {
    handleAmadeusError(error);
  }
};

// Book flight
const bookFlight = async (flightOffer, traveler) => {
  try {
    const response = await amadeus.booking.flightOrders.post(
      JSON.stringify({
        data: {
          type: 'flight-order',
          flightOffers: [flightOffer],
          travelers: [traveler]
        }
      })
    );

    const flightDetails = {
      airline: flightOffer.itineraries[0].segments[0].carrierCode,
      flightNumber: flightOffer.itineraries[0].segments[0].number,
      departureDate: flightOffer.itineraries[0].segments[0].departure.at,
      arrivalDate: flightOffer.itineraries[0].segments[0].arrival.at,
      departureAirport: flightOffer.itineraries[0].segments[0].departure.iataCode,
      arrivalAirport: flightOffer.itineraries[0].segments[0].arrival.iataCode,
      seatNumber: 'N/A',
      bookingStatus: 'Confirmed',
      price: flightOffer.price.total
    };

    if (traveler.touristId) {
      await Tourist.findByIdAndUpdate(traveler.touristId, {
        $push: { flightBookings: flightDetails }
      });
    }

    return response.data;
  } catch (error) {
    handleAmadeusError(error);
  }
};

// Fetch hotel IDs by city
const fetchHotelIdsByCity = async (cityCode) => {
  const cacheKey = `hotel_ids_${cityCode}`;
  const cachedHotelIds = cache.get(cacheKey);

  if (cachedHotelIds) {
    console.log(`Retrieved ${cachedHotelIds.length} hotel IDs from cache for ${cityCode}`);
    return cachedHotelIds;
  }

  try {
    console.log(`Fetching hotel IDs for city: ${cityCode}`);
    const response = await amadeus.referenceData.locations.hotels.byCity.get({
      cityCode: cityCode
    });

    if (!response.data || response.data.length === 0) {
      console.log(`No hotels found for city: ${cityCode}`);
      return [];
    }

    const hotelIds = response.data.map(hotel => hotel.hotelId);
    console.log(`Found ${hotelIds.length} hotels for ${cityCode}`);
    
    cache.set(cacheKey, hotelIds);
    return hotelIds;
  } catch (error) {
    console.error(`Error fetching hotel IDs for ${cityCode}:`, error);
    handleAmadeusError(error);
  }
};
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regex)) return false;
  const date = new Date(dateString);
  const timestamp = date.getTime();
  if (typeof timestamp !== "number" || Number.isNaN(timestamp)) return false;
  return dateString === date.toISOString().split("T")[0];
};
// Fetch hotel offers with batch processing
const fetchHotelOffers = async (cityCode, checkInDate, checkOutDate, adults, roomQuantity, page = 1) => {
  try {
    // Input validation
    if (!cityCode || !checkInDate || !checkOutDate || !adults || !roomQuantity) {
      throw new Error('Missing required parameters');
    }

    // Format parameters
    const params = {
      cityCode: cityCode.toUpperCase().trim(),
      checkInDate: new Date(checkInDate).toISOString().split('T')[0],
      checkOutDate: new Date(checkOutDate).toISOString().split('T')[0],
      adults: parseInt(adults),
      roomQuantity: parseInt(roomQuantity),
      page: {
        offset: (parseInt(page) - 1) * 10,
        limit: 10
      },
      includeClosed: false,
      bestRateOnly: true,
      currency: 'USD',
      ratings: ['3', '4', '5']
    };

    // Date validation
    const today = new Date();
    const checkIn = new Date(params.checkInDate);
    const checkOut = new Date(params.checkOutDate);

    if (checkIn < today) {
      throw new Error('Check-in date cannot be in the past');
    }
    if (checkOut <= checkIn) {
      throw new Error('Check-out date must be after check-in date');
    }

    // Cache check
    const cacheKey = `hotels_${JSON.stringify(params)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    // Ensure valid token
    await getAmadeusToken();

    // Retry logic
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await amadeus.shopping.hotelOffers.get(params);

        if (!response.data) {
          throw new Error('Invalid API response');
        }

        const result = {
          status: 'success',
          data: response.data,
          meta: {
            count: response.data.length,
            page: page,
            limit: params.page.limit,
            hasMore: response.data.length === params.page.limit
          },
          timestamp: new Date().toISOString(),
          params
        };

        cache.set(cacheKey, result, 3600);
        return result;

      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, {
          status: error.response?.status,
          error: error.message,
          params
        });

        if (attempt < maxRetries) {
          await new Promise(resolve => 
            setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 8000))
          );
        }
      }
    }

    throw new Error(`Failed to fetch hotel offers after ${maxRetries} attempts. ${lastError?.message}`);
  } catch (error) {
    console.error('Error in fetchHotelOffers:', error);
    throw error;
  }
};

module.exports = {
  amadeus,
  getLocationCode,
  searchFlights,
  fetchFlightPriceOffers,
  bookFlight,
  getAmadeusToken,
  fetchHotelIdsByCity,
  fetchHotelOffers
};