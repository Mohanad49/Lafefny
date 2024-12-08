import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import Navigation from './Navigation';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmNewPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New passwords don't match."
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to change your password."
        });
        return;
      }

      const response = await fetch(`http://localhost:8000/change-password/${localStorage.getItem("userID")}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Password changed successfully."
        });
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || 'Failed to change password.'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while changing the password."
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 md:px-8 pt-24 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 hover:-translate-x-1 transition-transform self-start"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="space-y-4 max-w-2xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">Change Password</h1>
              <p className="text-lg text-muted-foreground">Keep your account secure by updating your password regularly</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-xl mx-auto">
            {/* Security Tips Card */}
            <div className="bg-primary/5 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Password Security Tips</h3>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li>• Use at least 8 characters</li>
                    <li>• Include uppercase and lowercase letters</li>
                    <li>• Add numbers and special characters</li>
                    <li>• Avoid using personal information</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Password Change Form */}
            <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="p-8 md:p-10">
                <div className="space-y-8">
                  <div className="flex items-center gap-3 text-primary border-b border-border pb-6">
                    <Lock className="h-7 w-7" />
                    <h2 className="text-2xl font-semibold">Security Update</h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                      {/* Current Password */}
                      <div className="space-y-4">
                        <Label htmlFor="currentPassword" className="text-sm font-medium inline-block">
                          Current Password
                        </Label>
                        <div className="relative group">
                          <Input
                            id="currentPassword"
                            type={showPasswords.current ? "text" : "password"}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="pr-10 py-6 text-base transition-shadow focus:shadow-md"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="space-y-4">
                        <Label htmlFor="newPassword" className="text-sm font-medium inline-block">
                          New Password
                        </Label>
                        <div className="relative group">
                          <Input
                            id="newPassword"
                            type={showPasswords.new ? "text" : "password"}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="pr-10 py-6 text-base transition-shadow focus:shadow-md"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div className="space-y-4">
                        <Label htmlFor="confirmNewPassword" className="text-sm font-medium inline-block">
                          Confirm New Password
                        </Label>
                        <div className="relative group">
                          <Input
                            id="confirmNewPassword"
                            type={showPasswords.confirm ? "text" : "password"}
                            name="confirmNewPassword"
                            value={formData.confirmNewPassword}
                            onChange={handleChange}
                            className="pr-10 py-6 text-base transition-shadow focus:shadow-md"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit"
                      className="w-full py-7 text-lg font-medium transition-all hover:scale-102 hover:shadow-lg"
                    >
                      <KeyRound className="mr-2 h-5 w-5" />
                      Update Password
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChangePassword;
