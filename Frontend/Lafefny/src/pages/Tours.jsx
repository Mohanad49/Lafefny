import { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Globe2, Star, MapPin, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrency, currencies } from '../context/CurrencyContext';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import ShareModal from "@/components/ui/share-modal";

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

  const preferences = [
    "Historic Areas",
    "Beaches",
    "Family-Friendly",
    "Shopping",
    "Nature",
    "Cultural",
    "Adventure",
    "Relaxation"
  ];

  const languages = [
    "English",
    "Arabic",
    "French",
    "Spanish",
    "German",
    "Italian"
  ];

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const response = await axios.get('http://localhost:8000/itineraries');
        setItineraries(response.data);
        
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

  const handleBookNow = (itineraryId) => {
    const touristId = localStorage.getItem('userID');
    navigate(`/tourist/AllPay`, { state: { touristId, itineraryId } });
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

  const handleShare = (event, item) => {
    event.stopPropagation();
    setSelectedItem(item);
    setIsShareModalOpen(true);
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
                  {preferences.map((pref) => (
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
                  {languages.map((lang) => (
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
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                    onClick={(e) => handleShare(e, itinerary)}
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
      {isShareModalOpen && selectedItem && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={selectedItem.type || "Item"} // "Activity" or "Itinerary"
          url={`${window.location.origin}/tours/${selectedItem._id}`}
        />
      )}
    </div>
  );
};

export default Tours;