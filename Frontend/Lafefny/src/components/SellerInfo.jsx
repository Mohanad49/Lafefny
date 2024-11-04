/* eslint-disable react-hooks/exhaustive-deps */
import  { useState, useEffect } from "react";

const SellerInfo = () => {
  const [SellerData, setSellerData] = useState(null); // State for tour guide data
  const [error, setError] = useState(""); // State for error handling

  // Fetch tour guide info when the component mounts
  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const response = await fetch(`http://localhost:8000/seller/getSeller/${localStorage.getItem("userID")}`);
        if (!response.ok) {
          throw new Error("seller not found");
        }
        const data = await response.json();
        setSellerData(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchSeller();
  }, [localStorage.getItem("userID")]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!SellerData) {
    return <p>Loading seller information...</p>;
  }

  return (
    <div>
      <h2>Seller Information</h2>
      {SellerData.length > 0 ? (
        <>
          <p><strong>name:</strong> {setSellerData[0].name}</p>
          <p><strong> description:</strong> {setSellerData[0].description}</p>
          
        </>
      ) : (
        <p>No seller information found.</p>
      )}
    </div>
  );
};

export default SellerInfo;
