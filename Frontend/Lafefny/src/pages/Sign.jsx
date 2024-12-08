/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { signUp, signIn } from '../services/signService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useToast } from "@/components/ui/use-toast";

function Sign() {
  const { toast } = useToast();
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
    termsAccepted:false,
  });
  const [showTerms, setShowTerms] = useState(false); // State to control the terms modal
  const [pdf, setPdf] = useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    // No need to clear auth data on mount anymore
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleBack = () => {
    navigate('/');
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
      isAccepted: userType === 'Tourist' ? true : false
    };
    try {
      if (isSignUp) {
        if (!formData.termsAccepted) {
          toast({
            variant: "destructive",
            title: "Terms & Conditions Required",
            description: "You must accept the terms and conditions to sign up."
          });
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
          if (userType === 'Tourist'){
            toast({
              title: "Success",
              description: "Sign up successful!"
            });
          }
          else{
            toast({
              title: "Success",
              description: "Sign up successful! Please wait for admin approval before signing in."
            });
          }
          setIsSignUp(false);

        } catch (error) {
          console.error('Error creating role profile:', error);
          // Delete the user if role profile creation fails
          await axios.delete(`http://localhost:8000/admin/delete-account/${userId}`);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Error creating profile. Please try again."
          });
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
              toast({
                variant: "destructive",
                title: "Error",
                description: "Invalid role detected"
              });
          }
        } catch (error) {
          if (error.response?.status === 403) {
            toast({
              variant: "destructive",
              title: "Account Pending",
              description: "Your account is pending approval. Please wait for admin confirmation."
            });
          } else {
            toast({
              variant: "destructive",
              title: "Authentication Failed",
              description: "Invalid credentials. Please try again."
            });
          }
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred during authentication"
      });
    }
  };

  const toggleTermsModal = () => {
    setShowTerms(!showTerms);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 p-2 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Home</span>
      </button>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-6">
            <Plane className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-6">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-500 text-sm">
            {isSignUp ? 'Register to start your journey' : 'Sign in to continue'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">User Type</label>
                  <select 
                    name="userType" 
                    value={userType} 
                    onChange={(e) => setUserType(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Tourist">Tourist</option>
                    <option value="TourGuide">Tour Guide</option>
                    <option value="Advertiser">Advertiser</option>
                    <option value="Seller">Seller</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {userType === 'Tourist' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Mobile Number</label>
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Nationality</label>
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Job</label>
                      <input
                        type="text"
                        name="job"
                        value={formData.job}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </>
                )}

                {isSignUp && userType !== 'Tourist' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Required Documents (PDF)</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      required
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {userType === 'TourGuide' && "Please upload your tour guide license and certifications"}
                      {userType === 'Seller' && "Please upload your business registration documents"}
                      {userType === 'Advertiser' && "Please upload your company registration and advertising credentials"}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-600">
                    I accept the 
                    <button 
                      type="button" 
                      onClick={toggleTermsModal}
                      className="ml-1 text-primary hover:underline"
                    >
                      terms and conditions
                    </button>
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/forgotPassword')}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button onClick={handleSignIn} className="text-primary hover:underline">
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button onClick={handleSignUp} className="text-primary hover:underline">
                  Sign Up
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Terms and Conditions</h2>
              <button 
                onClick={toggleTermsModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &#10006;
              </button>
            </div>
            <div className="prose prose-sm">
              <ol className="space-y-4">
                <li><strong>Booking Confirmation:</strong> Your booking will be confirmed once you receive a confirmation email from us.</li>
                <li><strong>Payment:</strong> Full payment must be made at the time of booking unless stated otherwise.</li>
                <li><strong>Cancellation Policy:</strong> Cancellations made within 48 hours of the trip will incur a 100% cancellation fee.</li>
                <li><strong>Changes to Bookings:</strong> Any changes to bookings must be requested via email and are subject to availability.</li>
                <li><strong>Travel Insurance:</strong> We recommend that all travelers obtain comprehensive travel insurance.</li>
                <li><strong>Conduct:</strong> All guests are expected to behave respectfully towards other guests and staff.</li>
                <li><strong>Liability:</strong> Our company is not liable for any injuries, losses, or damages incurred during your trip.</li>
                <li><strong>Governing Law:</strong> These terms are governed by the laws of [Your Country/Region].</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sign;