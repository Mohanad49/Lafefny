/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const UpdateTourGuideInfo = () => {
  const [formData, setFormData] = useState({
    mobile: "",
    yearsOfExperience: "",
    previousWork: "",
    picture: "",
  });

  const [message, setMessage] = useState(""); // For success or error messages
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch existing tour guide info
  useEffect(() => {
    const fetchTourGuideInfo = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/tourGuide/getTourGuide/${localStorage.getItem(
            "userID"
          )}`
        );

        if (response.ok) {
          const data = await response.json();
          // Since getTourGuide returns an array, we take the first item
          const tourGuideInfo = data[0];

          setFormData({
            mobile: tourGuideInfo.mobile || "",
            yearsOfExperience: tourGuideInfo.yearsOfExperience || "",
            previousWork: tourGuideInfo.previousWork || "",
            picture: tourGuideInfo.picture || "",
          });
        } else {
          setMessage("Error fetching tour guide information");
        }
      } catch (error) {
        console.error("Error:", error);
        setMessage("Error connecting to server");
      } finally{
        setLoading(false);
      }
    };

    fetchTourGuideInfo();
  }, []); // Empty dependency array means this runs once on mount

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleChangePicture = async (e) => {
    const file = e.target.files[0];
    const base64 = await convertToBase64(file);
    setFormData({ ...formData, 
      picture: base64 });
  };
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:8000/tourGuide/updateTourGuideInfo/${localStorage.getItem(
          "userID"
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">Loading advertiser information...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Back Button */}
      <Button
        onClick={() => navigate(-1)}
        variant="ghost"
        className="absolute top-4 left-4 flex items-center gap-2 hover:bg-accent/10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </Button>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Tour Guide Info
          </h2>
        </div>
          {/* Profile Picture Section */}
          <div className="absolute top-20 left-10 flex flex-col items-center space-y-4 mb-8">
                <div className="relative">
                    <img
                        src={formData.picture || "https://via.placeholder.com/150"}
                        alt="Profile"
                        className="w-40 h-40 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                    />
                </div>
                <input
                    type="file"
                    onChange={handleChangePicture}
                    accept="image/*"
                    className="block w-64 text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-medium
                        file:bg-black file:text-white
                        hover:file:bg-gray-800
                        file:cursor-pointer cursor-pointer"
                />
            </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Mobile
            </label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Years of Experience
            </label>
            <input
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Previous Work
            </label>
            <input
              type="text"
              name="previousWork"
              value={formData.previousWork}
              onChange={handleChange}
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
            />
          </div>

          <div className="flex gap-4">
            <button
                type="button" // Important: type="button" prevents form submission
                onClick={() => navigate(-1)}
                className="w-1/2 py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200"
            >
                Cancel
            </button>
            <button
                type="submit"
                className="w-1/2 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200"
            >
                Save
            </button>
          </div>
          {message && (
            <div className="mt-4 text-center text-sm text-gray-600">
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UpdateTourGuideInfo;

function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}