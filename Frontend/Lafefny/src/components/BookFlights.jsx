/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Calendar, Users, ArrowRight, ArrowLeftRight, Search, MapPin, Globe2, ArrowLeft, AlertCircle, Crown, Baby } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import Navigation from './Navigation';
import '../styles/bookFlights.css';
import FlightBookingPopup from './FlightBookingPopup';
import FlightCard from './FlightCard';

const BookFlights = () => {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState('round-trip');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState('ECONOMY');
  const [nonStop, setNonStop] = useState(false);
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [max, setMax] = useState(10);
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currency } = useCurrency();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('userID');
        if (!userId) {
          navigate('/login');
          return;
        }
  
        // Get tourist data (includes both user and tourist info)
        const touristResponse = await axios.get(`http://localhost:8000/tourist/getTouristInfo/${userId}`);
        
        if (!touristResponse.data) {
          throw new Error('Tourist data not found');
        }
  
        setCurrentUserData({
          ...touristResponse.data[0], // User data
          touristData: [{
            userID: userId // Ensure userID is correctly passed
          }]
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');
      }
    };
  
    fetchUserData();
  }, [navigate]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setFlights([]);

    try {
      if (!origin || !destination || !departureDate) {
        throw new Error('Please fill in all required fields');
      }

      if (tripType === 'round-trip' && !returnDate) {
        throw new Error('Please select a return date for round trip');
      }

      const params = {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departureDate,
        returnDate: tripType === 'round-trip' ? returnDate : undefined,
        adults,
        children,
        infants,
        travelClass,
        nonStop,
        currencyCode: currency,
        max: 10
      };

      const response = await axios.get('http://localhost:8000/amadeus/search-flights', { params });
      if (!response.data || response.data.length === 0) {
        setError('No flights found for the selected criteria. Please try different dates or destinations.');
        return;
      }
      setFlights(response.data);
    } catch (error) {
      console.error('Error searching flights:', error);
      setError(error.response?.data?.error || error.message || 'Error searching flights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (!selectedFlight) {
      alert('Please select a flight to book');
      return;
    }
    setShowPopup(true);
  };

  const handleBookingSuccess = async (bookingData) => {
    try {
      // Remove this since we're handling it in amadeusService now
      // await axios.post('http://localhost:8000/tourist/addFlightBooking', {
      //   userId: 'YOUR_TOURIST_ID',
      //   flightDetails: bookingData,
      // });
      
      navigate('/touristHome');
    } catch (error) {
      console.error('Error storing flight details:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-7xl mx-auto">
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
              <h1 className="text-3xl font-bold text-gray-900">Book Flights</h1>
            </div>
          </div>

          <Card className="mb-8 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Plane className="text-primary h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Flight Search</h2>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setTripType(tripType === 'round-trip' ? 'one-way' : 'round-trip')}
                  className="flex items-center gap-2 hover:bg-primary/10 transition-colors"
                >
                  {tripType === 'round-trip' ? (
                    <>
                      <ArrowLeftRight size={18} />
                      <span>Round Trip</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight size={18} />
                      <span>One Way</span>
                    </>
                  )}
                </Button>
              </div>

              <form onSubmit={handleSearch} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">From</label>
                    <div className="relative input-with-icon group">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors">
                        <MapPin className="text-gray-500 h-4 w-4" />
                      </div>
                      <Input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                        className="pl-12 h-12 transition-all border-gray-200 hover:border-gray-300 focus:border-primary"
                        placeholder="Origin (e.g., JFK)"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">To</label>
                    <div className="relative input-with-icon group">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors">
                        <MapPin className="text-gray-500 h-4 w-4" />
                      </div>
                      <Input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value.toUpperCase())}
                        className="pl-12 h-12 transition-all border-gray-200 hover:border-gray-300 focus:border-primary"
                        placeholder="Destination (e.g., LAX)"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Departure</label>
                    <div className="relative input-with-icon group">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors">
                        <Calendar className="text-gray-500 h-4 w-4" />
                      </div>
                      <Input
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="pl-12 h-12 transition-all border-gray-200 hover:border-gray-300 focus:border-primary date-input cursor-pointer"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {tripType === 'round-trip' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Return</label>
                      <div className="relative input-with-icon group">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors">
                          <Calendar className="text-gray-500 h-4 w-4" />
                        </div>
                        <Input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="pl-12 h-12 transition-all border-gray-200 hover:border-gray-300 focus:border-primary date-input cursor-pointer"
                          min={departureDate || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Travel Class</label>
                    <Select value={travelClass} onValueChange={setTravelClass}>
                      <SelectTrigger className="relative h-[2.75rem]">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          <Plane className="h-4 w-4 rotate-90" />
                        </div>
                        <div className="pl-8">
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ECONOMY">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Economy
                          </div>
                        </SelectItem>
                        <SelectItem value="PREMIUM_ECONOMY">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Premium Economy
                          </div>
                        </SelectItem>
                        <SelectItem value="BUSINESS">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Business
                          </div>
                        </SelectItem>
                        <SelectItem value="FIRST">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-primary" />
                            First
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium">Passengers</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Adults</span>
                          <span className="text-xs text-gray-500">(12+ years)</span>
                        </div>
                        <div className="relative input-with-icon">
                          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                          <Input
                            type="number"
                            value={adults}
                            onChange={(e) => setAdults(parseInt(e.target.value))}
                            min="1"
                            max="9"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Children</span>
                          <span className="text-xs text-gray-500">(2-11 years)</span>
                        </div>
                        <div className="relative input-with-icon">
                          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none h-4 w-4" />
                          <Input
                            type="number"
                            value={children}
                            onChange={(e) => setChildren(parseInt(e.target.value))}
                            min="0"
                            max="9"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Infants</span>
                          <span className="text-xs text-gray-500">(&lt;2 years)</span>
                        </div>
                        <div className="relative input-with-icon">
                          <Baby className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none h-4 w-4" />
                          <Input
                            type="number"
                            value={infants}
                            onChange={(e) => setInfants(parseInt(e.target.value))}
                            min="0"
                            max="9"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={nonStop}
                      onChange={(e) => setNonStop(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">Direct flights only</span>
                  </label>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOrigin('');
                      setDestination('');
                      setDepartureDate('');
                      setReturnDate('');
                      setAdults(1);
                      setChildren(0);
                      setInfants(0);
                      setTravelClass('ECONOMY');
                      setNonStop(false);
                    }}
                    className="hover:bg-gray-50"
                  >
                    Clear
                  </Button>
                  <Button
                    type="submit"
                    className="w-32 bg-primary hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Searching</span>
                      </div>
                    ) : (
                      <>
                        <Search size={18} className="mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {flights.length > 0 && (
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Globe2 className="text-primary h-6 w-6" />
                  <h2 className="text-xl font-semibold text-gray-800">Available Flights</h2>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {flights.map((flight, index) => (
                    <FlightCard
                      key={index}
                      flight={flight}
                      isSelected={selectedFlight === flight}
                      onSelect={setSelectedFlight}
                      onBook={handleBooking}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {showPopup && selectedFlight && (
            <FlightBookingPopup
              flight={selectedFlight}
              onClose={() => setShowPopup(false)}
              onBookingSuccess={handleBookingSuccess}
              userData={currentUserData}
              currency={currency}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookFlights;