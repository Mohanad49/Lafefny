const Amadeus = require('amadeus');
const NodeCache = require('node-cache');
const Tourist = require('../Models/touristModel');

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: 'vDUF1bbbWPDJMBYfRbBruoQY1iGM3zWI',
  clientSecret: 'b8q0GIvRtLvjpAiw'
});

// Initialize cache with 1-hour TTL
const cache = new NodeCache({ stdTTL: 3600 });

// Helper function to handle API errors
const handleAmadeusError = (error) => {
  console.error('Amadeus API Error:', error);
  const errorDetails = {
    message: error.description || error.message || 'Unknown error occurred',
    code: error.code || 'UNKNOWN_ERROR',
    stack: error.stack
  };
  throw errorDetails;
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

// Fetch hotel offers with batch processing
const fetchHotelOffers = async (hotelIds, checkInDate, checkOutDate, adults, roomQuantity = 1) => {
  const BATCH_SIZE = 10;
  const allHotelOffers = [];
  const batches = [];

  // Split hotel IDs into batches
  for (let i = 0; i < hotelIds.length; i += BATCH_SIZE) {
    batches.push(hotelIds.slice(i, i + BATCH_SIZE));
  }

  console.log(`Processing ${batches.length} batches of hotel offers`);

  try {
    // Process each batch
    for (const [index, batch] of batches.entries()) {
      console.log(`Processing batch ${index + 1}/${batches.length}`);

      const batchPromises = batch.map(hotelId => {
        const cacheKey = `hotel_offer_${hotelId}_${checkInDate}_${checkOutDate}_${adults}_${roomQuantity}`;
        const cachedOffer = cache.get(cacheKey);

        if (cachedOffer) {
          console.log(`Retrieved cached offer for hotel ${hotelId}`);
          return Promise.resolve(cachedOffer);
        }

        return amadeus.shopping.hotelOffersByHotel.get({
          hotelId: hotelId,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          adults: adults,
          roomQuantity: roomQuantity
        }).then(response => {
          if (response.data) {
            cache.set(cacheKey, response.data);
            return response.data;
          }
          return null;
        }).catch(error => {
          console.error(`Error fetching offers for hotel ${hotelId}:`, error);
          return null;
        });
      });

      const batchResults = await Promise.all(batchPromises);
      allHotelOffers.push(...batchResults.filter(offer => offer !== null));
    }

    console.log(`Successfully retrieved ${allHotelOffers.length} hotel offers`);
    return allHotelOffers;
  } catch (error) {
    console.error('Error in fetchHotelOffers:', error);
    handleAmadeusError(error);
  }
};

module.exports = {
  getLocationCode,
  searchFlights,
  fetchFlightPriceOffers,
  bookFlight,
  fetchHotelIdsByCity,
  fetchHotelOffers
};