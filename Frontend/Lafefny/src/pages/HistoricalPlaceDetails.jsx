import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Tag, Star, History } from "lucide-react";
import { getMuseumById } from '../services/museumService';

const HistoricalPlaceDetails = () => {
  const { id } = useParams();
  
  const { data: museum, isLoading, error } = useQuery({
    queryKey: ["museum", id],
    queryFn: () => getMuseumById(id).then(res => res.data),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-pulse text-secondary">Loading...</div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-red-500">Error loading museum details</div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hero Section */}
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-6">
                  <History className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-primary">{museum.name}</h1>
                <div className="flex items-center space-x-4 text-primary">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    {museum.location}
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-400" />
                    {museum.rating}
                  </div>
                </div>
              </div>
              {/* Image Gallery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {museum.pictures?.length > 0 ? (
                  museum.pictures.map((pic, index) => (
                    <div key={index} className="relative h-64 rounded-xl overflow-hidden">
                      <img
                        src={pic}
                        alt={`${museum.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))
                ) : (
                  <div className="relative h-64 rounded-xl overflow-hidden">
                    <img
                      src="https://via.placeholder.com/400x300"
                      alt="Placeholder"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              {/* Description */}
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">About</h2>
                <p className="text-primary leading-relaxed">{museum.description}</p>
              </Card>
              {/* Tags */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Categories & Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {museum.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-primary">
                      <Tag className="h-4 w-4 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <div className="space-y-6">
                  {/* Opening Hours */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Opening Hours
                    </h3>
                    <div className="space-y-2 text-primary">
                      <div className="flex justify-between">
                        <span>Hours:</span>
                        <span>{museum.openingHours}</span>
                      </div>
                    </div>
                  </div>
                  {/* Ticket Prices */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Ticket Prices</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                        <span className="text-primary">Foreign Visitors</span>
                        <span className="text-lg font-semibold">${museum.ticketPrices.foreigner}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                        <span className="text-primary">Local Residents</span>
                        <span className="text-lg font-semibold">${museum.ticketPrices.native}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                        <span className="text-primary">Students</span>
                        <span className="text-lg font-semibold">${museum.ticketPrices.student}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-primary space-y-2">
                    <p>• Prices are in USD</p>
                    <p>• Valid ID required for student discounts</p>
                    <p>• Children under 5 enter free</p>
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
export default HistoricalPlaceDetails;