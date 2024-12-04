// TourDetails.jsx
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Star, Info, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from 'react';
import { getItineraryById } from '../services/itineraryService';
import { useCurrency, currencies } from '../context/CurrencyContext';

const TourDetails = () => {
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('userID');
  const { currency } = useCurrency();

  const getTourDetails = async (id) => {
    try {
      const response = await getItineraryById(id);
      setTour(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tour:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleBookingClick = () => {
    if (!isLoggedIn) {
      navigate('/sign');
    }
    // Add booking logic here
  };

  const convertPrice = (price) => {
    if (!price) return 0;
    const convertedPrice = price * currencies[currency].rate;
    return convertedPrice;
  };

  useEffect(() => {
    getTourDetails(id);
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!tour) return <div>Tour not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hero Image */}
              <div className="relative h-[400px] rounded-xl overflow-hidden">
                <img
                  src={tour.image || "https://via.placeholder.com/800x400"}
                  alt={tour.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-accent text-primary font-semibold">
                    {tour.preferences}
                  </Badge>
                </div>
              </div>

              {/* Tour Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-primary mb-4">{tour.name}</h1>
                  <div className="flex flex-wrap gap-4 text-primary">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      {tour.locations[0]}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      {tour.duration} days
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      {tour.groupSize.min} - {tour.groupSize.max} people
                    </div>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 mr-2 text-yellow-400" />
                      {tour.ratings.averageRating.toFixed(1)} ({tour.ratings.totalRatings} reviews)
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="prose max-w-none">
                  <p className="text-primary text-lg">{tour.description}</p>
                </div>

                {/* Meeting Point */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Meeting Point</h3>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-2 text-primary shrink-0" />
                    <span className="text-primary">{tour.pickUpLocation}</span>
                  </div>
                </Card>

                {/* Activities */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Activities</h3>
                  <ul className="space-y-2">
                    {tour.activities.map((activity, index) => (
                      <li key={index} className="flex items-start">
                        <Info className="h-5 w-5 mr-2 text-primary shrink-0" />
                        <span className="text-primary">{activity}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Timeline */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Timeline</h3>
                  <ul className="space-y-4">
                    {tour.timeline.map((time, index) => (
                      <li key={index} className="flex items-start">
                        <Clock className="h-5 w-5 mr-2 text-primary shrink-0" />
                        <span className="text-primary">{time}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* What's Included/Excluded */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">What&apos;s Included</h3>
                    <ul className="space-y-2">
                      {tour.included.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <Info className="h-5 w-5 mr-2 text-primary shrink-0" />
                          <span className="text-primary">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Not Included</h3>
                    <ul className="space-y-2">
                      {tour.excluded.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <Info className="h-5 w-5 mr-2 text-primary shrink-0" />
                          <span className="text-primary">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>

                {/* Reviews */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Reviews</h3>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {tour.ratings.reviews.map((review, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">{review.reviewerName}</p>
                              <p className="text-sm text-primary">{formatDate(review.date)}</p>
                            </div>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                              <span>{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-primary">{review.comment}</p>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">
                      {currencies[currency].symbol}{convertPrice(tour.price).toFixed(2)}
                    </span>
                    <Badge
                      variant={tour.isActive ? "default" : "secondary"}
                      className={tour.isActive ? "bg-green-500" : "bg-red-500"}
                    >
                      {tour.isActive ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  
                  {/* Available Dates */}
                  <div>
                    <h4 className="font-semibold mb-2">Available Dates</h4>
                    <ScrollArea className="h-[100px]">
                      <div className="space-y-2">
                        {tour.availableDates.map((date, index) => (
                          <div key={index} className="text-primary">
                            {formatDate(date)}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {isLoggedIn ? (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleBookingClick}
                    >
                      Book Now
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      size="lg"
                      variant="secondary"
                      onClick={handleBookingClick}
                    >
                      Sign In to Book
                    </Button>
                  )}

                  <div className="text-sm text-primary">
                    <p>• Instant confirmation</p>
                    <p>• Free cancellation up to 24 hours before</p>
                    <p>• Mobile tickets accepted</p>
                    <p>• Duration: {tour.duration} days</p>
                    <p>• Language: {tour.language}</p>
                    <p>• Accessibility: {tour.accessibility}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TourDetails;