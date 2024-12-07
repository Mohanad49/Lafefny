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

        const response = await axios.get(`http://localhost:8000/tourist/${userId}/bookmarked-activities`);
        setBookmarkedActivities(response.data);
        
        // TODO: Add API call for bookmarked tours when endpoint is ready
        // const toursResponse = await axios.get(`http://localhost:8000/tourist/${userId}/bookmarked-tours`);
        // setBookmarkedTours(toursResponse.data);
        
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
      await axios.post(`http://localhost:8000/tourist/${userId}/bookmark-${type}/${itemId}`);
      
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

  const ActivityCard = ({ activity }) => (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/activities/${activity._id}`)}
    >
      <div className="relative h-64">
        <img
          src={activity.image || "https://via.placeholder.com/400x300"}
          alt={activity.name}
          className="w-full h-full object-cover"
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
            onClick={(e) => {
              e.stopPropagation();
              handleShare(e, activity);
            }}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
        {activity.category && (
          <div className="absolute bottom-4 left-4">
            <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium">
              {getCategoryIcon(activity.category)}
              {activity.category}
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">{activity.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{activity.description}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{activity.duration || 'Duration N/A'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{activity.location || 'Location N/A'}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">⭐</span>
              <span className="font-medium">{activity.ratings?.averageRating?.toFixed(1) || "New"}</span>
            </div>
            <div>
              <span className="text-lg font-semibold">{currencies[currency].symbol}{((activity.price || 0) * currencies[currency].rate).toFixed(2)}</span>
              <span className="text-sm text-gray-500 ml-2">per person</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TourCard = ({ tour }) => (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/tours/${tour._id}`)}
    >
      <div className="relative h-64">
        <img
          src={tour.image || "https://via.placeholder.com/400x300"}
          alt={tour.name}
          className="w-full h-full object-cover"
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
            onClick={(e) => {
              e.stopPropagation();
              handleShare(e, tour);
            }}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
        {tour.category && (
          <div className="absolute bottom-4 left-4">
            <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium">
              {getCategoryIcon(tour.category)}
              {tour.category}
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">{tour.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{tour.description}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{tour.duration || 'Duration N/A'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Globe2 className="h-4 w-4" />
            <span>{tour.languages?.join(', ') || 'Languages N/A'}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">⭐</span>
              <span className="font-medium">{tour.ratings?.averageRating?.toFixed(1) || "New"}</span>
            </div>
            <div>
              <span className="text-lg font-semibold">{currencies[currency].symbol}{((tour.price || 0) * currencies[currency].rate).toFixed(2)}</span>
              <span className="text-sm text-gray-500 ml-2">per person</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-accent/50"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Bookmark className="h-8 w-8 text-primary" />
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
                    My Bookmarks
                  </h1>
                </div>
                <p className="text-muted-foreground text-lg ml-11">
                  Your collection of favorite activities and tours
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex gap-4 justify-center">
              <Button
                variant={activeTab === 'activities' ? 'default' : 'outline'}
                onClick={() => setActiveTab('activities')}
                className="w-40"
              >
                Activities
              </Button>
              <Button
                variant={activeTab === 'tours' ? 'default' : 'outline'}
                onClick={() => setActiveTab('tours')}
                className="w-40"
              >
                Tours
              </Button>
            </div>

            {activeTab === 'activities' && (
              <div>
                {bookmarkedActivities.length === 0 ? (
                  <div className="text-center py-16 bg-accent/5 rounded-lg">
                    <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-4">
                      <ActivityIcon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">No Bookmarked Activities</h3>
                    <p className="text-muted-foreground mb-6">Start exploring activities and save your favorites!</p>
                    <Button 
                      onClick={() => navigate('/activities')}
                      className="inline-flex items-center gap-2"
                    >
                      <ActivityIcon className="h-4 w-4" />
                      Explore Activities
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarkedActivities.map(activity => (
                      <ActivityCard key={activity._id} activity={activity} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tours' && (
              <div>
                {bookmarkedTours.length === 0 ? (
                  <div className="text-center py-16 bg-accent/5 rounded-lg">
                    <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-4">
                      <Map className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">No Bookmarked Tours</h3>
                    <p className="text-muted-foreground mb-6">Start exploring tours and save your favorites!</p>
                    <Button 
                      onClick={() => navigate('/tours')}
                      className="inline-flex items-center gap-2"
                    >
                      <Map className="h-4 w-4" />
                      Explore Tours
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarkedTours.map(tour => (
                      <TourCard key={tour._id} tour={tour} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default Bookmarks;
