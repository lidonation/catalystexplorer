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
  
  // Get auth state from Inertia page props
  const { auth } = usePage().props as any;
  const isAuthenticated = auth && auth.user;

  // Update local state if prop changes
  useEffect(() => {
    if (claimedBy !== undefined) {
      setLocalClaimedBy(claimedBy);
      setButtonState(!!claimedBy ? 'claimed' : 'unclaimed');
    }
  }, [claimedBy]);

  // Get CSRF token from meta tag
  const getCsrfToken = (): string => {
    const tokenElement = document.querySelector('meta[name="csrf-token"]');
    return tokenElement ? tokenElement.getAttribute('content') || '' : '';
  };

  const handleClaim = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Simply log that authentication is required - no redirect
      console.log('User is not authenticated');
      setError(t('claim.login_required', 'Login required'));
      return;
    }

    // Prevent multiple simultaneous claim attempts
    if (isLoading || buttonState === 'claimed' || !itemId) return;
    
    setIsLoading(true);
    setButtonState('claiming');
    setError(null);
    
    try {
      // Use simulation for now while API is being fixed
      console.log(`Claiming profile with ID: ${itemId}`);
      
      // Simulate a successful claim after a short delay
      setTimeout(() => {
        setLocalClaimedBy(auth?.user?.id || 1);
        setButtonState('claimed');
        setIsLoading(false);
        onClaimSuccess?.();
      }, 1000);
      
      // When the API is fixed, use this implementation:
      /*
      const endpoint = `/api/ideascale-profiles/${itemId}/claim`;
      
      // Try with GET method since POST is giving 405
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        try {
          const data = await response.json();
          setLocalClaimedBy(data.claimedBy || data.user_id || auth?.user?.id || 1);
          setButtonState('claimed');
          onClaimSuccess?.();
        } catch (jsonError) {
          console.log('Response was not JSON but request succeeded');
          setLocalClaimedBy(auth?.user?.id || 1);
          setButtonState('claimed');
          onClaimSuccess?.();
        }
      } else {
        const errorText = await response.text();
        if (errorText.trim().startsWith('{')) {
          const errorData = JSON.parse(errorText);
          setError(errorData.message || t('claim.generic_error'));
        } else {
          setError(t('claim.generic_error'));
        }
        setButtonState('unclaimed');
      }
      */
    } catch (error) {
      console.error('Claim error:', error);
      setError(t('claim.network_error'));
      setButtonState('unclaimed');
      setIsLoading(false);
    }
  };


  // Render based on current state
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