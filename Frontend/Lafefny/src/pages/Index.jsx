/* eslint-disable no-unused-vars */
import { ArrowRight, Check, ChevronDown, Map, Calendar, Compass, UserPlus } from "lucide-react";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
const Index = () => {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 lg:px-8 py-24 sm:py-32">
          <div className="relative mx-auto max-w-7xl">
            {/* Hero Image with Overlay */}
            <div className="relative">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1469474968028-56623f02e42e"
                  alt="Beautiful mountain landscape"
                  className="rounded-3xl shadow-2xl w-full h-[600px] object-cover"
                />
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40 rounded-3xl" />
              </div>
              
              {/* Centered content over the image */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 text-center">
                  Discover the world&apos;s most
                  <br />
                  <span className="bg-gradient-to-r from-[#9EE755] to-[#CFDD3C] bg-clip-text text-transparent">
                    amazing destinations
                  </span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg mb-8 text-center text-white/90">
                  Experience unforgettable journeys and create lasting memories with our curated travel experiences.
                </p>
                <div className="flex justify-center gap-4">
                  <button className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors" onClick={() => navigate('/sign')}>
                    Plan Your Trip
                  </button>
                  <button className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors flex items-center gap-2 text-white" onClick={() => navigate('/destinations')}>
                    View Destinations <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-surface px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-center mb-16">Why Travel With Us</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Expert Local Guides",
                  description: "Experience destinations through the eyes of knowledgeable local experts",
                  icon: "🌟",
                },
                {
                  title: "Curated Experiences",
                  description: "Handpicked destinations and activities for unforgettable memories",
                  icon: "✨",
                },
                {
                  title: "24/7 Support",
                  description: "Round-the-clock assistance throughout your journey",
                  icon: "🌍",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-background border border-border hover:border-accent transition-colors"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Plan Your Trip Section */}
        <section className="py-24 px-6 lg:px-8 bg-background">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-center mb-4">How to Plan Your Trip</h2>
            <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              Follow these simple steps to create your perfect travel experience
            </p>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  title: "Choose Destination",
                  description: "Browse our curated selection of stunning destinations worldwide",
                  icon: Map,
                  color: "bg-blue-100",
                  iconColor: "text-blue-600",
                },
                {
                  title: "Set Your Dates",
                  description: "Pick your preferred travel dates and check availability",
                  icon: Calendar,
                  color: "bg-green-100",
                  iconColor: "text-green-600",
                },
                {
                  title: "Explore Activities",
                  description: "Discover and select from exciting local experiences",
                  icon: Compass,
                  color: "bg-purple-100",
                  iconColor: "text-purple-600",
                },
                {
                  title: "Create Account",
                  description: "Sign up to save your trip and get personalized recommendations",
                  icon: UserPlus,
                  color: "bg-orange-100",
                  iconColor: "text-orange-600",
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="relative p-6 rounded-2xl bg-white border border-border hover:border-accent transition-all hover:shadow-lg"
                >
                  <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center mb-4`}>
                    <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                  </div>
                  <div className="absolute -top-3 left-6 bg-primary text-white text-sm px-2 py-1 rounded-full">
                    Step {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-16">Common Travel Questions</h2>
            <div className="space-y-4">
              {[
                {
                  question: "How do I book a trip?",
                  answer: "Simply browse our destinations, select your preferred package, and follow the booking process. Our team will assist you every step of the way.",
                },
                {
                  question: "What's included in the packages?",
                  answer: "Our packages typically include accommodation, guided tours, and selected meals. Each package details what's included.",
                },
                {
                  question: "Do I need travel insurance?",
                  answer: "We strongly recommend travel insurance for all our trips to ensure you're covered for any unexpected events.",
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="border border-border rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-background/50"
                    onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                  >
                    <span className="font-medium">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        activeAccordion === index ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeAccordion === index && (
                    <div className="px-6 py-4 bg-background/50">
                      <p className="text-gray-60">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
        


        {/* CTA Section */}
        <section className="py-24 bg-primary text-white px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-8">Ready for your next adventure?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of travelers who have already discovered their dream destinations with us.
            </p>
            <button onClick={()=>{navigate("/sign")}} className="px-8 py-4 bg-accent text-primary rounded-full font-semibold hover:bg-gradient-to-r from-[#9EE755] to-[#CFDD3C] hover:text-black transition-all">
              Start Planning
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
