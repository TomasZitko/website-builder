import { useNavigate } from 'react-router-dom';
import { AuthDualView } from '@/components/ui/auth-dual-view';
import { useAuth } from '@/hooks/useAuth';

const Logo = () => (
  <div className="bg-gradient-to-br from-slate-600 to-gray-700 text-white rounded-lg p-2">
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  </div>
);

export function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // Handle login submission
  const handleSignIn = async (data: { email: string; password: string; rememberMe: boolean }) => {
    try {
      const success = await login(data.email, data.password);
      if (success) {
        navigate('/dashboard');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Handle signup submission
  const handleSignUp = async (data: { email: string; password: string; fullName: string }) => {
    try {
      // Parse full name into first and last name
      const nameParts = data.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const success = await register({
        email: data.email,
        password: data.password,
        firstName: firstName || 'User',
        lastName: lastName || '',
      });

      if (success) {
        // Registration successful, redirect to login or dashboard
        navigate('/dashboard');
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  // Handle OAuth sign in
  const handleGoogleAuth = () => {
    // ✅ ENABLED - Real Google OAuth credentials configured
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/v1/auth/google`;
  };

  const handleAppleAuth = () => {
    alert('⚠️ APPLE OAUTH NOT CONFIGURED\n\n' +
          'Apple OAuth requires Apple Developer account ($99/year).\n\n' +
          'FOR NOW: Use Email/Password signup below ↓');
  };

  // Navigate to reset password page
  const handleResetPassword = () => {
    navigate('/forgot-password');
  };

  const testimonials = [
    {
      avatarSrc: 'https://i.pravatar.cc/150?img=1',
      name: 'Sarah Chen',
      handle: '@sarahchen',
      text: 'This platform has transformed how our team collaborates. Incredible experience!',
    },
    {
      avatarSrc: 'https://i.pravatar.cc/150?img=2',
      name: 'Marcus Reid',
      handle: '@marcusreid',
      text: 'The intuitive design makes complex workflows feel effortless.',
    },
  ];

  return (
    <AuthDualView
      heroImageSrc="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80"
      testimonials={testimonials}
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      onGoogleAuth={handleGoogleAuth}
      onAppleAuth={handleAppleAuth}
      onResetPassword={handleResetPassword}
      logo={<Logo />}
      brandName="WebChat.ai"
      defaultView="login"
    />
  );
}
