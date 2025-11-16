import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthComponent } from '@/components/ui/sign-up';
import { SignupFork, AccountType } from '@/components/agency/SignupFork';
import { AgencySignupForm } from '@/components/agency/AgencySignupForm';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const Logo = () => (
  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
    <span className="text-white text-xl font-bold">W</span>
  </div>
);

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType | null>(null);
  const [showFork, setShowFork] = useState(true);

  const handleAccountTypeSelect = (accountType: AccountType) => {
    setSelectedAccountType(accountType);
    setShowFork(false);
  };

  const handleBackToFork = () => {
    setShowFork(true);
    setSelectedAccountType(null);
  };

  const handleSuccess = async (data: any) => {
    const success = await register(data);
    if (success) {
      // Redirect based on account type
      const redirectPath = data.user?.accountType === 'agency' ? '/agency/dashboard' : '/dashboard';
      setTimeout(() => {
        navigate(redirectPath);
      }, 2000);
    } else {
      throw new Error('Registration failed');
    }
  };

  const handlePersonalSuccess = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const success = await register({ ...data, accountType: 'personal' });
    if (success) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else {
      throw new Error('Registration failed');
    }
  };

  return (
    <>
      <ThemeToggle />

      {showFork ? (
        // Show the signup fork (Personal vs Agency selection)
        <div className="min-h-screen flex items-center justify-center p-4">
          <SignupFork onSelect={handleAccountTypeSelect} />
        </div>
      ) : selectedAccountType === 'agency' ? (
        // Show agency signup form
        <div className="min-h-screen flex items-center justify-center p-4">
          <AgencySignupForm onBack={handleBackToFork} onSuccess={handleSuccess} />
        </div>
      ) : (
        // Show personal signup form (existing)
        <AuthComponent
          logo={<Logo />}
          brandName="WebChat.ai"
          onSuccess={handlePersonalSuccess}
        />
      )}
    </>
  );
}
