import { useState } from "react"
import axios from "axios";

const UploadSellerDocs=()=>{
    const [pdf, setPdf]= useState();
    
    const handleSubmit= async(e)=>{
        e.preventDefault();
        const formData = new FormData();
        formData.append('pdf', pdf);
    
        try {
          await axios.patch(`http://localhost:8000/seller/uploadPDF/${localStorage.getItem("userID")}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          alert('File uploaded successfully');
        } catch (error) {
          console.error('Error uploading file', error);
          alert('File upload failed');
        }

    }

    const handleFileChange=(e)=>{
        setPdf(e.target.files[0]);
        
    }
    return(
        <form onSubmit={handleSubmit}>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button type="submit">Upload Documents</button>
    </form>
    )
}

export default UploadSellerDocs;