/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(null);

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
    if (origin.length !== 3 || destination.length !== 3) {
      setError('Origin and Destination must be 3-letter IATA codes.');
      return;
    }
    setError('');
    try {
      const params = {
        origin,
        destination,
        departureDate,
        returnDate: tripType === 'round-trip' ? returnDate : undefined,
        adults,
        children,
        infants,
        travelClass,
        nonStop,
        currencyCode,
        max,
      };

      const response = await axios.get('http://localhost:8000/amadeus/search-flights', { params });
      setFlights(response.data);
    } catch (error) {
      console.error('Error searching flights:', error);
      setError('Error searching flights');
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
    <div className="book-flights-container">
      <h1>Book Flights</h1>
      <form className="book-flights-form" onSubmit={handleSearch}>
        <div className="trip-type-selector">
          <button type="button" className={tripType === 'one-way' ? 'active' : ''} onClick={() => setTripType('one-way')}>One-way</button>
          <button type="button" className={tripType === 'round-trip' ? 'active' : ''} onClick={() => setTripType('round-trip')}>Round-trip</button>
        </div>
        <div className="form-group">
          <label>From</label>
          <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value.toUpperCase())} placeholder="Origin (IATA code)" required />
        </div>
        <div className="form-group">
          <label>To</label>
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value.toUpperCase())} placeholder="Destination (IATA code)" required />
        </div>
        <div className="form-group">
          <label>Depart</label>
          <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required />
        </div>
        {tripType === 'round-trip' && (
          <div className="form-group">
            <label>Return</label>
            <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
          </div>
        )}
        <div className="form-group">
          <label>Adults</label>
          <input type="number" value={adults} onChange={(e) => setAdults(e.target.value)} min="1" required />
        </div>
        <div className="form-group">
          <label>Children</label>
          <input type="number" value={children} onChange={(e) => setChildren(e.target.value)} min="0" />
        </div>
        <div className="form-group">
          <label>Infants</label>
          <input type="number" value={infants} onChange={(e) => setInfants(e.target.value)} min="0" />
        </div>
        <div className="form-group">
          <label>Class</label>
          <select value={travelClass} onChange={(e) => setTravelClass(e.target.value)}>
            <option value="ECONOMY">Economy</option>
            <option value="PREMIUM_ECONOMY">Premium Economy</option>
            <option value="BUSINESS">Business</option>
            <option value="FIRST">First</option>
          </select>
        </div>
        <div className="form-group direct-flight">
          <label>Direct flight only</label>
          <input type="checkbox" checked={nonStop} onChange={(e) => setNonStop(e.target.checked)} />
        </div>
        <div className="form-group">
          <label>Currency Code</label>
          <input type="text" value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Max Results</label>
          <input type="number" value={max} onChange={(e) => setMax(e.target.value)} min="1" />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="search-button">Search</button>
      </form>

      {flights.length > 0 && (
  <div className="results-container">
    <h2>Available Flights</h2>
    <div className="flight-list">
      {flights.map((flight, index) => (
        <FlightCard
          key={index}
          flight={flight}
          isSelected={selectedFlight === flight}
          onSelect={(flight) => setSelectedFlight(flight)}
        />
      ))}
    </div>
    {selectedFlight && (
      <button onClick={handleBooking} className="book-button">
        Book Selected Flight
      </button>
    )}
  </div>
)}
      {showPopup && (
        <FlightBookingPopup
          flight={selectedFlight}
          onClose={() => setShowPopup(false)}
          onBookingSuccess={handleBookingSuccess}
          userData={currentUserData}
        />
      )}
    </div>
  );
};

export default BookFlights;