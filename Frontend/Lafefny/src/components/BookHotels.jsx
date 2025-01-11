import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Calendar, Users, Search, AlertCircle, Bed, MapPin, ArrowLeft, Star } from 'lucide-react';
import { useCurrency, currencies } from '../context/CurrencyContext';
import Navigation from './Navigation';
import "../styles/bookHotels.css";

const BookHotel = () => {
  const navigate = useNavigate();
  const [cityCode, setCityCode] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [roomQuantity, setRoomQuantity] = useState(1);
  const [hotelOffers, setHotelOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const { currency } = useCurrency();

  const convertPrice = (price, reverse = false) => {
    if (!price) return 0;
    const numericPrice = typeof price === 'string' ? 
      parseFloat(price.replace(/[^0-9.-]+/g, "")) : 
      parseFloat(price);
      
    if (reverse) {
      return numericPrice / currencies[currency].rate;
    }
    const convertedPrice = numericPrice * currencies[currency].rate;
    return convertedPrice.toFixed(2);
  };

  const validateForm = () => {
    const errors = {};
    const today = new Date();
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (!cityCode) {
      setError("Please enter a city code");
      return false;
    }
    if (!checkInDate) {
      setError("Please select a check-in date");
      return false;
    }
    if (!checkOutDate) {
      setError("Please select a check-out date");
      return false;
    }
    if (checkIn < today) {
      setError("Check-in date cannot be in the past");
      return false;
    }
    if (checkOut <= checkIn) {
      setError("Check-out date must be after check-in date");
      return false;
    }
    if (adults < 1) {
      setError("There must be at least one adult");
      return false;
    }
    if (roomQuantity < 1 || roomQuantity > adults) {
      setError("Room quantity must be between 1 and the number of adults");
      return false;
    }

    setError(null);
    return true;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/amadeusHotel`, {
        cityCode: cityCode.toUpperCase(),
        checkInDate,
        checkOutDate,
        adults: parseInt(adults),
        roomQuantity: parseInt(roomQuantity),
        currency: currency
      });

      if (response.data?.data) {
        const validOffers = response.data.data.filter(offer => 
          offer?.hotel?.hotelId && offer?.offers?.[0]
        );
        setHotelOffers(validOffers);
      } else {
        setError('No hotel offers found for the selected criteria');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch hotel offers');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (hotel) => {
    try {
      setBookingLoading(true);
      setError(null);
      setBookingMessage('');

      const userId = localStorage.getItem('userID');
      if (!userId) {
        setError('Please log in to book a hotel');
        return;
      }

      const bookingDetails = {
        userId,
        hotelDetails: {
          hotelName: hotel?.hotel?.name || 'Unknown Hotel',
          roomType: hotel?.offers?.[0]?.room?.type || 'Standard Room',
          checkInDate: hotel?.offers?.[0]?.checkInDate || new Date(),
          checkOutDate: hotel?.offers?.[0]?.checkOutDate || new Date(),
          numberOfGuests: hotel?.offers?.[0]?.guests?.adults || 1,
          bookingStatus: 'Confirmed',
          price: hotel?.offers?.[0]?.price?.total || 0
        }
      };

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/tourist/addHotelBooking`, bookingDetails);

      if (response.data && response.data.message) {
        setBookingSuccess(true);
        setBookingMessage(`Successfully booked ${hotel?.hotel?.name} for ${hotel?.offers?.[0]?.guests?.adults} guests!`);
        
        // Wait for 2 seconds before redirecting
        setTimeout(() => {
          navigate('/touristHome');
        }, 2000);
      }

    } catch (error) {
      console.error('Error booking hotel:', error);
      setError(error.response?.data?.error || 'Failed to book hotel. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Back button and title */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-white/80 rounded-full transition-colors"
              >
                <ArrowLeft size={24} />
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Book Hotels</h1>
            </div>
          </div>

          {/* Success Message */}
          {bookingSuccess && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4 animate-in fade-in zoom-in duration-300">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Booking Successful!</h3>
                    <p className="text-gray-600">{bookingMessage}</p>
                    <p className="text-sm text-gray-500">Redirecting to home page...</p>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Search Form */}
          <Card className="mb-8 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Building2 className="text-primary h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Find Your Perfect Stay</h2>
                </div>
              </div>

              <form onSubmit={handleSearch} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* City Code */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City Code</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        type="text"
                        value={cityCode}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase().slice(0, 3);
                          setCityCode(value);
                        }}
                        className="pl-10"
                        placeholder="e.g., NYC"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  {/* Check-in Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Check-in Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Check-out Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Check-out Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Adults */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Adults</label>
                    <div className="relative flex items-center">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                      <Input
                        type="number"
                        min="1"
                        value={adults}
                        onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value)))}
                        className="pl-10 pr-4 text-right"
                      />
                    </div>
                  </div>

                  {/* Rooms */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rooms</label>
                    <div className="relative flex items-center">
                      <Bed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                      <Input
                        type="number"
                        min="1"
                        max={adults}
                        value={roomQuantity}
                        onChange={(e) => setRoomQuantity(Math.min(adults, Math.max(1, parseInt(e.target.value))))}
                        className="pl-10 pr-4 text-right"
                      />
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="space-y-2 flex items-end">
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 h-10"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Searching...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          <span>Search Hotels</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Hotel Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {hotelOffers.map((hotel, index) => (
              <HotelCard
                key={`${hotel.hotel.hotelId}-${index}`}
                hotel={hotel}
                onBook={() => handleBooking(hotel)}
                isBooking={bookingLoading}
                convertPrice={convertPrice}
                currency={currency}
                cityCode={cityCode}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const HotelCard = ({ hotel, onBook, isBooking, convertPrice, currency, cityCode }) => {
  // Early return if hotel data is not properly structured
  if (!hotel?.hotel || !hotel?.offers?.[0]) {
    return null;
  }

  const hotelData = hotel.hotel;
  const offer = hotel.offers[0];

  // Street name components for random generation
  const streetTypes = {
    'PAR': ['Rue', 'Avenue', 'Boulevard', 'Place', 'Quai', 'Passage'],
    'LON': ['Street', 'Road', 'Lane', 'Square', 'Avenue', 'Place', 'Terrace'],
    'NYC': ['Street', 'Avenue', 'Boulevard', 'Place', 'Road', 'Drive'],
    'DXB': ['Street', 'Road', 'Boulevard', 'District', 'Avenue'],
    'TYO': ['Street', 'Avenue', 'Boulevard', 'Road'],
    'ROM': ['Via', 'Piazza', 'Corso', 'Viale', 'Lungotevere'],
    'SYD': ['Street', 'Road', 'Avenue', 'Lane', 'Place', 'Drive'],
    'HKG': ['Road', 'Street', 'Avenue', 'Boulevard', 'Square']
  };

  const streetNames = {
    'PAR': ['Saint-Honoré', 'Rivoli', 'Montaigne', 'Royale', 'Bonaparte', 'Vendôme', 'Madeleine', 'Opera', 'Tuileries', 'Louvre', 'Marais', 'Bastille'],
    'LON': ['Oxford', 'Regent', 'Bond', 'Baker', 'Piccadilly', 'Kensington', 'Chelsea', 'Mayfair', 'Belgravia', 'Westminster', 'Knightsbridge'],
    'NYC': ['Broadway', 'Madison', 'Lexington', 'Park', 'Fifth', 'Seventh', 'Columbus', 'Amsterdam', 'Washington', 'Greenwich'],
    'DXB': ['Al Wasl', 'Sheikh Zayed', 'Jumeirah Beach', 'Al Maktoum', 'Dubai Marina', 'Palm Jumeirah', 'Business Bay', 'Downtown'],
    'TYO': ['Ginza', 'Shinjuku', 'Shibuya', 'Roppongi', 'Asakusa', 'Ueno', 'Akihabara', 'Harajuku', 'Omotesando'],
    'ROM': ['Veneto', 'Nazionale', 'del Corso', 'Condotti', 'Cola di Rienzo', 'Tritone', 'Sistina', 'Barberini'],
    'SYD': ['George', 'Pitt', 'Elizabeth', 'Macquarie', 'Oxford', 'Crown', 'William', 'Liverpool', 'Sussex'],
    'HKG': ['Nathan', 'Canton', 'Queen\'s', 'Des Voeux', 'Hennessy', 'Victoria', 'Hollywood', 'Aberdeen']
  };

  const areaNames = {
    'PAR': ['Champs-Élysées', 'Le Marais', 'Saint-Germain', 'Montmartre', 'Opéra', 'Louvre', 'Trocadéro', 'Bastille'],
    'LON': ['Mayfair', 'Kensington', 'Chelsea', 'Soho', 'Westminster', 'Covent Garden', 'Notting Hill', 'Knightsbridge'],
    'NYC': ['Manhattan', 'Upper East Side', 'Upper West Side', 'Tribeca', 'SoHo', 'Chelsea', 'Midtown', 'Financial District'],
    'DXB': ['Downtown Dubai', 'Palm Jumeirah', 'Dubai Marina', 'Business Bay', 'Jumeirah Beach', 'Al Barsha', 'DIFC', 'Deira'],
    'TYO': ['Shinjuku', 'Shibuya', 'Ginza', 'Roppongi', 'Asakusa', 'Akihabara', 'Marunouchi', 'Nihonbashi'],
    'ROM': ['Centro Storico', 'Trastevere', 'Monti', 'Prati', 'Testaccio', 'Esquilino', 'Borgo', 'Trieste'],
    'SYD': ['The Rocks', 'Darling Harbour', 'Circular Quay', 'Surry Hills', 'Paddington', 'Potts Point', 'Bondi Beach', 'Double Bay'],
    'HKG': ['Central', 'Tsim Sha Tsui', 'Wan Chai', 'Causeway Bay', 'Admiralty', 'Mong Kok', 'North Point', 'Kennedy Town']
  };

  // Generate random street number (different ranges for different cities)
  const generateStreetNumber = (cityCode) => {
    const ranges = {
      'PAR': [1, 200],
      'LON': [1, 300],
      'NYC': [1, 1000],
      'DXB': [1, 150],
      'TYO': [1, 100],
      'ROM': [1, 200],
      'SYD': [1, 500],
      'HKG': [1, 200]
    };
    const [min, max] = ranges[cityCode] || [1, 100];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Generate postal code based on city format
  const generatePostalCode = (cityCode) => {
    switch(cityCode) {
      case 'PAR':
        return `750${Math.floor(Math.random() * 20).toString().padStart(2, '0')}`; // Paris districts 75001-75020
      case 'LON':
        return `${['SW', 'W', 'E', 'N', 'NW'][Math.floor(Math.random() * 5)]}${Math.floor(Math.random() * 9) + 1} ${Math.floor(Math.random() * 9)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
      case 'NYC':
        return `${Math.floor(Math.random() * 90000) + 10000}`; // 5-digit US format
      case 'DXB':
        return `${Math.floor(Math.random() * 90000) + 10000}`; // Dubai postal code format
      case 'TYO':
        return `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`; // Japanese postal code format
      case 'ROM':
        return `00${Math.floor(Math.random() * 900) + 100}`; // Rome postal code format
      case 'SYD':
        return `${Math.floor(Math.random() * 9000) + 1000}`; // Australian postal code format
      case 'HKG':
        return ''; // Hong Kong typically doesn't use postal codes
      default:
        return `${Math.floor(Math.random() * 90000) + 10000}`;
    }
  };

  // Generate a random address for a specific city
  const generateRandomAddress = (cityCode) => {
    const number = generateStreetNumber(cityCode);
    const streetType = streetTypes[cityCode][Math.floor(Math.random() * streetTypes[cityCode].length)];
    const streetName = streetNames[cityCode][Math.floor(Math.random() * streetNames[cityCode].length)];
    const area = areaNames[cityCode][Math.floor(Math.random() * areaNames[cityCode].length)];
    const postalCode = generatePostalCode(cityCode);

    switch(cityCode) {
      case 'PAR':
        return `${number} ${streetType} ${streetName}, ${postalCode} Paris, France`;
      case 'LON':
        return `${number} ${streetName} ${streetType}, ${area}, London ${postalCode}, UK`;
      case 'NYC':
        return `${number} ${streetName} ${streetType}, ${area}, New York, NY ${postalCode}, USA`;
      case 'DXB':
        return `${number} ${streetName} ${streetType}, ${area}, Dubai ${postalCode}, UAE`;
      case 'TYO':
        return `${number}-${Math.floor(Math.random() * 20) + 1} ${streetName}, ${area}, Tokyo ${postalCode}, Japan`;
      case 'ROM':
        return `${streetType} ${streetName} ${number}, ${postalCode} Roma RM, Italy`;
      case 'SYD':
        return `${number} ${streetName} ${streetType}, ${area}, Sydney NSW ${postalCode}, Australia`;
      case 'HKG':
        return `${number} ${streetName} ${streetType}, ${area}, Hong Kong`;
      default:
        return `${number} ${streetName} ${streetType}, ${area}`;
    }
  };

  // Get random address for the current city
  const randomAddress = generateRandomAddress(cityCode || 'PAR');

  // Array of hotel images grouped by type
  const hotelImages = {
    luxury: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070",
      "https://images.unsplash.com/photo-1582719505726-ca121723b8ef?q=80&w=1925",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2049",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070",
      "https://images.unsplash.com/photo-1445019980597-33fa8acb246c?q=80&w=2074",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070",
      "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=2071",
      "https://images.unsplash.com/photo-1561501900-3701fa6a0864?q=80&w=2070",
      "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?q=80&w=2074",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=2070",
      "https://images.unsplash.com/photo-1578991624414-276ef23a534f?q=80&w=2070",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070"
    ],
    business: [
      "https://images.unsplash.com/photo-1606402179428-a57976d71fa4?q=80&w=2074",
      "https://images.unsplash.com/photo-1594563703937-fdc640497dcd?q=80&w=2069",
      "https://images.unsplash.com/photo-1631049552240-59c37f38802b?q=80&w=2070",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2074",
      "https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?q=80&w=2072",
      "https://images.unsplash.com/photo-1587985064135-0366536eab42?q=80&w=2070",
      "https://images.unsplash.com/photo-1592229505726-ca121723b8ef?q=80&w=2074",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=2074",
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069",
      "https://images.unsplash.com/photo-1497366811353-68707424de2d?q=80&w=2070"
    ],
    resort: [
      "https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?q=80&w=2070",
      "https://images.unsplash.com/photo-1571896349842-33fa8acb246c?q=80&w=2080",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070",
      "https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?q=80&w=2070",
      "https://images.unsplash.com/photo-1559599746-c0f1c8b23c11?q=80&w=2069",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071",
      "https://images.unsplash.com/photo-1551918120-9739cb430c6d?q=80&w=2069",
      "https://images.unsplash.com/photo-1601701119533-fde78d10ac66?q=80&w=2069",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070",
      "https://images.unsplash.com/photo-1561501878-aabd62634533?q=80&w=2070",
      "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?q=80&w=2074",
      "https://images.unsplash.com/photo-1594394516093-501ba68a0ba6?q=80&w=2070",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2049"
    ],
    boutique: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070",
      "https://images.unsplash.com/photo-1444201983204-c43cbd584d93?q=80&w=2070",
      "https://images.unsplash.com/photo-1534612899740-55c821a90129?q=80&w=2070",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070",
      "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=2071",
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=2074",
      "https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?q=80&w=2072",
      "https://images.unsplash.com/photo-1609949279531-cf48d64a58e7?q=80&w=2070",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2074",
      "https://images.unsplash.com/photo-1587985064135-0366536eab42?q=80&w=2070",
      "https://images.unsplash.com/photo-1592229505726-ca121723b8ef?q=80&w=2074",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070"
    ],
    city: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070",
      "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=2071",
      "https://images.unsplash.com/photo-1518733057094-95b53143d2a7?q=80&w=2074",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=2070",
      "https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=2070",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070",
      "https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?q=80&w=2072",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2070",
      "https://images.unsplash.com/photo-1444201983204-c43cbd584d93?q=80&w=2070",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2049"
    ]
  };

  // Get random image category
  const categories = Object.keys(hotelImages);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  
  // Get random image from category
  const randomImage = hotelImages[randomCategory][Math.floor(Math.random() * hotelImages[randomCategory].length)];
  
  // Generate a random rating between 3 and 5 with one decimal place
  const randomRating = (Math.random() * (5 - 3) + 3).toFixed(1);
  
  // Generate random number of reviews
  const randomReviews = Math.floor(Math.random() * (1000 - 100) + 100);

  // Generate random amenities
  const amenities = [
    "Free WiFi",
    "Pool",
    "Spa",
    "Fitness Center",
    "Restaurant",
    "Room Service",
    "Bar",
    "Parking",
    "Business Center",
    "Airport Shuttle"
  ];
  const randomAmenities = amenities
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  // Format address with fallback
  const formatAddress = () => {
    if (!hotelData.address?.lines && !hotelData.address?.cityName) {
      return randomAddress;
    }
    const addressLines = hotelData.address?.lines || [];
    const cityName = hotelData.address?.cityName || '';
    const parts = [...addressLines, cityName].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={randomImage}
          alt={hotelData.name || 'Hotel Image'}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{randomRating}</span>
            <span className="text-sm text-gray-600">({randomReviews})</span>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">{hotelData.name || 'Hotel Name Not Available'}</h3>
          <div className="flex items-start gap-2 text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
            <p className="text-sm">{formatAddress()}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {randomAmenities.map((amenity, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-primary/5 text-primary rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="text-sm text-gray-600">Starting from</p>
            <p className="text-2xl font-bold text-primary">
              {currencies[currency].symbol} {convertPrice(offer.price.total)}
              <span className="text-sm font-normal text-gray-600">/night</span>
            </p>
          </div>
          <Button
            onClick={() => onBook(hotel)}
            disabled={isBooking}
            className="min-w-[120px]"
          >
            {isBooking ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Booking...</span>
              </div>
            ) : (
              'Book Now'
            )}
          </Button>
        </div>

        {hotel.available === false && (
          <div className="mt-2 flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">Limited rooms available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default BookHotel;
