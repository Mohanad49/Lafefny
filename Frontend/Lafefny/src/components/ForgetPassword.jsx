import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div>
      {step === 1 && (
        <div>
          <h2>Forgot Password</h2>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleSendOtp}>Send OTP</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2>Verify OTP</h2>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleVerifyOtp}>Verify OTP</button>
        </div>
      )}
      {step === 3 && (
        <div>
          <h2>Reset Password</h2>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handleResetPassword}>Reset Password</button>
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default ForgotPassword;
