import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdvertiserInfo = () => {
  const [advertiserData, setAdvertiserData] = useState(null); // State for advertiser data
  const [error, setError] = useState(""); // State for error handling
  const navigate = useNavigate();

  // Fetch advertiser info when the component mounts
  useEffect(() => {
    const fetchAdvertiser = async () => {
      try {
        const response = await fetch(`http://localhost:8000/advertiser/getAdvertiser/${localStorage.getItem("userID")}`);
        if (!response.ok) {
          throw new Error("Advertiser not found");
        }
        const data = await response.json();
        // Take first item since API returns array
        setAdvertiserData(data[0]);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchAdvertiser();
  }, []); // Remove dependency that causes re-renders

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!advertiserData) {
    return <p>Loading advertiser information...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Back Button */}
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="absolute top-4 left-4 flex items-center gap-2 hover:bg-accent/10"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Previous
        </Button>

        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                Advertiser Information
            </h2>
            <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                    <p className="text-gray-700">
                        <span className="font-semibold">Company:</span>{''}
                        <span className="ml-2">{advertiserData.company || 'Not provided'}</span>
                    </p>
                    <p className="text-gray-700">
                        <span className="font-semibold">Hotline:</span>{''}
                        <span className="ml-2">{advertiserData.hotline || 'Not provided'}</span>
                    </p>
                    <p className="text-gray-700">
                        <span className="font-semibold">Website:</span>{''}
                        <span className="ml-2">{advertiserData.website || 'Not provided'}</span>
                    </p>
                </div>
                
                {advertiserData.logo && (
                    <div className="mt-6">
                        <p className="font-semibold text-gray-700 mb-2">Logo:</p>
                        <div className="border rounded-lg overflow-hidden">
                            <img 
                                src={advertiserData.logo} 
                                alt="Company Logo" 
                                className="w-full h-auto object-contain max-h-48"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default AdvertiserInfo;
