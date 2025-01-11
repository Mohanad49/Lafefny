import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Globe2, 
  Map,
  Activity as ActivityIcon,
  Star
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useToast } from '@/components/ui/use-toast';
import { useCurrency, currencies } from '../context/CurrencyContext';
import ShareModal from "@/components/ui/share-modal";

const Bookmarks = () => {
  const [bookmarkedActivities, setBookmarkedActivities] = useState([]);
  const [bookmarkedTours, setBookmarkedTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activities');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currency } = useCurrency();

  const isLoggedIn = !!localStorage.getItem('userID');
  const isTourist = localStorage.getItem('userRole') === 'Tourist';

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const userId = localStorage.getItem('userID');
        if (!userId) {
          navigate('/login');
          return;
        }

        const [activitiesResponse, toursResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/tourist/${userId}/bookmarked-activities`),
          axios.get(`${import.meta.env.VITE_API_URL}/tourist/${userId}/bookmarked-tours`)
        ]);

        setBookmarkedActivities(activitiesResponse.data);
        setBookmarkedTours(toursResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
        toast({
          title: "Error",
          description: "Failed to fetch bookmarks. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [navigate, toast]);

  const handleRemoveBookmark = async (itemId, type) => {
    try {
      const userId = localStorage.getItem('userID');
      await axios.post(`${import.meta.env.VITE_API_URL}/tourist/${userId}/bookmark-${type}/${itemId}`);
      
      if (type === 'activity') {
        setBookmarkedActivities(prev => prev.filter(item => item._id !== itemId));
      } else {
        setBookmarkedTours(prev => prev.filter(item => item._id !== itemId));
      }

      toast({
        title: "Success",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} removed from bookmarks`,
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to remove bookmark. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShare = (e, item) => {
    e.stopPropagation();
    setSelectedItem(item);
    setIsShareModalOpen(true);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Adventure':
        return <ActivityIcon className="h-4 w-4 text-primary" />;
      case 'Culture':
        return <Map className="h-4 w-4 text-primary" />;
      case 'Food':
        return <Star className="h-4 w-4 text-primary" />;
      default:
        return null;
    }
  };

  const convertPrice = (price) => {
    return ((price || 0) * currencies[currency].rate).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              className="flex items-center gap-2 hover:bg-transparent hover:text-primary"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Button>
          </div>

          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-6">
              <BookmarkCheck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6">
              My Bookmarks
            </h1>
            <p className="text-primary text-lg max-w-2xl mx-auto">
              Your saved activities and tours for future adventures
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg p-1 bg-muted">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${activeTab === 'activities'
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
                onClick={() => setActiveTab('activities')}
              >
                Activities
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${activeTab === 'tours'
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
                onClick={() => setActiveTab('tours')}
              >
                Tours
              </button>
            </div>
          </div>

          {activeTab === 'activities' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bookmarkedActivities.length > 0 ? (
                bookmarkedActivities.map((activity) => (
                  <Card 
                    key={activity._id}
                    className="overflow-hidden hover:shadow-lg transition-shadow group"
                    onClick={() => navigate(`/activities/${activity._id}`)}
                  >
                    <div className="relative h-64">
                      <img
                        src={activity.image || "https://via.placeholder.com/400x300"}
                        alt={activity.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.src = '/placeholder-activity.jpg';
                        }}
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white/80 backdrop-blur-sm hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBookmark(activity._id, 'activity');
                          }}
                        >
                          <BookmarkCheck className="h-5 w-5 text-yellow-500 fill-current" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white/80 backdrop-blur-sm hover:bg-white"
                          onClick={(e) => handleShare(e, activity)}
                        >
                          <Share2 className="h-5 w-5" />
                        </Button>
                      </div>
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
                            {activity.duration ? `${activity.duration} hours` : 'Duration N/A'}
                          </div>
                          <div className="flex items-center">
                            {getCategoryIcon(activity.category)}
                            <span className="ml-2">{activity.category || 'Category N/A'}</span>
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
                              {currencies[currency].symbol}{convertPrice(activity.price)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <Bookmark className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-xl font-semibold text-primary mb-2">No Bookmarked Activities</p>
                  <p className="text-muted-foreground">You haven't saved any activities yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tours' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bookmarkedTours.length > 0 ? (
                bookmarkedTours.map((tour) => (
                  <Card 
                    key={tour._id}
                    className="overflow-hidden hover:shadow-lg transition-shadow group"
                    onClick={() => navigate(`/tours/${tour._id}`)}
                  >
                    <div className="relative h-64">
                      <img
                        src={tour.image || "https://via.placeholder.com/400x300"}
                        alt={tour.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.src = '/placeholder-tour.jpg';
                        }}
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white/80 backdrop-blur-sm hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBookmark(tour._id, 'tour');
                          }}
                        >
                          <BookmarkCheck className="h-5 w-5 text-yellow-500 fill-current" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white/80 backdrop-blur-sm hover:bg-white"
                          onClick={(e) => handleShare(e, tour)}
                        >
                          <Share2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold text-primary mb-2">{tour.name}</h3>
                          <div className="flex items-center text-primary mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">{tour.locations?.join(', ') || 'Location N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-primary">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {tour.duration ? `${tour.duration} days` : 'Duration N/A'}
                          </div>
                          <div className="flex items-center">
                            <Globe2 className="h-4 w-4 mr-2" />
                            <span>{tour.language || 'Language N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">
                              {tour.ratings?.averageRating?.toFixed(1) || "New"}
                            </span>
                            <span className="text-sm text-muted-foreground ml-1">
                              ({tour.ratings?.totalRatings || 0})
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-primary">
                              {currencies[currency].symbol}{convertPrice(tour.price)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <Bookmark className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-xl font-semibold text-primary mb-2">No Bookmarked Tours</p>
                  <p className="text-muted-foreground">You haven't saved any tours yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
      
      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          item={selectedItem}
        />
      )}
    </div>
  );
};

export default Bookmarks;
