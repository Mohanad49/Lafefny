import { useEffect, useState } from 'react';
import { getTouristBookings, addActivityReview, addItineraryReview } from '../services/touristHistoryService';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Globe2, Star, MapPin, Share2, ArrowLeft, Calendar } from "lucide-react";
import { useCurrency, currencies } from '../context/CurrencyContext';
import { useNavigate } from "react-router-dom";
import ShareModal from "@/components/ui/share-modal";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import ReviewForm from './ReviewForm';

const TouristHistory = () => {
  const [bookedActivities, setBookedActivities] = useState([]);
  const [bookedItineraries, setBookedItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Activities');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [touristName, setTouristName] = useState('');

  const navigate = useNavigate();
  const { toast } = useToast();
  const { currency } = useCurrency();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const userID = localStorage.getItem('userID');
        if (!userID) {
          navigate('/login');
          return;
        }

        const response = await getTouristBookings(userID);
        setBookedActivities(response.data.pastActivities || []);
        setBookedItineraries(response.data.pastItineraries || []);
        setTouristName(response.data.touristName);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch your bookings. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate, toast]);

  const handleShare = (item) => {
    setIsShareModalOpen(true);
    setSelectedItem(item);
  };

  const handleReview = (item) => {
    setShowReviewForm(true);
    setSelectedItem(item);
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to submit a review.",
      });
      return;
    }

    const review = {
      reviewerName: touristName,
      rating: parseInt(rating),
      comment,
      date: new Date()
    };

    try {
      let response;
      if (selectedItem.type === 'Activity') {
        response = await addActivityReview(selectedItem._id, review);
        setBookedActivities(prevActivities => 
          prevActivities.map(activity => 
            activity._id === selectedItem._id 
              ? { ...activity, ratings: response.data.ratings }
              : activity
          )
        );
      } else if (selectedItem.type === 'Itinerary') {
        response = await addItineraryReview(selectedItem._id, review);
        setBookedItineraries(prevItineraries => 
          prevItineraries.map(itinerary => 
            itinerary._id === selectedItem._id 
              ? { ...itinerary, ratings: response.data.ratings }
              : itinerary
          )
        );
      }

      toast({
        title: "Success",
        description: "Review submitted successfully!",
      });
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review. Please try again.",
      });
    }
  };

  const convertPrice = (price) => {
    if (!price) return currencies[currency].symbol + "0.00";
    const numericPrice = typeof price === 'string' ? 
      parseFloat(price.replace(/[^0-9.-]+/g, "")) : 
      parseFloat(price);
    const convertedPrice = numericPrice * currencies[currency].rate;
    return `${currencies[currency].symbol}${convertedPrice.toFixed(2)}`;
  };

  const tabs = ['Activities', 'Itineraries'];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-6">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6">
              Past Bookings
            </h1>
            <p className="text-primary text-lg max-w-2xl mx-auto">
              Review your past adventures and experiences
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg p-1 bg-muted">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${activeTab === tab
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "Activities" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bookedActivities.length > 0 ? (
                bookedActivities.map((activity) => (
                  <Card 
                    key={activity._id} 
                    className="overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="relative h-64">
                      <img
                        src={activity.image || "https://via.placeholder.com/400x300"}
                        alt={activity.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare({ ...activity, type: 'Activity' });
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold text-primary mb-2">{activity.name}</h3>
                          <div className="flex items-center text-primary mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">{activity.location || 'Location N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-primary">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {activity.duration
                              ? `${activity.duration} hours`
                              : 'Duration N/A'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {activity.date
                              ? new Date(activity.date).toLocaleDateString()
                              : 'Date N/A'}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">
                              {activity.ratings?.averageRating?.toFixed(1) || "New"}
                            </span>
                            <span className="text-sm text-muted-foreground ml-1">
                              ({activity.ratings?.totalRatings || 0})
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-primary">
                              {convertPrice(activity.price || 0)}
                            </div>
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => handleReview({ ...activity, type: 'Activity' })}
                        >
                          Add Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <Clock className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-xl font-semibold text-primary mb-2">No Past Activities</p>
                  <p className="text-muted-foreground">You haven't completed any activities yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "Itineraries" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bookedItineraries.length > 0 ? (
                bookedItineraries.map((itinerary) => (
                  <Card 
                    key={itinerary._id} 
                    className="overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="relative h-64">
                      <img
                        src={itinerary.image || "https://via.placeholder.com/400x300"}
                        alt={itinerary.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare({ ...itinerary, type: 'Itinerary' });
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold text-primary mb-2">{itinerary.name}</h3>
                          <div className="flex items-center text-primary mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              {itinerary.locations?.[0] || 'Location N/A'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-primary">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {Array.isArray(itinerary.duration) && itinerary.duration.length > 0
                              ? `${itinerary.duration[0]} days`
                              : itinerary.duration
                              ? `${itinerary.duration} days`
                              : 'Duration N/A'}
                          </div>
                          <div className="flex items-center">
                            <Globe2 className="h-4 w-4 mr-2" />
                            {itinerary.language || 'Language N/A'}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">
                              {itinerary.ratings?.averageRating?.toFixed(1) || "New"}
                            </span>
                            <span className="text-sm text-muted-foreground ml-1">
                              ({itinerary.ratings?.totalRatings || 0})
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-primary">
                              {convertPrice(itinerary.price || 0)}
                            </div>
                            <div className="text-sm text-muted-foreground">per person</div>
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => handleReview({ ...itinerary, type: 'Itinerary' })}
                        >
                          Add Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <Clock className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-xl font-semibold text-primary mb-2">No Past Itineraries</p>
                  <p className="text-muted-foreground">You haven't completed any itineraries yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
      
      {isShareModalOpen && selectedItem && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={selectedItem.type || "Item"}
          url={`${window.location.origin}/${selectedItem.type === 'Activity' ? 'activities' : 'tours'}/${selectedItem._id}`}
        />
      )}

      {showReviewForm && selectedItem && (
        <ReviewForm
          onClose={() => setShowReviewForm(false)}
          onSubmit={handleReviewSubmit}
          title={selectedItem.name}
        />
      )}
    </div>
  );
};

export default TouristHistory;
