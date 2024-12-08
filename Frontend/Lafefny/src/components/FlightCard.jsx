import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Clock, Calendar, AlertCircle, Users, ArrowRight, ArrowDown } from 'lucide-react';
import { format, addMinutes, parseISO } from 'date-fns';
import { useCurrency, currencies } from '../context/CurrencyContext';

const FlightCard = ({ flight, onBook, loading }) => {
  const { currency } = useCurrency();
  
  const formatDuration = (duration) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  const calculateTotalDuration = (segments) => {
    let totalMinutes = 0;
    segments.forEach(segment => {
      const departure = parseISO(segment.departure.at);
      const arrival = parseISO(segment.arrival.at);
      const diffInMinutes = Math.round((arrival - departure) / (1000 * 60));
      totalMinutes += diffInMinutes;
    });
    return formatDuration(totalMinutes);
  };

  const formatDateTime = (dateTimeString) => {
    const date = parseISO(dateTimeString);
    return {
      time: format(date, 'HH:mm'),
      date: format(date, 'EEE, MMM d')
    };
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      {flight.itineraries.map((itinerary, itineraryIndex) => (
        <div key={itineraryIndex} className="mb-6 last:mb-0">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-medium">
              {itineraryIndex === 0 ? 'Outbound' : 'Return'} Flight
            </span>
          </div>

          {itinerary.segments.map((segment, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-2xl font-bold">{formatDateTime(segment.departure.at).time}</p>
                      <p className="text-sm text-gray-600">{formatDateTime(segment.departure.at).date}</p>
                      <p className="text-lg font-medium">{segment.departure.iataCode}</p>
                      <p className="text-sm text-gray-500">{segment.departure.terminal ? `Terminal ${segment.departure.terminal}` : 'Terminal TBD'}</p>
                    </div>
                    <div className="flex flex-col items-center px-4">
                      <p className="text-sm text-gray-500 mb-1">{formatDuration(segment.duration)}</p>
                      <div className="relative w-32 h-px bg-gray-300">
                        <Plane className="absolute top-1/2 right-0 h-4 w-4 text-primary transform -translate-y-1/2" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Direct Flight</p>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-2xl font-bold">{formatDateTime(segment.arrival.at).time}</p>
                      <p className="text-sm text-gray-600">{formatDateTime(segment.arrival.at).date}</p>
                      <p className="text-lg font-medium">{segment.arrival.iataCode}</p>
                      <p className="text-sm text-gray-500">{segment.arrival.terminal ? `Terminal ${segment.arrival.terminal}` : 'Terminal TBD'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Airline</p>
                    <p className="font-medium">{segment.carrierCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Flight Number</p>
                    <p className="font-medium">{segment.number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Aircraft</p>
                    <p className="font-medium">{segment.aircraft.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Class</p>
                    <p className="font-medium">{flight.travelerPricings[0].fareDetailsBySegment[0].cabin}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-2">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Total Duration: {calculateTotalDuration(itinerary.segments)}
            </p>
          </div>
        </div>
      ))}

      <div className="border-t mt-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Price per person</p>
            <p className="text-2xl font-bold text-primary">
              {currencies[currency].symbol} {(flight.price.total * currencies[currency].rate).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">
              {flight.travelerPricings.length} {flight.travelerPricings.length === 1 ? 'passenger' : 'passengers'}
            </p>
          </div>
          <Button
            onClick={() => onBook(flight)}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Booking...</span>
              </div>
            ) : (
              'Book Now'
            )}
          </Button>
        </div>
      </div>

      {flight.numberOfBookableSeats && (
        <div className="mt-2 flex items-center gap-2 text-amber-600">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">Only {flight.numberOfBookableSeats} seats left at this price</p>
        </div>
      )}
    </Card>
  );
};

export default FlightCard;