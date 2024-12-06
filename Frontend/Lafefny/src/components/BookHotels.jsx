import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/bookHotels.css";
import { useCookies } from "react-cookie";

const BookHotel = () => {
  const [cityCode, setCityCode] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState(1); // New state for adults count
  const [roomQuantity, setRoomQuantity] = useState(1); // New state for room quantity
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
  const offersPerPage = 10;

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
    try {
      const requestBody = {
        cityCode: cityCode.toUpperCase(),
        checkInDate,
        checkOutDate,
        adults: parseInt(adults),
        roomQuantity: parseInt(roomQuantity),
        currency: "EUR",
        countryOfResidence: "US"
      };

      console.log('Sending request with body:', requestBody);

      const response = await axios({
        method: 'POST',
        url: 'http://localhost:8000/amadeusHotel',
        headers: {
          'Content-Type': 'application/json'
        },
        data: requestBody
      });

      console.log('Raw API response:', response.data);

      if (response.data?.data) {
        console.log('Number of offers before filtering:', response.data.data.length);
        const validOffers = response.data.data.filter(offer => {
          const isValid = offer?.hotel?.hotelId && offer?.offers?.[0];
          if (!isValid) {
            console.log('Filtered out offer:', offer);
          }
          return isValid;
        });
        console.log('Number of valid offers after filtering:', validOffers.length);
        setHotelOffers(validOffers);
        setCurrentPage(1);
      } else {
        console.log('No data in response:', response.data);
        setError('No hotel offers found');
      }
    } catch (err) {
      console.error("Hotel search error:", err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to fetch hotel offers";
      console.error("Error details:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
        "http://localhost:8000/amadeusHotel/bookHotels",
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

  // Pagination logic
  const indexOfLastOffer = currentPage * offersPerPage;
  const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
  const currentOffers = hotelOffers.slice(indexOfFirstOffer, indexOfLastOffer);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                  <span className="error-message">
                    {formErrors.roomQuantity}
                  </span>
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

      <div className="hotel-offers">
        {currentOffers.map((offer, index) => (
          <div
            key={offer.hotel.hotelId || index}
            className={`hotel-offer-card ${
              selectedOffer === offer ? "selected" : ""
            }`}
            onClick={() => handleOfferSelection(offer)}
          >
            <div className="hotel-offer-header">
              <h3>{offer.hotel.name}</h3>
              <div className="hotel-rating">{offer.hotel.rating} ★</div>
            </div>
            <div className="hotel-offer-details">
              <p className="price">${offer.offers[0].price.total} per night</p>
              {offer.hotel.geoCode && (
                <p className="location">
                  <strong>Location:</strong> Lat:{" "}
                  {offer.hotel.geoCode.latitude.toFixed(2)}, Long:{" "}
                  {offer.hotel.geoCode.longitude.toFixed(2)}
                </p>
              )}
              <p className="room-details">
                <strong>Rooms:</strong>{" "}
                {offer.offers[0].room.typeEstimated.category} -{" "}
              </p>
              <p className="room-policies">
                {formatPolicies(offer.offers[0].policies)}
              </p>
              <p className="guests">
                <strong>Guests:</strong> {offer.offers[0].guests.adults} Adults
              </p>
            </div>
            <div className="hotel-offer-amenities">
              {offer.hotel.amenities?.map((amenity, i) => (
                <span key={i} className="amenity-tag">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        {Array.from(
          { length: Math.ceil(hotelOffers.length / offersPerPage) },
          (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
            >
              {i + 1}
            </button>
          )
        )}
      </div>

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
