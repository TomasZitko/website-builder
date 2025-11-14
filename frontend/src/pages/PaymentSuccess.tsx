import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: Verify payment with backend
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-panel border border-border rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-text mb-2">
          Payment Successful!
        </h1>
        <p className="text-text-muted mb-6">
          Your website download is now available
        </p>

        <Button
          onClick={() => navigate('/dashboard')}
          variant="primary"
          className="w-full"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
