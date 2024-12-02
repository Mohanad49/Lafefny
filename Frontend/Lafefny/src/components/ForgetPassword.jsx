/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // Tracks the current step
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSendOtp = async () => {
    try {
      const response = await fetch('http://localhost:8000/forget/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        setStep(2); // Proceed to OTP verification
      } else {
        console.error('Error response:', data);
        setMessage(data.message || 'Error sending OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setMessage('Error sending OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await fetch('http://localhost:8000/forget/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (response.ok) {
        setStep(3); // Proceed to password reset
      }
      setMessage(data.message);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setMessage('Error verifying OTP. Please try again.');
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await fetch('http://localhost:8000/forget/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Password reset successfully.');
        setStep(1); // Reset to initial step
        setEmail('');
        setOtp('');
        setNewPassword('');
        setTimeout(() => {
          navigate('/'); // Redirect to home screen after 3 seconds
        }, 3000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage('Error resetting password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <Button
          onClick={() => navigate('/sign')}
          variant="ghost"
          className="flex items-center gap-2 hover:bg-accent/10"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Sign In
        </Button>
      </div>

      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight mb-6">
              Reset Password
            </h2>
            <p className="text-primary mb-8">
              {step === 1 && "Enter your email to receive a reset code"}
              {step === 2 && "Enter the verification code sent to your email"}
              {step === 3 && "Enter your new password"}
            </p>
          </div>

          <div className="bg-surface p-8 rounded-2xl border border-border shadow-sm">
            <div className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    className="w-full bg-black text-white hover:bg-gray-800"
                    onClick={handleSendOtp}
                  >
                    Send Reset Code
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter verification code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    className="w-full bg-black text-white hover:bg-gray-800"
                    onClick={handleVerifyOtp}
                  >
                    Verify Code
                  </Button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    className="w-full bg-black text-white hover:bg-gray-800"
                    onClick={handleResetPassword}
                  >
                    Reset Password
                  </Button>
                </div>
              )}

              {message && (
                <div className="mt-4 text-center text-sm">
                  <p className={`${
                    message.includes('successfully') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
