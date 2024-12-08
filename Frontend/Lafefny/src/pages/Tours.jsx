import { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Globe2, Star, MapPin, Share2, Bookmark, BookmarkCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrency, currencies } from '../context/CurrencyContext';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import ShareModal from "@/components/ui/share-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

const Tours = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('userID');
  const isTourist = localStorage.getItem('userRole') === 'Tourist';
  const { currency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPreference, setSelectedPreference] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState("default");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentItinerary, setCurrentItinerary] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [bookedItineraries, setBookedItineraries] = useState(new Set());
  const [bookmarkedTours, setBookmarkedTours] = useState(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const response = await axios.get('http://localhost:8000/itineraries');
        const touristId = localStorage.getItem('userID');
        
        // Update itineraries with booking status
        const updatedItineraries = response.data.map((itinerary) => ({
          ...itinerary,
          booked: itinerary.paidBy?.includes(touristId),
        }));
        
        setItineraries(updatedItineraries);
        
        // Initialize booked itineraries
        const booked = new Set(updatedItineraries.filter(i => i.booked).map(i => i._id));
        setBookedItineraries(booked);

        // Fetch bookmarked tours
        if (isLoggedIn && isTourist) {
          const bookmarksResponse = await axios.get(`http://localhost:8000/tourist/${touristId}/bookmarked-tours`);
          const bookmarkedIds = new Set(bookmarksResponse.data.map(tour => tour._id));
          setBookmarkedTours(bookmarkedIds);
        }
        
        const highestPrice = Math.max(...response.data.map(i => 
          typeof i.price === 'string' ? 
            parseFloat(i.price.replace(/[^0-9.-]+/g, "")) : 
            i.price || 0
        ));
        const roundedMaxPrice = Math.ceil(highestPrice / 100) * 100;
        setMaxPrice(roundedMaxPrice);
        setPriceRange([0, roundedMaxPrice]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, []);

  const handleItineraryClick = (itineraryId) => {
    navigate(`/tours/${itineraryId}`);
  };

  const checkIfCanCancel = (bookedDate) => {
    const today = new Date();
    const bookingDate = new Date(bookedDate);
  
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);
  
    const diffTime = bookingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    return diffDays >= 2;
  };

  const handleCancelBooking = async (itineraryId) => {
    const touristId = localStorage.getItem('userID');
    if (!touristId) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in as a tourist to cancel bookings."
      });
      return;
    }

    try {
      const itinerary = itineraries.find(i => i._id === itineraryId);
      if (!itinerary) {
        toast({
          variant: "destructive",
          title: "Itinerary Not Found",
          description: "Could not find the tour you're trying to cancel."
        });
        return;
      }

      // Check if user has actually booked this itinerary
      if (!itinerary.paidBy?.includes(touristId)) {
        toast({
          variant: "destructive",
          title: "Booking Not Found",
          description: "You don't have an active booking for this tour."
        });
        return;
      }

      const booking = itinerary.touristBookings?.find(
        b => b.tourist === touristId
      );
      
      if (!booking || !booking.bookedDate) {
        toast({
          variant: "destructive",
          title: "Booking Not Found",
          description: "Could not find your booking details for this tour."
        });
        return;
      }

      if (!checkIfCanCancel(booking.bookedDate)) {
        toast({
          variant: "destructive",
          title: "Cancellation Failed",
          description: "Cancellation is not allowed less than 2 days before the tour date."
        });
        return;
      }

      const response = await axios.post(`http://localhost:8000/itineraries/${itineraryId}/cancel`, { 
        userId: touristId 
      });

      // Update local state
      setBookedItineraries(prev => {
        const newSet = new Set(prev);
        newSet.delete(itineraryId);
        return newSet;
      });

      // Update itineraries state to reflect cancellation
      setItineraries(prev => prev.map(i => {
        if (i._id === itineraryId) {
          return {
            ...i,
            paidBy: i.paidBy.filter(id => id !== touristId),
            touristBookings: i.touristBookings.filter(b => b.tourist !== touristId)
          };
        }
        return i;
      }));

      toast({
        title: "Booking Cancelled Successfully!",
        description: `Refunded amount: ${response.data.refundedAmount} EGP. New wallet balance: ${response.data.newWalletBalance} EGP`
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description: error.response?.data?.error || "An error occurred while cancelling the booking."
      });
    }
  };

  const handleNewBooking = async (itineraryId) => {
    const touristId = localStorage.getItem('userID');
    if (!touristId) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in as a tourist to make bookings."
      });
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8000/itineraries/${itineraryId}/availableDates`);
      const dates = response.data.availableDates.map(date => format(new Date(date), 'yyyy-MM-dd'));
      setAvailableDates(dates);
      setCurrentItinerary(itineraryId);
      setIsDateDialogOpen(true);
    } catch (error) {
      console.error("Error fetching available dates:", error);
      toast({
        variant: "destructive",
        title: "Failed to fetch available dates",
        description: error.response?.data?.message || "Please try again later."
      });
    }
  };

  const handleBookNow = async (itineraryId, e) => {
    e.stopPropagation();
    
    if (bookedItineraries.has(itineraryId)) {
      await handleCancelBooking(itineraryId);
    } else {
      await handleNewBooking(itineraryId);
    }
  };

  const handleDateConfirm = async () => {
    if (!selectedDate) {
      toast({
        variant: "destructive",
        title: "Date Required",
        description: "Please select a date for your tour"
      });
      return;
    }

    const touristId = localStorage.getItem('userID');
    if (!touristId) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to continue"
      });
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8000/itineraries/${currentItinerary}/book`, { 
        userId: touristId, 
        selectedDate 
      });

      // Update local state to reflect the new booking
      setBookedItineraries(prev => {
        const newSet = new Set(prev);
        newSet.add(currentItinerary);
        return newSet;
      });

      // Update itineraries state to include the new booking
      setItineraries(prev => prev.map(i => {
        if (i._id === currentItinerary) {
          // Add the user to paidBy array if not already there
          const newPaidBy = i.paidBy || [];
          if (!newPaidBy.includes(touristId)) {
            newPaidBy.push(touristId);
          }

          // Add the new tourist booking
          const newTouristBookings = i.touristBookings || [];
          newTouristBookings.push({
            tourist: touristId,
            bookedDate: selectedDate
          });

          return {
            ...i,
            paidBy: newPaidBy,
            touristBookings: newTouristBookings
          };
        }
        return i;
      }));
      
      // Close the date selection dialog
      setIsDateDialogOpen(false);
      setSelectedDate("");

      
      // Navigate to payment page
      navigate(`/tourist/AllPay`, { 
        state: { 
          touristId, 
          itineraryId: currentItinerary,
          selectedDate 
        } 
      });
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: error.response?.data?.error || "Failed to confirm your booking. Please try again."
      });
    }
  };

  const handleShare = (event, item) => {
    event.stopPropagation();
    setSelectedItem(item);
    setIsShareModalOpen(true);
  };

  const handleBookmark = async (event, tourId) => {
    event.stopPropagation();
    
    if (!isLoggedIn || !isTourist) {
      toast({
        title: "Authentication Required",
        description: "Please log in as a tourist to bookmark tours.",
        variant: "destructive"
      });
      return;
    }

    try {
      const userId = localStorage.getItem('userID');
      const response = await axios.post(
        `http://localhost:8000/tourist/${userId}/bookmark-tour/${tourId}`
      );

      if (response.data.isBookmarked) {
        setBookmarkedTours(prev => new Set([...prev, tourId]));
        toast({
          title: "Tour Bookmarked",
          description: "Tour has been added to your bookmarks.",
        });
      } else {
        setBookmarkedTours(prev => {
          const newSet = new Set(prev);
          newSet.delete(tourId);
          return newSet;
        });
        toast({
          title: "Bookmark Removed",
          description: "Tour has been removed from your bookmarks.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to bookmark tour. Please try again.",
        variant: "destructive"
      });
    }
  };

  const convertPrice = (price) => {
    if (!price) return currencies[currency].symbol + "0.00";
    const convertedPrice = price * currencies[currency].rate;
    return `${currencies[currency].symbol}${convertedPrice.toFixed(2)}`;
  };

  const filterItineraries = () => {
    let filtered = [...itineraries];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(itinerary => 
        itinerary.name?.toLowerCase().includes(query) ||
        itinerary.description?.toLowerCase().includes(query) ||
        itinerary.language?.toLowerCase().includes(query)
      );
    }

    if (selectedPreference && selectedPreference !== 'all') {
      filtered = filtered.filter(itinerary => 
        itinerary.preferences?.includes(selectedPreference)
      );
    }

    if (selectedLanguage && selectedLanguage !== 'all') {
      filtered = filtered.filter(itinerary => 
        itinerary.language === selectedLanguage
      );
    }

    filtered = filtered.filter(itinerary => {
      const price = typeof itinerary.price === 'string' 
        ? parseFloat(itinerary.price.replace(/[^0-9.-]+/g, ""))
        : itinerary.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (sortBy !== 'default') {
      filtered.sort((a, b) => {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        const ratingA = a.ratings?.averageRating || 0;
        const ratingB = b.ratings?.averageRating || 0;

        switch (sortBy) {
          case 'price-low':
            return priceA - priceB;
          case 'price-high':
            return priceB - priceA;
          case 'rating-high':
            return ratingB - ratingA;
          case 'rating-low':
            return ratingA - ratingB;
          default:
            return 0;
        }
      });
    }

    return filtered;
  };

  const filteredItineraries = filterItineraries();

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
          
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Input
                type="search"
                placeholder="Search itineraries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              <Select value={selectedPreference} onValueChange={setSelectedPreference}>
                <SelectTrigger className="border-2 border-black">
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Preferences</SelectItem>
                  {["Historic Areas", "Beaches", "Family-Friendly", "Shopping", "Nature", "Cultural", "Adventure", "Relaxation"].map((pref) => (
                    <SelectItem key={pref} value={pref}>
                      {pref}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="border-2 border-black">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {["English", "Arabic", "French", "Spanish", "German", "Italian"].map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-2 border-black">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating-high">Rating: High to Low</SelectItem>
                  <SelectItem value="rating-low">Rating: Low to High</SelectItem>
                </SelectContent>
              </Select>

              <div>
                <div className="text-sm text-muted-foreground mb-2">
                  Price Range: {currencies[currency].symbol}{convertPrice(priceRange[0])} - {currencies[currency].symbol}{convertPrice(priceRange[1])}
                </div>
                <Slider
                  min={0}
                  max={maxPrice}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="w-full"
                />
              </div>
            </div>
          </div>
         
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItineraries.map((itinerary) => (
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
                    onError={(e) => {
                      e.target.src = '/placeholder-tour.jpg';
                    }}
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/80 backdrop-blur-sm hover:bg-white"
                      onClick={(e) => handleBookmark(e, itinerary._id)}
                    >
                      {bookmarkedTours.has(itinerary._id) ? (
                        <BookmarkCheck className="h-5 w-5 text-yellow-500 fill-current" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/80 backdrop-blur-sm hover:bg-white"
                      onClick={(e) => handleShare(e, itinerary)}
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
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
                    {isLoggedIn && isTourist && (
                      <Button 
                        className={`w-full ${bookedItineraries.has(itinerary._id) ? 'bg-red-500 hover:bg-red-600' : ''}`}
                        onClick={(e) => handleBookNow(itinerary._id, e)}
                      >
                        {bookedItineraries.has(itinerary._id) ? 'Cancel Booking' : 'Book Now'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      {isShareModalOpen && selectedItem && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={selectedItem.type || "Item"} // "Activity" or "Itinerary"
          url={`${window.location.origin}/tours/${selectedItem._id}`}
        />
      )}
      <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Tour Date</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a date" />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {format(new Date(date), 'MMMM d, yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDateDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleDateConfirm} disabled={!selectedDate}>
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tours;