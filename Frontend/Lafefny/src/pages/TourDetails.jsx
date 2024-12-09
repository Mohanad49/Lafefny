// TourDetails.jsx
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Star, Info, Users, Bookmark, BookmarkCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from 'react';
import { getItineraryById } from '../services/itineraryService';
import { useCurrency, currencies } from '../context/CurrencyContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from 'lucide-react';

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('userID');
  const isTourist = localStorage.getItem('userRole') === 'Tourist';
  const { currency } = useCurrency();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [bookedTours, setBookedTours] = useState(new Set());
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();

  const checkIfBookmarked = async (touristId, tourId) => {
    try {
      const response = await axios.get(`http://localhost:8000/tourist/${touristId}/bookmarked-tours`);
      return response.data.some(tour => tour._id === tourId);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  };

  const getTourDetails = async (id) => {
    try {
      const response = await getItineraryById(id);
      const touristId = localStorage.getItem('userID');
      const updatedTour = {
        ...response.data,
        booked: response.data.paidBy?.includes(touristId),
      };
      setTour(updatedTour);
      if (updatedTour.booked) {
        setBookedTours(new Set([updatedTour._id]));
      }
      
      if (isLoggedIn && isTourist) {
        const bookmarked = await checkIfBookmarked(touristId, id);
        setIsBookmarked(bookmarked);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tour:', error);
      setError('Error fetching tour details');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const checkIfCanCancel = (tourDate) => {
    const today = new Date();
    const tourDateTime = new Date(tourDate);
    
    today.setHours(0, 0, 0, 0);
    tourDateTime.setHours(0, 0, 0, 0);
    
    const diffTime = tourDateTime.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 2;
  };

  const handleNewBooking = async () => {
    if (!isLoggedIn) {
      navigate('/sign');
      return;
    }
  
    try {
      const touristId = localStorage.getItem('userID');
      const response = await axios.get(`http://localhost:8000/itineraries/${tour._id}/availableDates`);
      const dates = response.data.availableDates.map(date => format(new Date(date), 'yyyy-MM-dd'));
      setAvailableDates(dates);
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
  
  const handleCancelBooking = async () => {
    if (!isLoggedIn) {
      navigate('/sign');
      return;
    }
  
    try {
      const touristId = localStorage.getItem('userID');
      const booking = tour.touristBookings.find(b => b.tourist.toString() === touristId.toString());
      if (!booking || !checkIfCanCancel(booking.bookedDate)) {
        toast({
          variant: "destructive",
          title: "Cancellation Failed",
          description: "Cancellation is not allowed less than 2 days before the booked date."
        });
        return;
      }
      const response = await axios.post(`http://localhost:8000/itineraries/${tour._id}/cancel`, { userId: touristId });
      setTour(prev => ({ ...prev, booked: false }));
      setBookedTours(prev => {
        const newSet = new Set(prev);
        newSet.delete(tour._id);
        return newSet;
      });
      toast({
        title: "Booking Cancelled Successfully!",
        description: `Remaining balance: ${response.data.newWalletBalance} EGP`
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        variant: "destructive",
        title: "Failed to cancel the booking.",
        description: "Please try again later."
      });
    }
  };
  
  const handleBookingClick = async () => {
    if (tour.booked) {
      await handleCancelBooking();
    } else {
      await handleNewBooking();
    }
  };

  const handleBookmark = async () => {
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
        `http://localhost:8000/tourist/${userId}/bookmark-tour/${tour._id}`
      );

      setIsBookmarked(response.data.isBookmarked);
      toast({
        title: response.data.isBookmarked ? "Tour Bookmarked" : "Bookmark Removed",
        description: response.data.message,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to bookmark tour. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDateConfirm = async () => {
    if (!selectedDate) {
      toast({
        variant: "destructive",
        title: "Date Selection Required",
        description: "Please select a date to book the tour."
      });
      return;
    }

    try {
      const touristId = localStorage.getItem('userID');
      await axios.post(`http://localhost:8000/itineraries/${tour._id}/book`, { userId: touristId, selectedDate });
      setTour(prev => ({ ...prev, booked: true }));
      setBookedTours(prev => {
        const newSet = new Set(prev);
        newSet.add(tour._id);
        return newSet;
      });
      
      navigate(`/tourist/AllPay`, { state: { touristId, itineraryId: tour._id, selectedDate } });
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: "An error occurred while confirming your booking. Please try again."
      });
    } finally {
      setIsDateDialogOpen(false);
      setSelectedDate("");
    }
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
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
        <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4 md:mb-0 hover:translate-x-1 transition-transform"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
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
                    <h3 className="text-xl font-semibold mb-4">What's Included</h3>
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

                  {/* Inside the Card in the sidebar */}
                  <div className="flex flex-col gap-4">
                    {isTourist ? (
                      <div className="flex gap-4">
                        <Button 
                          className={`flex-1 ${tour.booked ? 'bg-red-500 hover:bg-red-600' : ''}`}
                          onClick={handleBookingClick}
                        >
                          {tour.booked ? 'Cancel Booking' : 'Book Now'}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-12"
                          onClick={handleBookmark}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="h-5 w-5 text-yellow-500 fill-current" />
                          ) : (
                            <Bookmark className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    ) : !isLoggedIn ? (
                      <div className="flex gap-4">
                        <Button 
                          className="flex-1"
                          onClick={() => navigate('/sign')}
                        >
                          Sign in to book
                        </Button>
                        <div className="w-12" /> {/* Spacer to maintain layout */}
                      </div>
                    ) : (
                      <div className="h-1" /> /* Empty space for other logged-in user types */
                    )}
                  </div>

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

export default TourDetails;