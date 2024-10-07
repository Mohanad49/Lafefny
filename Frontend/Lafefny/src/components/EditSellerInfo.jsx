/* eslint-disable no-unused-vars */
import { useState } from "react";

const UpdateSellerInfo = () => {
  const [formData, setFormData] = useState({
    name:"",
    description:""
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
      const response = await fetch(`http://localhost:8000/seller/updateSellerInfo/${localStorage.getItem("userID")}`, {
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
        setMessage("Tour guide information updated successfully!");
        console.log("Updated data:", data);
      }
    } catch (error) {
      setMessage("An error occurred while updating the tour guide info.");
    }
  };

  return (
    <div>
      <h2>Update Seller Info</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>description:</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Update Tour Guide Info</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default UpdateSellerInfo;
