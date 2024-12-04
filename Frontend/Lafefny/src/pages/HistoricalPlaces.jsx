import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { History, MapPin, Clock } from "lucide-react";
import axios from "axios";
import { useCurrency, currencies } from '../context/CurrencyContext';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllMuseumTags } from '../services/museumTagService';
import ShareModal from "@/components/ui/share-modal";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HistoricalPlaces = () => {
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [tags, setTags] = useState([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedMuseum, setSelectedMuseum] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMuseums = async () => {
      try {
        const response = await axios.get('http://localhost:8000/museums'); 
        setMuseums(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMuseums();
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const fetchedTags = await getAllMuseumTags();
        // Extract tag names from the fetched data
        const tagNames = fetchedTags.map(tag => tag.name);
        setTags(tagNames);
      } catch (err) {
        console.error('Error fetching tags:', err);
      }
    };

    fetchTags();
  }, []);

  const convertPrice = (price) => {
    if (!price) return currencies[currency].symbol + "0.00";
    const convertedPrice = price * currencies[currency].rate;
    return `${currencies[currency].symbol}${convertedPrice.toFixed(2)}`;
  };

  const filterMuseums = () => {
    let filtered = [...museums];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(museum => 
        museum.name?.toLowerCase().includes(query) ||
        museum.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tag filter
    if (selectedTag && selectedTag !== 'all') {
      filtered = filtered.filter(museum => 
        museum.tags?.includes(selectedTag)
      );
    }

    return filtered;
  };

  const handleShare = (event, museum) => {
    event.stopPropagation(); // Prevent card click
    setSelectedMuseum(museum);
    setIsShareModalOpen(true);
  };

  const handleCardClick = (museumId) => {
    navigate(`/historicalPlaces/${museumId}`);
  };

  const filteredMuseums = filterMuseums();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-6">
              <History className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6">
              Historical Places & Museums
            </h1>
            <p className="text-primary text-lg max-w-2xl mx-auto">
              Discover the world&apos;s most fascinating historical sites and cultural institutions
            </p>
          </div>

          {/* Filters and Search Section */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Input
                type="search"
                placeholder="Search museums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="border-2 border-black">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {tags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-6 text-secondary text-center">
            {filteredMuseums.length} museums found
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMuseums.map((museum) => (
              <Card 
                key={museum._id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => handleCardClick(museum._id)}
              >
                <div className="relative h-64">
                  <img
                    src={museum.pictures[0]} // Using first image from pictures array
                    alt={museum.name}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                    onClick={(e) => handleShare(e, museum)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-primary mb-2">{museum.name}</h3>
                      <div className="flex items-center text-primary mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{museum.location}</span>
                      </div>
                    </div>
                    
                    <p className="text-primary text-sm line-clamp-2">{museum.description}</p>
                    
                    <div className="flex items-center text-sm text-primary">
                      <Clock className="h-4 w-4 mr-2" />
                      {museum.openingHours}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center space-x-1">
                        <span className="text-primary font-medium">⭐</span>
                        <span className="font-medium">{museum.rating}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">{convertPrice(museum.ticketPrices.foreigner)}</div>
                        <div className="text-sm text-primary">per person</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      {isShareModalOpen && selectedMuseum && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title="Museum"
          url={`${window.location.origin}/historicalPlaces/${selectedMuseum._id}`}
        />
      )}
      <Footer />
    </div>
  );
};

export default HistoricalPlaces;