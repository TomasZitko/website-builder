import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CreditCard, Check } from 'lucide-react';
import { paymentApi } from '@/api/payment';
import { useToast } from '@/contexts/ToastContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  websiteId: string;
  websiteName: string;
}

export function PaymentModal({ isOpen, onClose, websiteId, websiteName }: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { error } = useToast();

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const response = await paymentApi.createCheckout(
        websiteId,
        `${window.location.origin}/payment/success`,
        `${window.location.origin}/dashboard`
      );

      // Redirect to Stripe Checkout
      window.location.href = response.url;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create checkout';
      error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Download Website">
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-1">{websiteName}</h3>
          <p className="text-sm text-gray-600">
            One-time purchase - Download your website as ZIP
          </p>
        </div>

        <div className="flex items-center justify-between py-4 border-t border-b">
          <span className="font-semibold">Total</span>
          <span className="text-2xl font-bold">�7.99</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Complete HTML, CSS, and JavaScript files</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Admin panel for easy content updates</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Upload instructions included</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm">No recurring fees</span>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={isLoading}
          variant="default"
          className="w-full"
        >
          <CreditCard className="w-4 h-4" />
          {isLoading ? 'Processing...' : 'Pay with Stripe'}
        </Button>

        <p className="text-xs text-center text-gray-500">
          Secure payment powered by Stripe
        </p>
      </div>
    </Modal>
  );
}
