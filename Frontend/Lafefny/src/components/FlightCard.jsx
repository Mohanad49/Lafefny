/* eslint-disable react/prop-types */
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Clock, Loader2 } from 'lucide-react';
import { useCurrency, currencies } from '../context/CurrencyContext';
import '../styles/flightCard.css';

const FlightCard = ({ flight, onBook, isBooking, convertPrice }) => {
  const { currency } = useCurrency();
  
  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (duration) => {
    const durationStr = duration.replace('PT', '').toLowerCase();
    const hours = parseInt(durationStr.match(/(\d+)h/)?.[1] || '0');
    const minutes = parseInt(durationStr.match(/(\d+)m/)?.[1] || '0');
    return `${hours}h ${minutes}m`;
  };

  const segment = flight.itineraries[0].segments[0];

  return (
    <Card className="p-6 mb-4 bg-white hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Airline Info */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center bg-primary/5 p-3 rounded-lg">
            <Plane className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-primary mt-1">{flight.validatingAirlineCodes[0]}</span>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Flight</div>
            <div className="font-semibold">{segment.number}</div>
          </div>
        </div>

        {/* Flight Times */}
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold">{segment.departure.iataCode}</div>
            <div className="text-sm text-muted-foreground">{formatDateTime(segment.departure.at)}</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-sm text-muted-foreground">
              <Clock className="h-4 w-4 inline mr-1" />
              {formatDuration(flight.itineraries[0].duration)}
            </div>
            <div className="w-32 h-px bg-border relative my-2">
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
            </div>
            <div className="text-xs text-muted-foreground">Direct</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold">{segment.arrival.iataCode}</div>
            <div className="text-sm text-muted-foreground">{formatDateTime(segment.arrival.at)}</div>
          </div>
        </div>

        {/* Price and Book Button */}
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="text-center lg:text-right">
            <div className="text-sm text-muted-foreground">Price</div>
            <div className="text-2xl font-bold text-primary">
              {currencies[currency].symbol} {convertPrice(flight.price.total)}
            </div>
          </div>

          <Button
            onClick={() => onBook(flight)}
            disabled={isBooking}
            className="w-full lg:w-auto min-w-[120px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {isBooking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <Plane className="mr-2 h-4 w-4" />
                Book Now
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FlightCard;