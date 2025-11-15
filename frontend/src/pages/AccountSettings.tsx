import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { TopNav } from '../components/builder/TopNav';
import { User, Lock, Trash2, ArrowLeft, Loader2, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';

const AccountSettings: React.FC = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Delete Account State
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsPasswordLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPasswordMessage(response.data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to change password';
      setPasswordError(errorMessage);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setIsDeleteLoading(true);

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/account`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { password: deletePassword }
        }
      );

      // Logout and redirect to home
      logout();
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete account';
      setDeleteError(errorMessage);
      setIsDeleteLoading(false);
    }
  };

  const passwordRequirements = [
    { label: 'At least 8 characters', regex: /.{8,}/ },
    { label: 'Uppercase letter', regex: /[A-Z]/ },
    { label: 'Lowercase letter', regex: /[a-z]/ },
    { label: 'Number', regex: /[0-9]/ },
    { label: 'Special character', regex: /[^A-Za-z0-9]/ }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Account Settings</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Manage your account security and preferences
          </p>
        </div>

        {/* Account Info - Glass Card */}
        <div className="glass-testimonial-card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-foreground/15 to-foreground/8 flex items-center justify-center">
              <User className="w-6 h-6 text-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Account Information</h2>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Email</span>
              <p className="text-base font-medium text-foreground">{user?.email}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Name</span>
              <p className="text-base font-medium text-foreground">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Subscription</span>
              <p className="text-base font-medium text-foreground capitalize">
                {user?.subscriptionTier || 'Free'}
              </p>
            </div>
          </div>
        </div>

        {/* Change Password - Glass Card */}
        <div className="glass-testimonial-card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-foreground/15 to-foreground/8 flex items-center justify-center">
              <Lock className="w-6 h-6 text-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Change Password</h2>
          </div>

          {passwordMessage && (
            <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{passwordMessage}</p>
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{passwordError}</p>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password Input - Glass Style */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Current Password
              </label>
              <div className="luxury-glass-input-wrap cursor-text rounded-full relative">
                <div className="luxury-glass-input relative z-10 flex items-center h-12 rounded-full">
                  <span className="luxury-glass-input-text px-5 py-2.5 w-full flex items-center gap-3">
                    <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base"
                      placeholder="Enter current password"
                    />
                  </span>
                </div>
                <div className="luxury-glass-input-shadow rounded-full pointer-events-none"></div>
              </div>
            </div>

            {/* New Password Input */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                New Password
              </label>
              <div className="luxury-glass-input-wrap cursor-text rounded-full relative">
                <div className="luxury-glass-input relative z-10 flex items-center h-12 rounded-full">
                  <span className="luxury-glass-input-text px-5 py-2.5 w-full flex items-center gap-3">
                    <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base"
                      placeholder="Enter new password"
                    />
                  </span>
                </div>
                <div className="luxury-glass-input-shadow rounded-full pointer-events-none"></div>
              </div>
            </div>

            {/* Confirm New Password Input */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Confirm New Password
              </label>
              <div className="luxury-glass-input-wrap cursor-text rounded-full relative">
                <div className="luxury-glass-input relative z-10 flex items-center h-12 rounded-full">
                  <span className="luxury-glass-input-text px-5 py-2.5 w-full flex items-center gap-3">
                    <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base"
                      placeholder="Confirm new password"
                    />
                  </span>
                </div>
                <div className="luxury-glass-input-shadow rounded-full pointer-events-none"></div>
              </div>
            </div>

            {/* Password Requirements */}
            {newPassword && (
              <div className="text-sm space-y-2 p-4 rounded-xl bg-foreground/5">
                <p className="font-medium text-foreground mb-3">Password requirements:</p>
                {passwordRequirements.map((req) => (
                  <div key={req.label} className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      req.regex.test(newPassword)
                        ? 'bg-green-500/20 text-green-600'
                        : 'bg-foreground/10 text-muted-foreground'
                    }`}>
                      {req.regex.test(newPassword) ? '✓' : '○'}
                    </span>
                    <span className={req.regex.test(newPassword) ? 'text-foreground' : 'text-muted-foreground'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button - Glass Style */}
            <div className="glass-button-wrap rounded-full relative cursor-pointer">
              <button
                type="submit"
                disabled={isPasswordLoading}
                className="glass-button relative z-10 text-base font-medium w-full"
              >
                <span className="glass-button-text relative block select-none tracking-tighter px-6 py-2.5">
                  <span className="flex items-center justify-center gap-2">
                    {isPasswordLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Change Password
                      </>
                    )}
                  </span>
                </span>
              </button>
              <div className="glass-button-shadow rounded-full pointer-events-none"></div>
            </div>
          </form>
        </div>

        {/* Delete Account - Glass Card with red accents */}
        <div className="glass-testimonial-card border-2 border-red-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/15 to-red-500/8 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
          </div>

          <p className="text-muted-foreground mb-6">
            Once you delete your account, there is no going back. Please be certain.
          </p>

          {deleteError && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{deleteError}</p>
            </div>
          )}

          {!showDeleteConfirm ? (
            <div className="glass-button-wrap rounded-full relative cursor-pointer inline-block">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="glass-button relative z-10 text-base font-medium"
              >
                <span className="glass-button-text relative block select-none tracking-tighter px-6 py-2.5 text-red-600">
                  <span className="flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </span>
                </span>
              </button>
              <div className="glass-button-shadow rounded-full pointer-events-none"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-700 font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  This action cannot be undone
                </p>
                <p className="text-sm text-red-600">
                  All your websites, chat history, and account data will be permanently deleted.
                </p>
              </div>

              {/* Delete Password Input */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Enter your password to confirm
                </label>
                <div className="luxury-glass-input-wrap cursor-text rounded-full relative">
                  <div className="luxury-glass-input relative z-10 flex items-center h-12 rounded-full">
                    <span className="luxury-glass-input-text px-5 py-2.5 w-full flex items-center gap-3">
                      <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base"
                        placeholder="Your password"
                      />
                    </span>
                  </div>
                  <div className="luxury-glass-input-shadow rounded-full pointer-events-none"></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <div className="glass-button-wrap rounded-full relative cursor-pointer flex-1">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleteLoading || !deletePassword}
                    className="glass-button relative z-10 text-base font-medium w-full"
                  >
                    <span className="glass-button-text relative block select-none tracking-tighter px-6 py-2.5 text-red-600">
                      <span className="flex items-center justify-center gap-2">
                        {isDeleteLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            Yes, Delete My Account
                          </>
                        )}
                      </span>
                    </span>
                  </button>
                  <div className="glass-button-shadow rounded-full pointer-events-none"></div>
                </div>

                <div className="glass-button-wrap rounded-full relative cursor-pointer">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword('');
                      setDeleteError('');
                    }}
                    className="glass-button relative z-10 text-base font-medium"
                  >
                    <span className="glass-button-text relative block select-none tracking-tighter px-6 py-2.5">
                      Cancel
                    </span>
                  </button>
                  <div className="glass-button-shadow rounded-full pointer-events-none"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
