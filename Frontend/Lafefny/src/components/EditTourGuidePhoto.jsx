import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const UploadTourGuidePhoto = () => {
  const navigate = useNavigate();
  const createPhoto = async (newPhoto) => {
    try {
      await axios.patch(
        `http://localhost:8000/tourGuide/uploadPicture/${localStorage.getItem(
          "userID"
        )}`,
        { picture: newPhoto }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createPhoto(photo.myPhoto);
    console.log(typeof photo.myPhoto);
    alert("you have changed your photo!");
  };
  const handleChange = async (e) => {
    const file = e.target.files[0];
    const base64 = await convertToBase64(file);
    setPhoto({ ...photo, myPhoto: base64 });
  };
  const [photo, setPhoto] = useState({ myPhoto: "" });
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
        Back to Previous
      </Button>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <img
          src={photo.myPhoto}
          alt="Preview"
          className="w-full h-48 object-cover rounded-md mb-4"
        ></img>
        <input
          type="file"
          label="image"
          name="myFile"
          accept=".png .jpeg  .jpg"
          onChange={(e) => {
            handleChange(e);
          }}
          className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-black file:text-white
                    hover:file:bg-gray-900
                    file:cursor-pointer cursor-pointer
                    border rounded-md
                    focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        />
        <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none ">
          Upload Photo
        </button>
      </form>
    </div>
  );
};

export default UploadTourGuidePhoto;

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
