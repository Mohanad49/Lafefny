import { Link } from "react-router-dom";
import { useState } from "react"; // Add this import

const Footer = () => {
  const [showTerms, setShowTerms] = useState(false); // Add state for modal

  const toggleTermsModal = () => {
    setShowTerms(!showTerms);
  };

  const footerSections = [
    {
      title: "Destinations",
      links: [
        { name: "Popular", to: "/destinations" },
        { name: "Adventure", to: "/destinations" },
        { name: "Beach", to: "/destinations" },
        { name: "Cultural", to: "/destinations" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", to: "/about" },
        { name: "Blog", to: "/about" },
        { name: "Reviews", to: "/about" },
        { name: "Contact", to: "/about" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", to: "https://www.who.int/health-topics/travel-and-health" },
        { name: "Safety", to: "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/travel-advice" },
        { name: "Booking", to: "https://www.who.int/travel-advice" },
        { name: "COVID-19", to: "https://www.who.int/emergencies/diseases/novel-coronavirus-2019" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy", onClick: toggleTermsModal },
        { name: "Terms", onClick: toggleTermsModal },
        { name: "Insurance", onClick: toggleTermsModal },
        { name: "Cancellation", onClick: toggleTermsModal }
      ]
    }
  ];

  return (
    <>
      <footer className="bg-primary text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      {section.title === "Support" ? (
                        <a
                          href={link.to}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/70 hover:text-white transition-colors"
                        >
                          {link.name}
                        </a>
                      ) : section.title === "Legal" ? (
                        <button
                          onClick={link.onClick}
                          className="text-white/70 hover:text-white transition-colors"
                        >
                          {link.name}
                        </button>
                      ) : (
                        <Link
                          to={link.to}
                          className="text-white/70 hover:text-white transition-colors"
                        >
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/70 text-sm">
              © 2024 Lafefny. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link to="#" className="text-white/70 hover:text-white transition-colors">
                Instagram
              </Link>
              <Link to="#" className="text-white/70 hover:text-white transition-colors">
                Facebook
              </Link>
              <Link to="#" className="text-white/70 hover:text-white transition-colors">
                Twitter
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Terms and Conditions</h2>
              <button 
                onClick={toggleTermsModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &#10006;
              </button>
            </div>
            <div className="prose prose-sm">
              <ol className="space-y-4">
                <li><strong>Booking Confirmation:</strong> Your booking will be confirmed once you receive a confirmation email from us.</li>
                <li><strong>Payment:</strong> Full payment must be made at the time of booking unless stated otherwise.</li>
                <li><strong>Cancellation Policy:</strong> Cancellations made within 48 hours of the trip will incur a 100% cancellation fee.</li>
                <li><strong>Changes to Bookings:</strong> Any changes to bookings must be requested via email and are subject to availability.</li>
                <li><strong>Travel Insurance:</strong> We recommend that all travelers obtain comprehensive travel insurance.</li>
                <li><strong>Conduct:</strong> All guests are expected to behave respectfully towards other guests and staff.</li>
                <li><strong>Liability:</strong> Our company is not liable for any injuries, losses, or damages incurred during your trip.</li>
                <li><strong>Governing Law:</strong> These terms are governed by the laws of [Your Country/Region].</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;