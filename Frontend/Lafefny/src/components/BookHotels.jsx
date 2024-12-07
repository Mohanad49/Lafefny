import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Calendar, Users, Search, AlertCircle, Bed, MapPin, ArrowLeft } from 'lucide-react';
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
      const response = await axios.post('http://localhost:8000/amadeusHotel', {
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

      const response = await axios.post('http://localhost:8000/tourist/addHotelBooking', bookingDetails);

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
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const HotelCard = ({ hotel, onBook, isBooking, convertPrice, currency }) => {
  const offer = hotel?.offers?.[0];
  const hotelInfo = hotel?.hotel;
  
  if (!offer || !hotelInfo) return null;

  const amenities = [
    hotelInfo?.amenities?.includes('SWIMMING_POOL') && { icon: '🏊‍♂️', label: 'Pool' },
    hotelInfo?.amenities?.includes('RESTAURANT') && { icon: '🍽️', label: 'Restaurant' },
    hotelInfo?.amenities?.includes('WIFI') && { icon: '📶', label: 'WiFi' },
    hotelInfo?.amenities?.includes('FITNESS_CENTER') && { icon: '💪', label: 'Gym' },
    hotelInfo?.amenities?.includes('SPA') && { icon: '💆‍♀️', label: 'Spa' },
    hotelInfo?.amenities?.includes('PARKING') && { icon: '🅿️', label: 'Parking' }
  ].filter(Boolean);

  // Convert API rating to stars (assuming rating is out of 5)
  const rating = Math.round(parseFloat(hotelInfo?.rating || 0));
  const stars = '⭐'.repeat(Math.min(5, Math.max(0, rating)));

  // Format location
  const location = [
    hotelInfo?.address?.lines?.[0],
    hotelInfo?.address?.cityName,
    hotelInfo?.address?.stateCode,
    hotelInfo?.address?.countryCode
  ].filter(Boolean).join(', ');

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm">
      <div className="relative h-48 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${hotelInfo?.media?.[0]?.uri || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'})`
          }}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 text-white rounded-full text-sm flex items-center gap-1">
          {stars || 'Unrated'}
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Hotel Name and Location */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">
              {hotelInfo?.name || 'Hotel Name Unavailable'}
            </h3>
            <div className="mt-2 flex items-start gap-1">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-500 line-clamp-2">{location || 'Location unavailable'}</p>
            </div>
            {rating > 0 && (
              <div className="mt-1 text-sm text-gray-500">
                Rating: {rating}/5
              </div>
            )}
          </div>

          {/* Room Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Room Type</span>
              <span className="font-medium">{offer?.room?.type || 'Standard Room'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Board Type</span>
              <span className="font-medium">{offer?.boardType || 'Room Only'}</span>
            </div>
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity, index) => (
                <div 
                  key={index}
                  className="px-2 py-1 bg-primary/5 text-primary rounded-full text-xs flex items-center gap-1"
                >
                  <span>{amenity.icon}</span>
                  <span>{amenity.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Cancellation Policy */}
          <div className="text-xs text-gray-500">
            {offer?.policies?.cancellation?.description || 'Cancellation policy details unavailable'}
          </div>

          {/* Price and Book Button */}
          <div className="flex items-end justify-between pt-4 border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Per night</p>
              <p className="text-2xl font-bold text-primary">
                {currencies[currency].symbol}{convertPrice(offer?.price?.total)}
              </p>
            </div>
            <Button
              onClick={() => onBook(hotel)}
              disabled={isBooking}
              className="bg-primary hover:bg-primary/90"
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
        </div>
      </CardContent>
    </Card>
  );
};
export default BookHotel;
