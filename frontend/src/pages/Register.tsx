import { useNavigate } from 'react-router-dom';
import { AuthComponent } from '@/components/ui/sign-up';
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

  const handleSuccess = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const success = await register(data);
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
      <AuthComponent
        logo={<Logo />}
        brandName="WebChat.ai"
        onSuccess={handleSuccess}
      />
    </>
  );
}
