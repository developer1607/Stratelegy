import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Camera, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import PasswordRequirements from '@/components/PasswordRequirements';
import { formatPasswordErrors, validatePassword } from '@/lib/passwordValidation';

export default function Profile() {
  const { refreshAuth } = useAuth();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    display_name: '',
    profile_picture: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await api.auth.me();
        setUser(userData);
        setFormData({
          display_name: userData.full_name || userData.display_name || '',
          profile_picture: userData.avatar_url || userData.profile_picture || '',
        });
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, profile_picture: file_url });
      toast.success('Photo uploaded');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.auth.updateMe({
        full_name: formData.display_name.trim(),
        avatar_url: formData.profile_picture,
      });

      const updatedUser = await api.auth.me();
      setUser(updatedUser);
      await refreshAuth();
      toast.success('Profile updated');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { current_password, new_password, confirm_password } = passwordForm;

    if (!current_password) {
      toast.error('Enter your current password');
      return;
    }
    const passwordCheck = validatePassword(new_password);
    if (!passwordCheck.valid) {
      toast.error(formatPasswordErrors(passwordCheck.errors));
      return;
    }
    if (new_password === current_password) {
      toast.error('New password must be different from your current password');
      return;
    }
    if (new_password !== confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.auth.changePassword({ current_password, new_password });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      toast.success('Password updated');
    } catch (error) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile & Settings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* Profile Picture */}
                    <div className="space-y-2">
                      <Label>Profile Picture</Label>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                          {formData.profile_picture ? (
                            <img
                              src={formData.profile_picture}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                              <User className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
                            </div>
                          )}
                        </Avatar>
                        <div className="flex-1 w-full">
                          <input
                            type="file"
                            id="photo-upload"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('photo-upload').click()}
                            disabled={uploading}
                            className="w-full sm:w-auto"
                          >
                            {uploading ? (
                              'Uploading...'
                            ) : (
                              <>
                                <Camera className="w-4 h-4 mr-2" />
                                Upload Photo
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="display_name">Full Name</Label>
                      <Input
                        id="display_name"
                        value={formData.display_name}
                        onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.email}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={user.role}
                        disabled
                        className="bg-gray-50 capitalize"
                      />
                    </div>

                    <div className="pt-4">
                      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5" />
                  Change password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current password</Label>
                    <Input
                      id="current_password"
                      type="password"
                      autoComplete="current-password"
                      value={passwordForm.current_password}
                      onChange={(e) =>
                        setPasswordForm((f) => ({ ...f, current_password: e.target.value }))
                      }
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm((f) => ({ ...f, new_password: e.target.value }))
                      }
                      placeholder="At least 8 characters with upper, lower, number & symbol"
                    />
                  </div>
                  <PasswordRequirements password={passwordForm.new_password} className="mt-2" />
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm new password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.confirm_password}
                      onChange={(e) =>
                        setPasswordForm((f) => ({ ...f, confirm_password: e.target.value }))
                      }
                      placeholder="Re-enter new password"
                    />
                  </div>
                  <Button type="submit" variant="outline" disabled={passwordLoading}>
                    {passwordLoading ? 'Updating...' : 'Update password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-20 h-20 mb-4">
                    {user.avatar_url || user.profile_picture ? (
                      <img
                        src={user.avatar_url || user.profile_picture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                        <User className="w-10 h-10 text-blue-600" />
                      </div>
                    )}
                  </Avatar>
                  <h3 className="font-semibold text-lg">
                    {user.full_name || user.display_name || 'User'}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <Badge className="mt-2 capitalize">{user.role}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Account Type</p>
                    <p className="font-semibold capitalize truncate">{user.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Email Verified</p>
                    <p className="font-semibold">Yes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Security</p>
                    <p className="font-semibold">Protected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
