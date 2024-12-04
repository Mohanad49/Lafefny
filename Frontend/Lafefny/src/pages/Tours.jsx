import { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Globe2, Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrency, currencies } from '../context/CurrencyContext';

const Tours = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('userID');
  const { currency } = useCurrency();

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const response = await axios.get('http://localhost:8000/itineraries');
        setItineraries(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, []);

  const handleItineraryClick = (itineraryId) => {
    navigate(`/itinerary/${itineraryId}`);
  };

  const handleBookNow = (itineraryId) => {
    const touristId = localStorage.getItem('userID');
    navigate(`/tourist/AllPay`, { state: { touristId, itineraryId } });
  };

  const convertPrice = (price) => {
    if (!price) return currencies[currency].symbol + "0.00";
    const convertedPrice = price * currencies[currency].rate;
    return `${currencies[currency].symbol}${convertedPrice.toFixed(2)}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6">
              Featured Itineraries
            </h1>
            <p className="text-primary text-lg max-w-2xl mx-auto">
              Discover unique guided tours and experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {itineraries.map((itinerary) => (
              <Card 
                key={itinerary._id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleItineraryClick(itinerary._id)}
              >
                <div className="relative h-64">
                  <img
                    src={itinerary.image || "https://via.placeholder.com/400x300"}
                    alt={itinerary.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-primary mb-2">{itinerary.name}</h3>
                      <div className="flex items-center text-primary mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{itinerary.locations[0]}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-primary">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {itinerary.duration[0]} days
                      </div>
                      <div className="flex items-center">
                        <Globe2 className="h-4 w-4 mr-2" />
                        {itinerary.language}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">
                          {itinerary.ratings?.averageRating?.toFixed(1) || "New"}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">
                          {convertPrice(itinerary.price)}
                        </div>
                        <div className="text-sm text-primary">per person</div>
                      </div>
                    </div>
                    {isLoggedIn && (
                      <Button className="w-full" onClick={(e) => { e.stopPropagation(); handleBookNow(itinerary._id); }}>Book Now</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tours;