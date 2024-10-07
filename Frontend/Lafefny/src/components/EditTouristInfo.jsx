/* eslint-disable no-unused-vars */
import { useState } from "react";

const UpdateTouristInfo = () => {
  // Define state variables for the tourist information
  const [formData, setFormData] = useState({
    username: "",
    dateOfBirth: "",
    mobileNumber: "",
    nationality: "",
    job: "",
    wallet: 0,
  });

  const [message, setMessage] = useState(""); // For showing success or error messages

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/tourist/updateTouristInfo/${localStorage.getItem("userID")}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error}`);
      } else {
        const data = await response.json();
        setMessage("Tourist information updated successfully!");
        console.log("Updated data:", data);
      }
    } catch (error) {
      setMessage("An error occurred while updating tourist info.");
    }
  };

  return (
    <div>
      <h2>Update Tourist Info</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Date of Birth:</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Mobile Number:</label>
          <input
            type="text"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Nationality:</label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Job:</label>
          <input
            type="text"
            name="job"
            value={formData.job}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Wallet:</label>
          <input
            type="number"
            name="wallet"
            value={formData.wallet}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Update Tourist Info</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default UpdateTouristInfo;
