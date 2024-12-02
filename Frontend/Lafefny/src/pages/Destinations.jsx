import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
const destinations = [
  {
    name: "Santorini, Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff",
    description: "Experience the stunning white architecture and breathtaking sunsets",
    price: "From $1,299",
    rating: 4.9,
  },
  {
    name: "Bali, Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
    description: "Discover tropical paradise with rich culture and pristine beaches",
    price: "From $899",
    rating: 4.8,
  },
  {
    name: "Machu Picchu, Peru",
    image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1",
    description: "Explore the ancient Incan citadel in the Andes Mountains",
    price: "From $1,499",
    rating: 4.9,
  },
  {
    name: "Tokyo, Japan",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
    description: "Immerse yourself in the perfect blend of tradition and modernity",
    price: "From $1,199",
    rating: 4.7,
  },
  {
    name: "Dubai, UAE",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
    description: "Experience luxury and innovation in this desert metropolis",
    price: "From $1,599",
    rating: 4.8,
  },
  {
    name: "Maldives",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8",
    description: "Relax in overwater villas surrounded by crystal clear waters",
    price: "From $2,299",
    rating: 4.9,
  }
];
const Destinations = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6">
              Popular Destinations
            </h1>
            <p className="text-primary text-lg max-w-2xl mx-auto">
              Explore our handpicked selection of stunning destinations around the world
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((destination, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-64">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-primary mb-2">{destination.name}</h3>
                      <div className="flex items-center text-primary">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{destination.name.split(',')[1]}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-primary font-semibold">{destination.price}</div>
                      <div className="text-primary text-sm">⭐ {destination.rating}</div>
                    </div>
                  </div>
                  <p className="text-primary text-sm">{destination.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default Destinations;