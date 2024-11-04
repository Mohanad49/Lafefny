import { useState } from "react";
import axios from "axios"

 const UploadSellerLogo= ()=>{
    const createPhoto= async(newPhoto)=>{
        try{
           await axios.patch(`http://localhost:8000/seller/uploadLogo/${localStorage.getItem("userID")}`,{ logo: newPhoto })
        }catch(error){
            console.log(error);
        }
    }

    const handleSubmit= (e)=>{
        e.preventDefault();
        createPhoto(photo.myPhoto);
        console.log(typeof photo.myPhoto)
        alert("you have changed your logo!");

    }
    const handleChange= async(e)=>{
        const file= e.target.files[0];
        const base64 = await convertToBase64(file);
        setPhoto({...photo, myPhoto:base64});
    }
    const [photo, setPhoto]= useState({myPhoto:""})
    return (
        <form onSubmit={handleSubmit}>
            <img src={photo.myPhoto}></img>
            <input type="file" label="image" name="myFile" accept=".png .jpeg  .jpg" onChange={(e)=>{handleChange(e)}}/>
            <button>submit</button>
        </form>
    )
}

export default UploadSellerLogo;

function convertToBase64(file){
    return new Promise((resolve,reject)=>{
        const fileReader= new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload= ()=>{
            resolve(fileReader.result)
        }
        fileReader.onerror=(error)=>{
            reject(error)
        }
    })
}