/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";

const AdvertiserInfo = () => {
  const [advertiserData, setAdvertiserData] = useState(null); // State for advertiser data
  const [error, setError] = useState(""); // State for error handling

  // Fetch advertiser info when the component mounts
  useEffect(() => {
    const fetchAdvertiser = async () => {
      try {
        const response = await fetch(`http://localhost:8000/advertiser/getAdvertiser/${localStorage.getItem("userID")}`);
        if (!response.ok) {
          throw new Error("Advertiser not found");
        }
        const data = await response.json();
        setAdvertiserData(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchAdvertiser();
  }, [localStorage.getItem("userID")]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!advertiserData) {
    return <p>Loading advertiser information...</p>;
  }

  return (
    <div>
      <h2>Advertiser Information</h2>
      <p><strong>Hotline:</strong> {advertiserData.hotline}</p>
      <p><strong>Company:</strong> {advertiserData.company}</p>
      <p><strong>Website:</strong> {advertiserData.website}</p>
    </div>
  );
};

export default AdvertiserInfo;
