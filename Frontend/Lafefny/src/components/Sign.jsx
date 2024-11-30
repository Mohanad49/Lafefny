/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { signUp, signIn } from '../services/signService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/sign.css';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

function Sign() {
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [userType, setUserType] = useState('Tourist');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    dateOfBirth: '',
    mobileNumber: '',
    nationality: '',
    job: '',
    role: 'Tourist',
    termsAccepted: false,
  });
  const [showTerms, setShowTerms] = useState(false); // State to control the terms modal
  const [pdf, setPdf] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    // No need to clear auth data on mount anymore
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = () => {
    setFormData((prevData) => ({
      ...prevData,
      termsAccepted: !prevData.termsAccepted,
    }));
  };

  const handleFileChange = (e) => {
    setPdf(e.target.files[0]);
  };

  const handleSignUp = () => {
    setIsSignUp(true);
  };

  const handleSignIn = () => {
    setIsSignUp(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedFormData = {
      ...formData,
      role: userType,
    };
    try {
      if (isSignUp) {
        if (!formData.termsAccepted) {
          alert("You must accept the terms and conditions to sign up.");
          return;
        }

        // First create user account
        const signUpResponse = await signUp(updatedFormData);
        const userId = signUpResponse.id;

        // Create role-specific profile
        try {
          switch(userType) {
            case 'Tourist':
              await axios.post(`http://localhost:8000/tourist/addTourist`, {
                userID: userId,
                wallet: 0,
                preferences: [],
                loyaltyPoints: 0,
                level: 1,
                badge: 'Bronze'
              });
              break;

            case 'TourGuide':
              await axios.post(`http://localhost:8000/tourGuide/addTourGuideInfo/${userId}`, {
                mobile: formData.mobileNumber,
                yearsOfExperience: 0,
                previousWork: ''
              });
              break;

            case 'Seller':
              await axios.post(`http://localhost:8000/seller/addSellerInfo/${userId}`, {
                name: formData.username || '', // Use username as name
                description: formData.job || 'New Seller', // Use job as initial description or default
              });
              break;

            case 'Advertiser':
              await axios.post(`http://localhost:8000/advertiser/addAdvertiserInfo/${userId}`, {
                hotline: formData.mobileNumber,
                company: '',
                website: ''
              });
              break;
          }

          // Handle document upload if needed
          if (userType !== 'Tourist' && pdf) {
            const fileFormData = new FormData();
            fileFormData.append('pdf', pdf);

            let uploadEndpoint = '';
            switch(userType) {
              case 'Advertiser':
                uploadEndpoint = 'advertiser';
                break;
              case 'Seller':
                uploadEndpoint = 'seller';
                break;
              case 'TourGuide':
                uploadEndpoint = 'tourGuide';
                break;
            }

            await axios.patch(
              `http://localhost:8000/${uploadEndpoint}/uploadPDF/${userId}`,
              fileFormData,
              {
                headers: { 'Content-Type': 'multipart/form-data' },
              }
            );
          }

          alert('Sign up successful! Please wait for admin approval before signing in.');
          setIsSignUp(false);

        } catch (error) {
          console.error('Error creating role profile:', error);
          // Delete the user if role profile creation fails
          await axios.delete(`http://localhost:8000/admin/delete-account/${userId}`);
          alert('Error creating profile. Please try again.');
        }

      } else {
        try {
          const signInResponse = await signIn(formData.email, formData.password);
          
          // Use the login function from AuthContext
          login(signInResponse);
          
          // Redirect based on the user role
          switch(signInResponse.role) {
            case 'Tourist':
              navigate('/touristHome');
              break;
            case 'Seller':
              navigate('/sellerHome');
              break;
            case 'TourGuide':
              navigate('/tourGuideHome');
              break;
            case 'Advertiser':
              navigate('/advertiserHome');
              break;
            case 'Admin':
              navigate('/adminHome');
              break;
            case 'TourismGovernor':
              navigate('/TourismGovernorHome');
              break;
            default:
              alert('Invalid role detected');
          }
        } catch (error) {
          if (error.response?.status === 403) {
            alert('Your account is pending approval. Please wait for admin confirmation.');
          } else {
            alert('Invalid credentials. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert(error.message || 'An error occurred during authentication');
    }
  };

  const toggleTermsModal = () => {
    setShowTerms(!showTerms);
  };

  const handleViewTerms = () => {
    setShowTerms(true);
  };

  const renderUserSpecificFields = () => {
    if (formData.role === 'Tourist') {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mobileNumber">Mobile Number</Label>
            <Input
              id="mobileNumber"
              name="mobileNumber"
              type="tel"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job">Job/Student Status</Label>
            <Input
              id="job"
              name="job"
              value={formData.job}
              onChange={handleChange}
              required
            />
          </div>
        </>
      );
    } else {
      return (
        <div className="space-y-2">
          <Label htmlFor="documents">Required Documents (PDF)</Label>
          <Input
            id="documents"
            type="file"
            accept=".pdf"
            onChange={(e) => setPdf(e.target.files[0])}
            required
            className="w-full cursor-pointer
            file:cursor-pointer file:mr-4 
            file:py-2 file:px-4 
            file:rounded-md file:border-0 
            file:text-sm file:font-medium
            file:bg-primary file:text-primary-foreground
            hover:file:bg-primary/90
            border border-input"          />
          <p className="text-sm text-gray-500">Please upload your required documents in PDF format</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-6">
            {!isSignUp ? "Welcome back" : "Create an account"}
          </h2>
          <p className="text-secondary mb-8">
            {!isSignUp
              ? "Enter your details to sign in"
              : "Enter your details to get started"}
          </p>
        </div>
        <div className="bg-surface p-8 rounded-2xl border border-border shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="userType">User Type</Label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="Tourist">Tourist</option>
                    <option value="Tour Guide">Tour Guide</option>
                    <option value="Advertiser">Advertiser</option>
                    <option value="Seller">Seller</option>
                  </select>
                </div>

                {renderUserSpecificFields()}
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        termsAccepted: e.target.checked
                      }))}
                    />
                    I accept the terms and conditions
                    <Button 
                      type="button"
                      variant="link"
                      onClick={handleViewTerms}
                      className="text-blue-500 underline ml-2"
                    >
                      View Terms
                    </Button>
                  </Label>
                </div>
              </>
            )}

            <Button type="submit" className="w-full bg-accent text-primary hover:bg-accent/90">
              {!isSignUp ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:text-primary transition-colors"
            >
              {!isSignUp
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>

      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Terms and Conditions</h3>
            {/* Terms content */}
            <ol>
              <li><strong>Booking Confirmation:</strong> Your booking will be confirmed once you receive a confirmation email from us.</li>
              <li><strong>Payment:</strong> Full payment must be made at the time of booking unless stated otherwise.</li>
              <li><strong>Cancellation Policy:</strong> Cancellations made within 48 hours of the trip will incur a 100% cancellation fee.</li>
              <li><strong>Changes to Bookings:</strong> Any changes to bookings must be requested via email and are subject to availability.</li>
              <li><strong>Travel Insurance:</strong> We recommend that all travelers obtain comprehensive travel insurance.</li>
              <li><strong>Conduct:</strong> All guests are expected to behave respectfully towards other guests and staff.</li>
              <li><strong>Liability:</strong> Our company is not liable for any injuries, losses, or damages incurred during your trip.</li>
              <li><strong>Governing Law:</strong> These terms are governed by the laws of [Your Country/Region].</li>
            </ol>
            <Button 
              onClick={() => setShowTerms(false)}
              className="mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sign;
