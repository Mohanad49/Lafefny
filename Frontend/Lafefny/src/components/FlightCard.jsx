/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// New component: FlightCard.jsx
import React from 'react';
import '../styles/flightCard.css';

const FlightCard = ({ flight, isSelected, onSelect }) => {
  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (duration) => {
    return duration.replace('PT', '').toLowerCase();
  };

  return (
    <div className={`flight-card ${isSelected ? 'selected' : ''}`} onClick={() => onSelect(flight)}>
      <div className="flight-header">
        <div className="airline">
          {flight.validatingAirlineCodes[0]}
        </div>
        <div className="price">
          {flight.price.total} {flight.price.currency}
        </div>
      </div>
      
      {flight.itineraries.map((itinerary, idx) => (
        <div key={idx} className="itinerary-section">
          <h4>{idx === 0 ? 'Outbound' : 'Return'}</h4>
          <div className="segments">
            {itinerary.segments.map((segment, segIdx) => (
              <div key={segIdx} className="segment">
                <div className="segment-header">
                  <span className="flight-number">
                    {segment.carrierCode} {segment.number}
                  </span>
                  <span className="duration">
                    {formatDuration(segment.duration)}
                  </span>
                </div>
                <div className="segment-details">
                  <div className="departure">
                    <strong>{segment.departure.iataCode}</strong>
                    <div>{formatDateTime(segment.departure.at)}</div>
                  </div>
                  <div className="flight-line">
                    ────✈️────
                  </div>
                  <div className="arrival">
                    <strong>{segment.arrival.iataCode}</strong>
                    <div>{formatDateTime(segment.arrival.at)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="flight-footer">
        <div className="cabin-class">
          {flight.travelerPricings[0].fareDetailsBySegment[0].cabin}
        </div>
        <div className="seats">
          {flight.numberOfBookableSeats} seats left
        </div>
      </div>
    </div>
  );
};

export default FlightCard;