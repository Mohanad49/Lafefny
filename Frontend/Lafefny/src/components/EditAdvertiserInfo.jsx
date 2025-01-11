import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Upload, ArrowLeft } from "lucide-react";
import Navigation from "../components/Navigation"; 
import Footer from "../components/Footer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
const UpdateAdvertiserInfo = () => {
  const auth = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    company: "",
    hotline: "",
    logo: "",
    website: "", // Add website field
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // Fetch existing Advertiser info
  useEffect(() => {
    const fetchAdvertiserInfo = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/advertiser/getAdvertiser/${localStorage.getItem(
            "userID"
          )}`
        );

        if (response.ok) {
          const data = await response.json();
          // Since getAdvertiser returns an array, take the first item
          const advertiserInfo = data[0];

          setFormData({
            company: advertiserInfo.company || "",
            hotline: advertiserInfo.hotline || "",
            logo: advertiserInfo.logo || "",
            website: advertiserInfo.website || "", // Add website field
          });
        } else {
          toast({
            title: "Error",
            description: "Error fetching Advertiser information",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "Error connecting to server",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertiserInfo();
  }, []); // Empty dependency array means this runs once on mount

  const handleRequestDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const userID = localStorage.getItem('userID');
  
      if (!token || !userID) {
        toast({
          title: "Error",
          description: "You must be logged in to delete your account",
          variant: "destructive", 
        });
        navigate('/login');
        return;
      }
  
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/request-deletion/${userID}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit deletion request');
      }
  
      toast({
        title: "Success",
        description: "Account deletion request submitted successfully. An admin will review your request.",
      });
      navigate('/AdvertiserHome');
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit account deletion request",
        variant: "destructive", 
      });
    }
  };

  const handleChangePhoto = async (e) => {
    const file = e.target.files[0];
    const base64 = await convertToBase64(file);
    setFormData({ ...formData, logo: base64 });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/advertiser/updateAdvertiser/${localStorage.getItem(
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
        toast({
          title: "Error",
          description: errorData.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Advertiser information updated successfully!",
        });
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the Advertiser info.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="p-8 pt-24 flex-grow mb-28">
      <div className="max-w-2xl mx-auto bg-surface rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
        <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              > 
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
          <h1 className="text-3xl font-bold text-primary">My Profile</h1>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={formData.logo} />
              <AvatarFallback className="text-2xl bg-accent text-primary">
                {formData.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            {isEditing && (
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleChangePhoto}
                  className="hidden"
                  id="logo-upload"
                />
                <Label
                  htmlFor="logo-upload"
                  className="flex items-center gap-2 cursor-pointer bg-accent text-primary px-4 py-2 rounded-md hover:bg-accent/90 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Upload New Logo
                </Label>
              </div>
            )}
          </div>

          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Company name</Label>
              <Input
                id="name"
                name="name"
                value={formData.company}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hotline">Hotline</Label>
              <Input
                id="hotline"
                name="hotline"
                value={formData.hotline}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="https://www.example.com"
              />
            </div>
          </div>

          {isEditing && (
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          )}
        </form>
        {/* New danger zone section */}
        <div className="mt-16 pt-8 border-t border-destructive/20">
       
          <p className="text-muted-foreground mb-4">
            Once you delete your Advertiser account, there is no going back. Please be certain.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will submit a request to delete your Advertiser account. An admin will review your request. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRequestDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Request Deletion
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default UpdateAdvertiserInfo;

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
  })
};
