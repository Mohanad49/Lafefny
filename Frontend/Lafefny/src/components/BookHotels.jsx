import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/BookHotel.css";
import { useCookies } from "react-cookie";

const BookHotel = () => {
  const [cityCode, setCityCode] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [roomQuantity, setRoomQuantity] = useState(1);
  const [hotelOffers, setHotelOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [cookies] = useCookies(["userType", "username"]);
  const username = cookies.username;
  const [formErrors, setFormErrors] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHotels, setTotalHotels] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const validateForm = () => {
    const errors = {};
    const today = new Date();
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn < today) {
      errors.checkIn = "Check-in date cannot be in the past";
    }
    if (checkOut <= checkIn) {
      errors.checkOut = "Check-out date must be after check-in date";
    }
    if (cityCode.length !== 3) {
      errors.cityCode = "City code must be 3 characters";
    }
    if (adults < 1) {
      errors.adults = "There must be at least one adult";
    }
    if (roomQuantity < 1 || roomQuantity > adults) {
      errors.roomQuantity =
        "Room quantity must be between 1 and the number of adults";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    setLoading(true);
    setHotelOffers([]);
    setCurrentPage(1);
    
    try {
      console.log('Starting hotel search...');
      await fetchHotels(1);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.error || "Failed to fetch hotel offers");
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async (page) => {
    try {
      setIsLoadingMore(true);
      console.log('Fetching hotels for page:', page, {
        cityCode,
        checkInDate,
        checkOutDate,
        adults,
        roomQuantity
      });

      const response = await axios.post("http://localhost:8000/amadeus/hotelOffer", {
        cityCode: cityCode.toUpperCase(),
        checkInDate,
        checkOutDate,
        adults: parseInt(adults),
        roomQuantity: parseInt(roomQuantity),
        page,
        limit: 10
      });

      console.log('Hotel search response:', response.data);
      const { data, pagination } = response.data;
      
      if (page === 1) {
        setHotelOffers(data);
      } else {
        setHotelOffers(prev => [...prev, ...data]);
      }
      
      setTotalPages(pagination.totalPages);
      setTotalHotels(pagination.totalHotels);
      setCurrentPage(pagination.currentPage);
    } catch (err) {
      console.error('Error fetching hotels:', err.response || err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to fetch hotel offers";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      fetchHotels(currentPage + 1);
    }
  };

  // Add scroll event listener for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage, totalPages, isLoadingMore]);

  const handleOfferSelection = (offer) => {
    setSelectedOffer((current) => (current === offer ? null : offer));
  };

  const handleBookHotel = async () => {
    if (!selectedOffer) {
      setError("Please select a hotel to book");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        "http://localhost:8000/amadeus/hotelOffer/bookHotels",
        {
          username,
          newBookedHotelId: selectedOffer.hotel.hotelId,
        }
      );
      setSuccessMessage(response.data.message || "Hotel booked successfully!");
      setShowSuccessPopup(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to book hotel");
    } finally {
      setLoading(false);
    }
  };

  const formatPolicies = (policies) => {
    if (!policies) return "Not available";
    const { cancellations, guarantee, paymentType } = policies;
    const formattedCancellations = cancellations
      ? cancellations
          .map((c) => `Cancel by ${new Date(c.deadline).toLocaleString()}`)
          .join(", ")
      : "No cancellations";
    const formattedGuarantee = guarantee
      ? `Accepted Payments: ${guarantee.acceptedPayments.methods.join(", ")}`
      : "No guarantee (No payment required to hold the reservation)";
    const formattedPaymentType =
      paymentType === "guarantee"
        ? "Payment Type: guarantee (Payment required to hold the reservation)"
        : `Payment Type: ${paymentType}`;
    return (
      <>
        <strong>Room Policies:</strong> <br />
        {formattedCancellations}. <br />
        {formattedGuarantee}. <br />
        {formattedPaymentType}
      </>
    );
  };

  return (
    <div className="book-hotel-container">
      <h1>Search for Hotels</h1>
      <div className="form-card">
        <form className="hotel-form" onSubmit={handleSearch}>
          <div className="search-section">
            <div className="form-row">
              <div className="form-group">
                <label>City Code</label>
                <input
                  type="text"
                  value={cityCode}
                  onChange={(e) => setCityCode(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. PAR, NYC, LON"
                />
                {formErrors.cityCode && (
                  <span className="error-message">{formErrors.cityCode}</span>
                )}
              </div>
              <div className="form-group">
                <label>Check-in Date</label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  required
                />
                {formErrors.checkIn && (
                  <span className="error-message">{formErrors.checkIn}</span>
                )}
              </div>
              <div className="form-group">
                <label>Check-out Date</label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  required
                />
                {formErrors.checkOut && (
                  <span className="error-message">{formErrors.checkOut}</span>
                )}
              </div>
              <div className="form-group">
                <label>Adults</label>
                <input
                  type="number"
                  value={adults}
                  onChange={(e) => setAdults(e.target.value)}
                  required
                  min="1"
                />
                {formErrors.adults && (
                  <span className="error-message">{formErrors.adults}</span>
                )}
              </div>
              <div className="form-group">
                <label>Room Quantity</label>
                <input
                  type="number"
                  value={roomQuantity}
                  onChange={(e) => setRoomQuantity(e.target.value)}
                  required
                  min="1"
                  max={adults}
                />
                {formErrors.roomQuantity && (
                  <span className="error-message">{formErrors.roomQuantity}</span>
                )}
              </div>
            </div>
          </div>

          <div className="button-group">
            <button className="search-button" type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search Hotels"}
            </button>
            <button
              className="book-button"
              type="button"
              onClick={handleBookHotel}
              disabled={!selectedOffer || loading}
            >
              {loading ? "Processing..." : "Book Selected Hotel"}
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p className="loading-text">Processing your request...</p>
          </div>
        </div>
      )}
      {error && <div className="error-banner">{String(error)}</div>}

      {hotelOffers.length > 0 && (
        <div className="hotel-offers">
          <h2>Available Hotels ({totalHotels} found)</h2>
          <div className="hotel-cards">
            {hotelOffers.map((offer, index) => (
              <div
                key={`${offer.hotel.hotelId}-${index}`}
                className={`hotel-card ${
                  selectedOffer === offer ? "selected" : ""
                }`}
                onClick={() => handleOfferSelection(offer)}
              >
                <h3>{offer.hotel.name}</h3>
                <p className="hotel-location">
                  {offer.hotel.address.cityName}, {offer.hotel.address.countryCode}
                </p>
                <div className="hotel-details">
                  <p className="price">
                    Price: {offer.offers[0].price.total} {offer.offers[0].price.currency}
                  </p>
                  <p>Room Type: {offer.offers[0].room.type || "Standard Room"}</p>
                  <div className="policies">
                    {formatPolicies(offer.offers[0].policies)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {isLoadingMore && (
            <div className="loading-more">
              Loading more hotels...
            </div>
          )}
          {currentPage < totalPages && !isLoadingMore && (
            <button className="load-more-btn" onClick={loadMore}>
              Load More Hotels
            </button>
          )}
        </div>
      )}

      {showSuccessPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>{successMessage}</h3>
            <button onClick={() => setShowSuccessPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookHotel;