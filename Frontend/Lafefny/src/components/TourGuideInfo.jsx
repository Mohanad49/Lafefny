/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const TourGuideInfo = () => {
  const [tourGuideData, setTourGuideData] = useState(null); // State for tour guide data
  const [error, setError] = useState(""); // State for error handling
  const navigate = useNavigate();

  // Fetch tour guide info when the component mounts
  useEffect(() => {
    const fetchTourGuide = async () => {
      try {
        const response = await fetch(`http://localhost:8000/tourGuide/getTourGuide/${localStorage.getItem("userID")}`);
        if (!response.ok) {
          throw new Error("Tour guide not found");
        }
        const data = await response.json();
        setTourGuideData(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchTourGuide();
  }, [localStorage.getItem("userID")]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!tourGuideData) {
    return <p>Loading tour guide information...</p>;
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
                Tour Guide Information
            </h2>
            
            {tourGuideData.length > 0 ? (
                <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                        <p className="text-gray-700">
                            <span className="font-semibold">Mobile:</span>{''}
                            <span className="ml-2">{tourGuideData[0].mobile}</span>
                        </p>
                        <p className="text-gray-700">
                            <span className="font-semibold">Years of Experience:</span>{''}
                            <span className="ml-2">{tourGuideData[0].yearsOfExperience}</span>
                        </p>
                        <p className="text-gray-700">
                            <span className="font-semibold">Previous Work:</span>{''}
                            <span className="ml-2">{tourGuideData[0].previousWork}</span>
                        </p>
                    </div>
                    {tourGuideData[0].picture && (
                    <div className="mt-6">
                        <p className="font-semibold text-gray-700 mb-2">Picture:</p>
                        <div className="border rounded-lg overflow-hidden">
                            <img 
                                src={tourGuideData[0].picture} 
                                alt="Tour Guide Picture" 
                                className="w-full h-auto object-contain max-h-48"
                            />
                        </div>
                    </div>
                )}
                </div>
            ) : (
                <p className="text-center text-gray-500">No tour guide information found.</p>
            )}
        </div>
    </div>
  );
};

export default TourGuideInfo;
