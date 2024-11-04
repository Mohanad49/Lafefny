/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";

const TouristInfo = () => {
  const [touristData, setTouristData] = useState(null); // State for storing tourist info
  const [error, setError] = useState(""); // State for handling errors

  // Fetch tourist info when the component mounts
  useEffect(() => {
    const fetchTouristInfo = async () => {
      try {
        const response = await fetch(`http://localhost:8000/tourist/getTouristInfo/${localStorage.getItem("userID")}`);
        if (!response.ok) {
          throw new Error("Tourist not found");
        }
        const data = await response.json();
        setTouristData(data); // Set the tourist info in the state
      } catch (error) {
        setError(error.message); // Set error message
      }
    };

    fetchTouristInfo();
  }, [localStorage.getItem("userID")]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!touristData) {
    return <p>Loading tourist information...</p>;
  }

  return (
    <div>
      <h2>Tourist Information</h2>
      <p><strong>Username:</strong> {touristData[0].username}</p>
      <p><strong>Date of Birth:</strong> {touristData[0].dateOfBirth}</p>
      <p><strong>Mobile Number:</strong> {touristData[0].mobileNumber}</p>
      <p><strong>Nationality:</strong> {touristData[0].nationality}</p>
      <p><strong>Job:</strong> {touristData[0].job}</p>
      <p><strong>Wallet:</strong> {touristData.wallet}</p>
    </div>
  );
};

export default TouristInfo;
