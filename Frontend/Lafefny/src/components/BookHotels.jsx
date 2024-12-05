import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const BookHotels = () => {
  const [cookies] = useCookies(['user']);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    cityCode: '',
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    roomQuantity: 1
  });
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const hotelsPerPage = 10;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const searchHotels = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHotels([]);

    try {
      console.log('Searching hotels with params:', searchParams);

      const response = await axios.get('http://localhost:3001/amadeus/search-hotels', {
        params: searchParams
      });

      if (!response.data || response.data.length === 0) {
        setError('No hotels found for the specified criteria');
        return;
      }

      console.log('Hotels found:', response.data.length);
      setHotels(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Hotel search error:', error);
      setError(error.response?.data?.error || 'Failed to search hotels');
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastHotel = currentPage * hotelsPerPage;
  const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
  const currentHotels = hotels.slice(indexOfFirstHotel, indexOfLastHotel);
  const totalPages = Math.ceil(hotels.length / hotelsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="pagination-container">
        <button 
          onClick={() => paginate(currentPage - 1)} 
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Previous
        </button>
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={() => paginate(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    );
  };

  const renderHotelCard = (hotel) => {
    if (!hotel.hotel || !hotel.offers || hotel.offers.length === 0) return null;

    const { hotel: hotelInfo, offers } = hotel;
    const bestOffer = offers[0]; // Assuming the first offer is the best one

    return (
      <div key={hotelInfo.hotelId} className="hotel-card">
        <div className="hotel-info">
          <h3>{hotelInfo.name}</h3>
          <p className="hotel-location">
            {hotelInfo.address.cityName}, {hotelInfo.address.countryCode}
          </p>
          {hotelInfo.rating && (
            <p className="hotel-rating">
              Rating: {hotelInfo.rating} / 5
            </p>
          )}
        </div>
        <div className="offer-details">
          <p className="price">
            {bestOffer.price.currency} {bestOffer.price.total}
            <span className="per-night"> per night</span>
          </p>
          <p className="room-type">
            {bestOffer.room.type || 'Standard Room'}
          </p>
          {bestOffer.room.description && (
            <p className="room-description">
              {bestOffer.room.description.text}
            </p>
          )}
          <button 
            className="book-button"
            onClick={() => navigate(`/book-hotel/${hotelInfo.hotelId}`, { 
              state: { 
                hotel: hotelInfo,
                offer: bestOffer,
                searchParams 
              }
            })}
          >
            Book Now
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="book-hotels-container">
      <h2>Search Hotels</h2>
      <form onSubmit={searchHotels} className="search-form">
        <div className="form-group">
          <label htmlFor="cityCode">City Code (e.g., PAR for Paris):</label>
          <input
            type="text"
            id="cityCode"
            name="cityCode"
            value={searchParams.cityCode}
            onChange={handleInputChange}
            required
            placeholder="Enter city code"
          />
        </div>
        <div className="form-group">
          <label htmlFor="checkInDate">Check-in Date:</label>
          <input
            type="date"
            id="checkInDate"
            name="checkInDate"
            value={searchParams.checkInDate}
            onChange={handleInputChange}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="form-group">
          <label htmlFor="checkOutDate">Check-out Date:</label>
          <input
            type="date"
            id="checkOutDate"
            name="checkOutDate"
            value={searchParams.checkOutDate}
            onChange={handleInputChange}
            required
            min={searchParams.checkInDate || new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="form-group">
          <label htmlFor="adults">Number of Adults:</label>
          <input
            type="number"
            id="adults"
            name="adults"
            value={searchParams.adults}
            onChange={handleInputChange}
            required
            min="1"
            max="9"
          />
        </div>
        <div className="form-group">
          <label htmlFor="roomQuantity">Number of Rooms:</label>
          <input
            type="number"
            id="roomQuantity"
            name="roomQuantity"
            value={searchParams.roomQuantity}
            onChange={handleInputChange}
            required
            min="1"
            max="9"
          />
        </div>
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? 'Searching...' : 'Search Hotels'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && (
        <div className="loading-message">
          Searching for hotels...
        </div>
      )}

      {!loading && hotels.length > 0 && (
        <div className="results-container">
          <h3>Found {hotels.length} hotels</h3>
          <div className="hotel-grid">
            {currentHotels.map(renderHotelCard)}
          </div>
          {renderPagination()}
        </div>
      )}

      <style jsx>{`
        .book-hotels-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .search-form {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .search-button {
          background: #007bff;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
        }

        .search-button:disabled {
          background: #ccc;
        }

        .hotel-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .hotel-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .hotel-info h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .hotel-location {
          color: #666;
          font-size: 0.9em;
          margin-bottom: 10px;
        }

        .hotel-rating {
          color: #f39c12;
          font-weight: bold;
        }

        .offer-details {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }

        .price {
          font-size: 1.2em;
          font-weight: bold;
          color: #2ecc71;
          margin-bottom: 10px;
        }

        .per-night {
          font-size: 0.8em;
          color: #666;
        }

        .room-type {
          font-weight: bold;
          margin-bottom: 5px;
        }

        .room-description {
          font-size: 0.9em;
          color: #666;
          margin-bottom: 15px;
        }

        .book-button {
          background: #2ecc71;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
        }

        .book-button:hover {
          background: #27ae60;
        }

        .error-message {
          color: #e74c3c;
          padding: 10px;
          background: #fde2e2;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .loading-message {
          text-align: center;
          padding: 20px;
          color: #666;
        }

        .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 20px;
          gap: 10px;
        }

        .pagination-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .pagination-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .page-info {
          margin: 0 10px;
        }
      `}</style>
    </div>
  );
};

export default BookHotels;