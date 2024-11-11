const Amadeus = require('amadeus');
const NodeCache = require('node-cache');
const Tourist = require('../Models/touristModel');
const { search } = require('../Routes/productController');

const amadeus = new Amadeus({
  clientId: 'vDUF1bbbWPDJMBYfRbBruoQY1iGM3zWI',
  clientSecret: 'b8q0GIvRtLvjpAiw'
});

const iataCache = new NodeCache({ stdTTL: 86400 });

const getLocationCode = async (locationName, subType = 'CITY') => {
  try {
    const cacheKey = `${locationName}_${subType}`;
    const cachedCode = iataCache.get(cacheKey);

    if (cachedCode) {
      return cachedCode;
    }

    const response = await amadeus.referenceData.locations.get({
      keyword: locationName,
      subType: subType,
      page: {
        limit: 1 // Get only the most relevant result
      }
    });

    if (response.data.length === 0) {
      throw new Error('Location not found');
    }

    const iataCode = response.data[0].iataCode;
    iataCache.set(cacheKey, iataCode);
    return iataCode;
  } catch (error) {
    console.error('Error fetching IATA code:', error);
    throw error;
  }
};


const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateString}`);
  }
  return date.toISOString().split('T')[0];
};

const validateTravelerData = (traveler) => {
  const requiredFields = [
    'firstName', 'lastName', 'dateOfBirth', 'email', 'phone', 'gender',
    'countryCallingCode', 'passportNumber', 'issuanceCountry', 'nationality', 
    'expiryDate', 'birthPlace', 'issuanceLocation', 'issuanceDate'
  ];
  console.log('Validating traveler data:', JSON.stringify(traveler, null, 2));

  const missingFields = requiredFields.filter(field => !traveler[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
};

// Function to search for flights
const searchFlights = async (origin, destination, departureDate, returnDate, adults, children, infants, travelClass, nonStop, currencyCode, max) => {
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: departureDate,
      returnDate: returnDate,
      adults: adults || 1,
      children: children || 0,
      infants: infants || 0,
      travelClass: travelClass || 'ECONOMY',
      nonStop: nonStop || false,
      currencyCode: currencyCode || 'USD',
      max: max || 10
    });
    return response.data;
  } catch (error) {
    console.error('Error searching flights:', error);
    throw error;
  }
};

// Function to fetch flight price offers
const fetchFlightPriceOffers = async (flightOffer) => {
  try {
    // Parse the flight offer if it's a string
    const parsedOffer = typeof flightOffer === 'string' ? JSON.parse(flightOffer) : flightOffer;

    // Ensure the offer has all required fields
    if (!parsedOffer.id || !parsedOffer.itineraries || !parsedOffer.travelerPricings) {
      throw new Error('Invalid flight offer structure');
    }

    const response = await amadeus.shopping.flightOffers.pricing.post(
      JSON.stringify({
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [parsedOffer]
        }
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching flight price offers:', error);
    throw error;
  }
};

// Function to book a flight
const bookFlight = async (flightOffer, traveler) => {
  try {
    validateTravelerData(traveler);

    const formattedTraveler = {
      ...traveler,
      dateOfBirth: formatDate(traveler.dateOfBirth),
      expiryDate: formatDate(traveler.expiryDate),
      issuanceDate: formatDate(traveler.issuanceDate)
    };

    const singleTravelerOffer = {
      ...flightOffer,
      travelerPricings: [flightOffer.travelerPricings[0]] // Keep only first traveler pricing
    };

    const payload = {
      data: {
        type: 'flight-order',
        flightOffers: [singleTravelerOffer],
        travelers: [{
          id: '1',
          dateOfBirth: formattedTraveler.dateOfBirth,
          name: {
            firstName: formattedTraveler.firstName.trim().toUpperCase(),
            lastName: formattedTraveler.lastName.trim().toUpperCase()
          },
          gender: formattedTraveler.gender.toUpperCase(),
          contact: {
            emailAddress: formattedTraveler.email,
            phones: [{
              deviceType: 'MOBILE',
              countryCallingCode: formattedTraveler.countryCallingCode,
              number: formattedTraveler.phone
            }]
          },
          documents: [{
            documentType: 'PASSPORT',
            birthPlace: formattedTraveler.birthPlace,
            issuanceLocation: formattedTraveler.issuanceLocation,
            issuanceDate: formattedTraveler.issuanceDate,
            number: formattedTraveler.passportNumber,
            expiryDate: formattedTraveler.expiryDate,
            issuanceCountry: formattedTraveler.issuanceCountry.toUpperCase(),
            validityCountry: formattedTraveler.issuanceCountry.toUpperCase(),
            nationality: formattedTraveler.nationality.toUpperCase(),
            holder: true
          }]
        }]
      }
    };

    console.log('Sending payload to Amadeus:', JSON.stringify(payload, null, 2));

    const response = await amadeus.booking.flightOrders.post(
      JSON.stringify(payload)
    );

    console.log('Amadeus response:', JSON.stringify(response.data, null, 2));

    // Handle successful booking...
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

    const updatedTourist = await Tourist.findOneAndUpdate(
      { userID: traveler.touristId },
      { 
        $push: { 
          flightBookings: flightDetails 
        }
      },
      { new: true }
    );

    if (!updatedTourist) {
      console.error('Tourist not found:', traveler.touristId);
      throw new Error('Tourist not found');
    }

    console.log('Updated tourist:', updatedTourist);
    return response.data;
  } catch (error) {
    console.error('Flight booking error:', error);
    throw error;
  }
};



// hotel booking


const fetchHotelIdsByCity = async (cityCode, radius = 5, radiusUnit = 'KM') => {
  try {
    console.log('Fetching hotel IDs for city:', cityCode);

    // Use the Hotel List API to retrieve hotels in the specified city
    const response = await amadeus.referenceData.locations.hotels.byCity.get({
      cityCode,
      radius,
      radiusUnit
    });

    if (response.data?.length === 0) {
      throw new Error('No hotels found in the specified city.');
    }

    // Extract hotel IDs from the response
    const hotelIds = response.data.map(hotel => hotel.hotelId);
    console.log('Retrieved hotel IDs:', hotelIds);
    return hotelIds;
  } catch (error) {
    console.error('Error fetching hotel IDs:', {
      message: error.message,
      code: error.code,
      details: error.response?.data || error.stack
    });
    throw error;
  }
};


// Step 2: Retrieve hotel offers for the specified hotel IDs, dates, and guests
const HOTEL_SEARCH_CONFIG = {
  batchSize: 3, // Reduced from 5
  delayBetweenBatches: 100, // 10 requests per second
  maxRetries: 10
};

const fetchHotelOffers = async function* (hotelIds, checkInDate, checkOutDate, adults, roomQuantity = 1) {
  try {
    if (!hotelIds?.length) {
      throw new Error('Hotel IDs required');
    }

    const { batchSize, delayBetweenBatches } = HOTEL_SEARCH_CONFIG;
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    
    // Process hotels in sequential batches
    for (let i = 0; i < hotelIds.length; i += batchSize) {
      const batch = hotelIds.slice(i, i + batchSize);
      
      try {
        const response = await amadeus.shopping.hotelOffersSearch.get({
          hotelIds: batch.join(','),
          checkInDate,
          checkOutDate,
          adults: parseInt(adults),
          roomQuantity: parseInt(roomQuantity),
          currency: 'USD',
          bestRateOnly: true
        });

        const validHotels = response.data?.filter(hotel => 
          hotel?.hotel?.name && 
          hotel?.offers?.[0]?.price?.total
        ) || [];

        if (validHotels.length > 0) {
          yield {
            hotels: validHotels,
            progress: {
              processed: Math.min(i + batchSize, hotelIds.length),
              total: hotelIds.length,
              currentBatch: Math.floor(i / batchSize) + 1,
              totalBatches: Math.ceil(hotelIds.length / batchSize)
            }
          };
        }

        // Rate limiting delay
        await delay(delayBetweenBatches);

      } catch (error) {
        console.error(`Batch processing error for hotels ${batch.join(',')}:`, error);
        // Continue with next batch instead of failing completely
        continue;
      }
    }

  } catch (error) {
    console.error('Hotel offers fetch failed:', error);
    throw error;
  }
};

// const getHotelOffers = async (hotelId) => {
//   try {
//     const response = await amadeus.shopping.hotelOffersByHotel.get({
//       hotelId: hotelId
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error retrieving hotel offers:', error);
//     throw error;
//   }
// };

// const getHotelRoomDetails = async (offerId) => {
//   try {
//     const response = await amadeus.shopping.hotelOffer.get({
//       offerId: offerId
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error retrieving hotel room details:', error);
//     throw error;
//   }
// };

// const bookHotel = async (offerId, guestDetails, touristId) => {
//   try {
//     const response = await amadeus.booking.hotelBookings.post(
//       JSON.stringify({
//         data: {
//           offerId: offerId,
//           guests: [guestDetails],
//           payments: [{
//             method: 'creditCard',
//             card: {
//               vendorCode: 'VI',
//               cardNumber: '4111111111111111',
//               expiryDate: '2023-12'
//             }
//           }]
//         }
//       })
//     );

//     const bookingDetails = response.data;
//     const hotelBooking = {
//       hotelName: bookingDetails.hotel.name,
//       roomType: bookingDetails.room.type,
//       checkInDate: bookingDetails.checkInDate,
//       checkOutDate: bookingDetails.checkOutDate,
//       numberOfGuests: bookingDetails.guests.length,
//       bookingStatus: 'Confirmed',
//       price: bookingDetails.price.total
//     };

//     await Tourist.findByIdAndUpdate(touristId, {
//       $push: { hotelBookings: hotelBooking }
//     });

//     return bookingDetails;
//   } catch (error) {
//     console.error('Error booking hotel:', error);
//     throw error;
//   }
// };




module.exports = {
  getLocationCode,
  searchFlights,
  fetchFlightPriceOffers,
  bookFlight,
  fetchHotelIdsByCity,
  fetchHotelOffers,
  HOTEL_SEARCH_CONFIG,
  // getHotelOffers,
  // getHotelRoomDetails,
  // bookHotel
};