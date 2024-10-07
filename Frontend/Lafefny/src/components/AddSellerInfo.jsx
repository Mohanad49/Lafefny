/* eslint-disable no-unused-vars */
import { useState } from "react";

const AddSellerInfo = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
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
      const response = await fetch(`http://localhost:8000/seller/addSellerInfo/${localStorage.getItem("userID")}`, {
        method: "POST",
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
        setMessage("Tour guide information added successfully!");
        console.log("Added data:", data);
      }
    } catch (error) {
      setMessage("An error occurred while adding tour guide info.");
    }
  };

  return (
    <div>
      
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


        <button type="submit">Add Tour Guide Info</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default AddSellerInfo;
