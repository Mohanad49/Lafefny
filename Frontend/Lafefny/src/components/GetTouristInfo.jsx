/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import '../styles/userInfo.css';
import axios from 'axios';

const TouristInfo = () => {
  const [touristData, setTouristData] = useState(null); // State for storing tourist info
  const [error, setError] = useState(""); // State for handling errors
  const [isRedeeming, setIsRedeeming] = useState(false);

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

  const handleRedeemPoints = async () => {
    setIsRedeeming(true);
    try {
      const userId = localStorage.getItem('userID');
      const response = await axios.post(
        `http://localhost:8000/tourist/redeemPoints/${userId}`
      );
      
      // Update the tourist data with new values
      setTouristData([{
        ...touristData[0],
        wallet: response.data.newWalletBalance,
        loyaltyPoints: response.data.remainingPoints
      }]);
      
      alert(`Successfully redeemed ${response.data.pointsRedeemed} points for ${response.data.egpAdded} EGP`);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to redeem points');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!touristData) {
    return <p>Loading tourist information...</p>;
  }

  return (
    <div className="tourist-info-container">
      <h2>Tourist Information</h2>
      <div className="info-section">
        <p><strong>Username:</strong> {touristData[0].username}</p>
        <p><strong>Date of Birth:</strong> {touristData[0].dateOfBirth}</p>
        <p><strong>Mobile Number:</strong> {touristData[0].mobileNumber}</p>
        <p><strong>Nationality:</strong> {touristData[0].nationality}</p>
        <p><strong>Job:</strong> {touristData[0].job}</p>
        <p><strong>Wallet:</strong> EGP {Number(touristData[0].wallet || 0).toFixed(2)}</p>
        <div className="loyalty-points">
          <h3>Loyalty Points</h3>
          <p className="points-value">
            {Number(touristData[0].loyaltyPoints || 0)} points
          </p>
          <p><strong>Level:</strong> {touristData[0].level || 1}</p>
          <p><strong>Badge:</strong> {touristData[0].badge || 'Bronze'}</p>
          {touristData[0].loyaltyPoints >= 10000 && (
            <button 
              className="redeem-button"
              onClick={handleRedeemPoints}
              disabled={isRedeeming}
            >
              {isRedeeming ? 'Redeeming...' : 'Redeem Points'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TouristInfo;
