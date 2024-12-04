/* eslint-disable no-unused-vars */
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
    Camera,
    Share2
  } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrency, currencies } from '../context/CurrencyContext';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import ShareModal from "@/components/ui/share-modal";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [maxPrice, setMaxPrice] = useState(1000); // Default max price in base currency
  const [categories, setCategories] = useState([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem('userID');

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/activityCategory');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [activitiesResponse, categoriesResponse] = await Promise.all([
          axios.get('http://localhost:8000/activities'),
          axios.get('http://localhost:8000/activityCategory')
        ]);
        
        setActivities(activitiesResponse.data);
        setCategories(categoriesResponse.data);
        
        // Set max price based on highest activity price
        const highestPrice = Math.max(...activitiesResponse.data.map(a => 
          typeof a.price === 'string' ? 
            parseFloat(a.price.replace(/[^0-9.-]+/g, "")) : 
            a.price || 0
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

    fetchData();
  }, []);

  const handleActivityClick = (activityId) => {
    navigate(`/activities/${activityId}`);
  };

  const handleBookNow = (activityId) => {
    const touristId = localStorage.getItem('userID');
    navigate(`/tourist/payment`, { state: { touristId, activityId } });
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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState("default");
  const [selectedDate, setSelectedDate] = useState("");
  const filterActivities = () => {
    let filtered = [...activities];
  
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.name?.toLowerCase().includes(query) ||
        activity.description?.toLowerCase().includes(query) ||
        activity.category?.toLowerCase().includes(query)
      );
    }
  
    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(activity => activity.category === selectedCategory);
    }
  
    // Rating filter
    if (selectedRating && selectedRating !== 'all') {
      const minRating = parseFloat(selectedRating);
      filtered = filtered.filter(activity => 
        (activity.ratings?.averageRating || 0) >= minRating
      );
    }
  
    // Price range filter - convert price range to base currency for comparison
    const minPriceBase = convertPrice(priceRange[0], true);
    const maxPriceBase = convertPrice(priceRange[1], true);
    
    filtered = filtered.filter(activity => {
      const price = typeof activity.price === 'string' 
        ? parseFloat(activity.price.replace(/[^0-9.-]+/g, ""))
        : activity.price;
      return price >= minPriceBase && price <= maxPriceBase;
    });
  
    // Sorting
    if (sortBy !== 'default') {
      filtered.sort((a, b) => {
        const priceA = convertPrice(a.price);
        const priceB = convertPrice(b.price);
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
  const filteredActivities = filterActivities();

  const handleShare = (event, item) => {
    event.stopPropagation();
    setSelectedItem(item);
    setIsShareModalOpen(true);
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

          {/* Filters and Search Section */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Input
                type="search"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-2 border-black">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="border-2 border-black">
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
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
                  Price Range: {currencies[currency].symbol}{convertPrice(priceRange[0]).toFixed(2)} - {currencies[currency].symbol}{convertPrice(priceRange[1]).toFixed(2)}
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
          {/* Results count */}
          <div className="mb-6 text-secondary">
            {filteredActivities.length} activities found
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActivities.map((activity) => (
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                    onClick={(e) => handleShare(e, activity)}
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
                        <div className="text-lg font-semibold text-primary">{currencies[currency].symbol}{convertPrice(activity.price).toFixed(2)}</div>
                        <div className="text-sm text-primary">per person</div>
                      </div>
                    </div>
                    {isLoggedIn && (
                      <Button className="w-full" onClick={(e) => { e.stopPropagation(); handleBookNow(activity._id); }}>Book Now</Button>
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
          url={`${window.location.origin}/activities/${selectedItem._id}`}
        />
      )}
    </div>
  );
};

export default Activities;