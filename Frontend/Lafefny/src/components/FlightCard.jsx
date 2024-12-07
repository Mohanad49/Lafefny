/* eslint-disable react/prop-types */
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Clock, Calendar, MapPin } from 'lucide-react';
import '../styles/flightCard.css';

const FlightCard = ({ flight, isSelected, onSelect, onBook }) => {
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
    <Card 
      className={`flight-card ${isSelected ? 'selected' : ''}`} 
      onClick={() => onSelect(flight)}
    >
      <div className="flight-header">
        <div className="airline-info">
          <div className="airline-badge">
            <Plane className="h-5 w-5 text-primary" />
          </div>
          <span className="airline-code">{flight.validatingAirlineCodes[0]}</span>
        </div>
        <div className="price-tag">
          <span className="currency">{flight.price.currency}</span>
          <span className="amount">{flight.price.total}</span>
        </div>
      </div>
      
      {flight.itineraries.map((itinerary, idx) => (
        <div key={idx} className="itinerary-section">
          <div className="itinerary-header">
            <h4>{idx === 0 ? 'Outbound' : 'Return'}</h4>
            <div className="duration">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(itinerary.duration)}</span>
            </div>
          </div>
          
          {itinerary.segments.map((segment, segIdx) => (
            <div key={segIdx} className="segment">
              <div className="segment-details">
                <div className="location-time">
                  <div className="time">{formatDateTime(segment.departure.at)}</div>
                  <div className="location">
                    <MapPin className="h-4 w-4" />
                    <span>{segment.departure.iataCode}</span>
                  </div>
                </div>
                
                <div className="flight-line">
                  <div className="airline-info">
                    <span className="flight-number">{segment.carrierCode} {segment.number}</span>
                  </div>
                </div>
                
                <div className="location-time">
                  <div className="time">{formatDateTime(segment.arrival.at)}</div>
                  <div className="location">
                    <MapPin className="h-4 w-4" />
                    <span>{segment.arrival.iataCode}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
      
      <div className="card-actions">
        <Button 
          className="book-button" 
          onClick={(e) => {
            e.stopPropagation();
            onBook(flight);
          }}
        >
          <Plane className="h-4 w-4 mr-2" />
          Book Now
        </Button>
      </div>
    </Card>
  );
};

export default FlightCard;