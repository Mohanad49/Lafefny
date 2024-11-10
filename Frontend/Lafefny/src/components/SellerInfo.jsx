/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";

const SellerInfo = () => {
  const [sellerData, setSellerData] = useState(null);
  const [error, setError] = useState("");

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
    <div>
      <h2>Seller Information</h2>
      <div>
        <p><strong>Name:</strong> {sellerData.name}</p>
        <p><strong>Description:</strong> {sellerData.description}</p>
        {sellerData.logo && (
          <div>
            <strong>Logo:</strong>
            <img src={sellerData.logo} alt="Seller Logo" style={{maxWidth: '200px'}} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerInfo;
