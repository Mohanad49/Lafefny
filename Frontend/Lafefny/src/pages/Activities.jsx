import { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
    Activity, 
    Clock, 
    MapPin,
    Bike,
    UtensilsCrossed,
    Tent,
    LandmarkIcon,
    Music,
    Mountain,
    Ship,
    Palmtree,
    TreePine,
    Camera
  } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrency, currencies } from '../context/CurrencyContext';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem('userID');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get('http://localhost:8000/activities');
        setActivities(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleActivityClick = (activityId) => {
    navigate(`/activity/${activityId}`);
  };

    const { currency } = useCurrency();
    
    const convertPrice = (price) => {
        if (!price) return currencies[currency].symbol + "0.00";
        
        // Handle numeric price from backend
        const numericPrice = typeof price === 'string' ? 
          parseFloat(price.replace(/[^0-9.-]+/g, "")) : 
          parseFloat(price);
          
        const convertedPrice = numericPrice * currencies[currency].rate;
        return `${currencies[currency].symbol}${convertedPrice.toFixed(2)}`;
      };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Sports': Bike,
      'Food': UtensilsCrossed,
      'Camping': Tent,
      'Cultural': LandmarkIcon,
      'Entertainment': Music,
      'Adventure': Mountain,
      'Cruise': Ship,
      'Beach': Palmtree,
      'Outdoor': TreePine,
      'Photography': Camera
    };
    
    const IconComponent = iconMap[category] || Activity;
    return <IconComponent className="h-4 w-4 mr-2" />;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-6">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6">
              Featured Activities
            </h1>
            <p className="text-primary text-lg max-w-2xl mx-auto">
              Discover exciting adventures and unique experiences at your destination
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((activity) => (
              <Card 
                key={activity._id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleActivityClick(activity._id)}
              >
                <div className="relative h-64">
                  <img
                    src={activity.image || "https://via.placeholder.com/400x300"}
                    alt={activity.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-primary mb-2">{activity.name}</h3>
                      <div className="flex items-center text-primary mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{activity.location}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-primary">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {activity.time}
                      </div>
                      <div className="flex items-center">
                        {getCategoryIcon(activity.category)}
                        <span>{activity.category}</span>
                    </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center space-x-1">
                        <span className="text-primary font-medium">⭐</span>
                        <span className="font-medium">{activity.ratings?.averageRating?.toFixed(1) || "New"}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">{convertPrice(activity.price)}</div>
                        <div className="text-sm text-primary">per person</div>
                      </div>
                    </div>
                    {isLoggedIn && (
                      <Button className="w-full">Book Now</Button>
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

export default Activities;