import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";


const SellerInfo = () => {
  const [sellerData, setSellerData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const response = await fetch(`http://localhost:8000/seller/getSeller/${localStorage.getItem("userID")}`);
        if (!response.ok) {
          throw new Error("Seller not found");
        }
        const data = await response.json();
        // Since the API returns an array, take the first item
        setSellerData(data[0]);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchSeller();
  }, []); // Remove dependency that causes re-renders

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!sellerData) {
    return <p>Loading seller information...</p>;
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
                Seller Information
            </h2>
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
        <p className="text-gray-700"><span className="font-semibold">Name:</span> {sellerData.name}</p> {""}
        <p className="text-gray-700"><span className="font-semibold">Description:</span> {sellerData.description}</p>{""}
        </div>
        {sellerData.logo && (
          <div className="mt-6">
            <p className="font-semibold text-gray-700 mb-2">Logo:</p>
            <div className="border rounded-lg overflow-hidden">
            <img src={sellerData.logo} className="w-full h-auto object-contain max-h-48" alt="Seller Logo" style={{maxWidth: '200px'}} />
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default SellerInfo;
