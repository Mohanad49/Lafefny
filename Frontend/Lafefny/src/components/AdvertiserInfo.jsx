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
    <div>
      <h2>Advertiser Information</h2>
      <div>
        <p><strong>Company:</strong> {advertiserData.company || 'Not provided'}</p>
        <p><strong>Hotline:</strong> {advertiserData.hotline || 'Not provided'}</p>
        <p><strong>Website:</strong> {advertiserData.website || 'Not provided'}</p>
        {advertiserData.logo && (
          <div>
            <strong>Logo:</strong>
            <img src={advertiserData.logo} alt="Company Logo" style={{maxWidth: '200px'}} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvertiserInfo;
