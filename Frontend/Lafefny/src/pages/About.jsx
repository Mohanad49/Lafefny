import Navigation from "@/components/Navigation";
import { Plane } from "lucide-react";
const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-6">
            <Plane className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            About Lafefny
          </h1>
          <p className="text-primary text-lg max-w-2xl mx-auto">
            Your trusted companion for unforgettable travel experiences
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Our Story</h2>
            <p className="text-primary leading-relaxed">
              Founded with a passion for exploration and cultural connection, Lafefny has been helping travelers discover the world&apos;s most remarkable destinations since 2020. Our name, derived from Arabic, means &ldquo;embrace me&rdquo; – reflecting our commitment to embracing new experiences and cultures.
            </p>
            <p className="text-primary leading-relaxed">
              We believe travel has the power to transform perspectives, create lasting memories, and build bridges between cultures. Our team of experienced travel enthusiasts works tirelessly to curate exceptional journeys that cater to every type of adventurer.
            </p>
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Our Mission</h2>
            <p className="text-primary leading-relaxed">
              At Lafefny, we&apos;re dedicated to making travel accessible, sustainable, and enriching. We partner with local communities and experts to provide authentic experiences while ensuring responsible tourism practices.
            </p>
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="p-6 bg-surface rounded-xl border border-border">
                <h3 className="font-semibold mb-2">200+</h3>
                <p className="text-primary text-sm">Destinations</p>
              </div>
              <div className="p-6 bg-surface rounded-xl border border-border">
                <h3 className="font-semibold mb-2">10k+</h3>
                <p className="text-primary text-sm">Happy Travelers</p>
              </div>
              <div className="p-6 bg-surface rounded-xl border border-border">
                <h3 className="font-semibold mb-2">50+</h3>
                <p className="text-primary text-sm">Local Partners</p>
              </div>
              <div className="p-6 bg-surface rounded-xl border border-border">
                <h3 className="font-semibold mb-2">24/7</h3>
                <p className="text-primary text-sm">Support</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default About;