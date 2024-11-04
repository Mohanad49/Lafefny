/* eslint-disable no-unused-vars */
import { useState } from "react";

const UpdateAdvertiserInfo = () => {
  const [formData, setFormData] = useState({
    hotline:0,
    company:"",
    website:"",

  });

  const [message, setMessage] = useState(""); // For success or error messages

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
      const response = await fetch(`http://localhost:8000/advertiser/updateAdvertiser/${localStorage.getItem("userID")}`, {
        method: "PATCH",
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
        setMessage("Advertiser information updated successfully!");
        console.log("Updated data:", data);
      }
    } catch (error) {
      setMessage("An error occurred while updating the Advertiser info.");
    }
  };

  return (
    <div>
      <h2>Update advertiser Info</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Hotline</label>
          <input
            type="number"
            name="hotline"
            value={formData.hotline}
            onChange={handleChange}
            required
          />
        </div>


        <div>
          <label>company:</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
          />
        </div>



        <div>
          <label>website:</label>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Update Advertiser Info</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default UpdateAdvertiserInfo;
