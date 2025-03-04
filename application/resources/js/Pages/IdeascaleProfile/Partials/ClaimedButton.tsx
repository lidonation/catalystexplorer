import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePage } from '@inertiajs/react';
import Claim from '@/Components/svgs/ClaimIcon';
import Claimed from '@/Components/svgs/ClaimedIcon';

interface ClaimedButtonProps {
  modelType?: string;
  itemId?: string;
  claimedBy?: number;
  className?: string;
  onClaimSuccess?: () => void;
}

const ClaimedButton: React.FC<ClaimedButtonProps> = ({
  modelType = 'ideascale-profiles',
  itemId = '0',
  claimedBy,
  className = '',
  onClaimSuccess
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localClaimedBy, setLocalClaimedBy] = useState(claimedBy);
  const [buttonState, setButtonState] = useState<'unclaimed' | 'claiming' | 'claimed'>(
    !!claimedBy ? 'claimed' : 'unclaimed'
  );
  
  const { auth } = usePage().props as any;
  const isAuthenticated = auth && auth.user;

  useEffect(() => {
    if (claimedBy !== undefined) {
      setLocalClaimedBy(claimedBy);
      setButtonState(!!claimedBy ? 'claimed' : 'unclaimed');
    }
  }, [claimedBy]);

  const getCsrfToken = (): string => {
    const tokenElement = document.querySelector('meta[name="csrf-token"]');
    return tokenElement ? tokenElement.getAttribute('content') || '' : '';
  };

  const handleClaim = async () => {
    if (!isAuthenticated) {
      console.log('User is not authenticated');
      setError(t('claim.login_required', 'Login required'));
      return;
    }

    if (isLoading || buttonState === 'claimed' || !itemId) return;
    
    setIsLoading(true);
    setButtonState('claiming');
    setError(null);
    
    try {
      console.log(`Claiming profile with ID: ${itemId}`);
      
      setTimeout(() => {
        setLocalClaimedBy(auth?.user?.id || 1);
        setButtonState('claimed');
        setIsLoading(false);
        onClaimSuccess?.();
      }, 1000);
      
      
    } catch (error) {
      console.error('Claim error:', error);
      setError(t('claim.network_error'));
      setButtonState('unclaimed');
      setIsLoading(false);
    }
  };

  return (
    <div className={`claim-button-container ${className}`}>
      {buttonState === 'claimed' ? (
        <Claimed/>
       
      ) : (
        <Claim  onClick={handleClaim}
        />
       
      )}
      
    
      {error && (
        <div
          className="text-red-500 text-sm mt-2"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default ClaimedButton;