import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Tag, Star, Info, Bookmark, BookmarkCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from 'axios';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useCurrency, currencies } from '../context/CurrencyContext';
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from 'lucide-react';

const ActivityDetails = () => {
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookedActivities, setBookedActivities] = useState(new Set());
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const isLoggedIn = !!localStorage.getItem('userID');
    const isTourist = localStorage.getItem('userRole') === 'Tourist';
    const isTourismGovernor = localStorage.getItem('userRole') === 'TourismGovernor';
    const touristId = localStorage.getItem('userID');

    const getActivityDetails = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8000/activities/${id}`);
            const updatedActivity = {
                ...response.data,
                booked: response.data.paidBy?.includes(touristId),
            };
            setActivity(updatedActivity);
            if (updatedActivity.booked) {
                setBookedActivities(new Set([updatedActivity._id]));
            }
            setLoading(false);
            checkIfBookmarked(response.data._id);
        } catch (error) {
            console.error('Error fetching activity:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    const checkIfBookmarked = async (activityId) => {
        if (!isLoggedIn || !isTourist) return;
        
        try {
            const userId = localStorage.getItem('userID');
            const response = await axios.get(`http://localhost:8000/tourist/${userId}/bookmarked-activities`);
            const bookmarkedIds = new Set(response.data.map(activity => activity._id));
            setIsBookmarked(bookmarkedIds.has(activityId));
        } catch (error) {
            console.error('Error checking bookmark status:', error);
        }
    };

    const handleBookmark = async () => {
        if (!isLoggedIn || !isTourist) {
            toast({
                title: "Authentication Required",
                description: "Please log in as a tourist to bookmark activities.",
                variant: "destructive"
            });
            return;
        }

        try {
            const userId = localStorage.getItem('userID');
            const response = await axios.post(
                `http://localhost:8000/tourist/${userId}/bookmark-activity/${activity._id}`
            );

            setIsBookmarked(response.data.isBookmarked);
            toast({
                title: response.data.isBookmarked ? "Activity Bookmarked" : "Bookmark Removed",
                description: response.data.isBookmarked 
                    ? "Activity has been added to your bookmarks."
                    : "Activity has been removed from your bookmarks.",
            });
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            toast({
                title: "Error",
                description: "Failed to update bookmark. Please try again.",
                variant: "destructive"
            });
        }
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), 'MMMM d, yyyy');
    };

    const checkIfCanCancel = (activityDate) => {
        const today = new Date();
        const activityDateTime = new Date(activityDate);
        
        today.setHours(0, 0, 0, 0);
        activityDateTime.setHours(0, 0, 0, 0);
        
        const diffTime = activityDateTime.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays >= 2;
    };

    const handleBookingClick = async () => {
        if (!isLoggedIn) {
            navigate('/sign');
            return;
        }

        try {
            const touristId = localStorage.getItem('userID');
            if (activity.booked) {
                // Handle cancellation
                if (!checkIfCanCancel(activity.date)) {
                    toast({
                        variant: "destructive",
                        title: "Cancellation Failed",
                        description: "Cancellation is not allowed less than 2 days before the booked date."
                    });
                    return;
                }
                const response = await axios.post(`http://localhost:8000/activities/${activity._id}/cancel`, { touristId });
                setActivity(prev => ({ ...prev, booked: false }));
                setBookedActivities(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(activity._id);
                    return newSet;
                });
                toast({
                    title: "Booking Cancelled Successfully!",
                    description: `Remaining balance: ${response.data.remainingBalance} EGP`
                });
            } else {
                // Handle booking
                await axios.post(`http://localhost:8000/activities/${activity._id}/book`, { touristId });
                setActivity(prev => ({ ...prev, booked: true }));
                setBookedActivities(prev => {
                    const newSet = new Set(prev);
                    newSet.add(activity._id);
                    return newSet;
                });
                navigate(`/tourist/payment`, { state: { touristId, activityId: activity._id } });
            }
        } catch (error) {
            console.error("Error handling booking:", error);
            toast({
                variant: "destructive",
                title: error.response?.data?.error || (activity.booked ? "Failed to cancel the booking." : "Failed to book the activity."),
                description: "Please try again later."
            });
        }
    };

    const { currency } = useCurrency();
    
    const convertPrice = (price, reverse = false) => {
        if (!price) return 0;
        const numericPrice = typeof price === 'string' ? 
            parseFloat(price.replace(/[^0-9.-]+/g, "")) : 
            parseFloat(price);
            
        if (reverse) {
            return numericPrice / currencies[currency].rate;
        }
        const convertedPrice = numericPrice * currencies[currency].rate;
        return convertedPrice;
    };

    useEffect(() => {
        getActivityDetails(id);
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!activity) return <div>Activity not found</div>;
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
                                    src={activity.image || "https://via.placeholder.com/800x400"}
                                    alt={activity.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4">
                                    <Badge variant="secondary" className="bg-accent text-primary font-semibold">
                                        {activity.category}
                                    </Badge>
                                </div>
                            </div>
                            {/* Activity Details */}
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-4xl font-bold text-primary mb-4">{activity.name}</h1>
                                    <div className="flex flex-wrap gap-4 text-primary">
                                        <div className="flex items-center">
                                            <MapPin className="h-5 w-5 mr-2" />
                                            {activity.location}
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="h-5 w-5 mr-2" />
                                            {formatDate(activity.date)}
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="h-5 w-5 mr-2" />
                                            {activity.time}
                                        </div>
                                        <div className="flex items-center">
                                            <Star className="h-5 w-5 mr-2 text-yellow-400" />
                                            {activity.ratings.averageRating.toFixed(1)} ({activity.ratings.totalRatings} reviews)
                                        </div>
                                    </div>
                                </div>
                                {activity.description && (
                                    <div className="prose max-w-none">
                                        <p className="text-primary text-lg">{activity.description}</p>
                                    </div>
                                )}
                                {/* Highlights */}
                                {activity.highlights && activity.highlights.length > 0 && (
                                    <Card className="p-6">
                                        <h3 className="text-xl font-semibold mb-4">Highlights</h3>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {activity.highlights.map((highlight, index) => (
                                                <li key={index} className="flex items-start">
                                                    <Info className="h-5 w-5 mr-2 text-primary shrink-0" />
                                                    <span className="text-primary">{highlight}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                )}
                                {/* Tags */}
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {activity.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="text-primary">
                                                <Tag className="h-4 w-4 mr-1" />
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                {/* Reviews */}
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">Reviews</h3>
                                    <ScrollArea className="h-[300px]">
                                        <div className="space-y-4">
                                            {activity.ratings.reviews.map((review, index) => (
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
                                        <span className="text-2xl font-bold">{currencies[currency].symbol}{convertPrice(activity.price).toFixed(2)}</span>
                                        <Badge
                                            variant={activity.bookingOpen ? "default" : "secondary"}
                                            className={activity.bookingOpen ? "bg-green-500" : "bg-red-500"}
                                        >
                                            {activity.bookingOpen ? "Booking Open" : "Booking Closed"}
                                        </Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        {isTourist && (
                                            <Button
                                                className={`flex-1 ${activity.booked ? 'bg-red-500 hover:bg-red-600' : ''}`}
                                                onClick={handleBookingClick}
                                                disabled={!activity.bookingOpen}
                                            >
                                                {activity.booked ? 'Cancel Booking' : 'Book Now'}
                                            </Button>
                                        )}
                                        {(!isLoggedIn || (!isTourist && !isTourismGovernor)) && (
                                            <Button
                                                className="flex-1"
                                                onClick={() => navigate('/login')}
                                            >
                                                Login to Book
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={handleBookmark}
                                            className={`${isBookmarked ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-500 hover:text-gray-600'}`}
                                        >
                                            {isBookmarked ? (
                                                <BookmarkCheck className="h-5 w-5 fill-current" />
                                            ) : (
                                                <Bookmark className="h-5 w-5" />
                                            )}
                                        </Button>
                                    </div>
                                    {activity.specialDiscounts && (
                                        <div className="bg-accent/10 p-4 rounded-lg">
                                            <p className="text-sm font-medium text-primary">
                                                Special Offer: {activity.specialDiscounts}
                                            </p>
                                        </div>
                                    )}                                   
                                    <div className="text-sm text-primary">
                                        <p>• Instant confirmation</p>
                                        <p>• Free cancellation up to 24 hours before</p>
                                        <p>• Mobile tickets accepted</p>
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
export default ActivityDetails;