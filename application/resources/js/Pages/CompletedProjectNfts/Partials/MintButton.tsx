import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePage, router, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { PaginatedData } from '../../../../types/paginated-data';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import NMKRMetaData = App.DataTransferObjects.NMKRNftData;
import NftData = App.DataTransferObjects.NftData;
import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';

export type MintButtonState = 'unauthenticated' | 'unauthorized' | 'mintable' | 'minted' | 'reserved' | 'loading';

interface MintButtonProps {
  nft: NftData;
  metadata: NMKRMetaData;
  ideascaleProfiles?: PaginatedData<IdeascaleProfileData[]>;
  claimedProfile: IdeascaleProfileData;
}

const MintButton: React.FC<MintButtonProps> = ({ 
  nft,
  metadata,
  claimedProfile,
}) => {
  const { t } = useTranslation();
  const { auth } = usePage<PageProps>().props;
  const user = auth?.user;

  const [buttonState, setButtonState] = useState<MintButtonState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string>('');

  // Format countdown timer similar to Vue implementation
  const formatCountdown = (reserveduntil: string): string => {
    const now = new Date().getTime();
    const reservedUntilDate = new Date(reserveduntil + 'Z').getTime();
    const timeDifference = reservedUntilDate - now;

    if (timeDifference <= 0) {
      return t('available');
    }

    const seconds = Math.floor((timeDifference / 1000) % 60);
    const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
    const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (buttonState === 'reserved' && metadata?.reserveduntil) {
      const updateCountdown = () => {
        setCountdown(formatCountdown(metadata.reserveduntil as string));
      };
      
      updateCountdown();
      
      timer = setInterval(updateCountdown, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [buttonState, metadata?.reserveduntil]);

  useEffect(() => {
    if (!user) {
      setButtonState('unauthenticated');
      return;
    }

    // Check if NFT is already minted
    const isMinted = nft?.minted_at || (metadata?.state === 'sold' || metadata?.state === 'minted');
    
    // Check if NFT is reserved
    const isReserved = metadata?.state === 'reserved' ||
                      (metadata?.reserveduntil && new Date(metadata.reserveduntil + 'Z') > new Date());

    if (isMinted) {
      setButtonState('minted');
      return;
    }
    
    if (isReserved) {
      setButtonState('reserved');
      return;
    }

    // Only allow minting if user has claimed profile and NFT state is "free"
    if (claimedProfile && metadata?.state === 'free') {
      setButtonState('mintable');
    } else {
      setButtonState('unauthorized');
    }
  }, [user, nft, metadata, claimedProfile]);

  const getPaymentLink = (): string | null => {
    return metadata?.paymentGatewayLinkForSpecificSale || null;
  };

  const getNftFingerprint = (): string | null => {
    return metadata?.fingerprint || null;
  };

  const handleMint = (e: React.MouseEvent) => {
    e.preventDefault();
    const paymentUrl = getPaymentLink();
    if (paymentUrl) {
      openPaymentWindow(paymentUrl);
    } else {
      setError('Payment link not available!');
    }
  };

  const openPaymentWindow = (paymentUrl: string) => {
    // Specify the popup width and height
    const popupWidth = 500;
    const popupHeight = 700;

    // Calculate the center of the screen
    let left = 0;
    let top = 0;
    
    if (window.top) {
      left = window.top.outerWidth / 2 + window.top.screenX - (popupWidth / 2);
      top = window.top.outerHeight / 2 + window.top.screenY - (popupHeight / 2);
    } else {
      left = window.outerWidth / 2 + window.screenX - (popupWidth / 2);
      top = window.outerHeight / 2 + window.screenY - (popupHeight / 2);
    }

    const popup = window.open(
      paymentUrl, 
      t('paymentGateway'),
      `popup=1, location=1, width=${popupWidth}, height=${popupHeight}, left=${left}, top=${top}`
    );

    document.body.style.background = "var(--cx-border-color-dark)";

    const backgroundCheck = setInterval(function () {
      if (popup && popup.closed) {
        clearInterval(backgroundCheck);

        document.body.style.background = "";
        
        router.reload();
      }
    }, 1000);
  };

  const renderButton = () => {
    switch (buttonState) {
      case 'loading':
        return (
          <Button
            className="w-full inline-block text-center bg-dark text-dark font-medium py-3 px-4 rounded-md cursor-wait pointer-events-none"
            onClick={(e) => e.preventDefault()}
          >
            {t('loading')}
          </Button>
        );

      case 'unauthenticated':
        return (
          <Link 
            href="/login"
            className="w-full inline-block text-center bg-primary hover:bg-primary-dark text-content-light font-medium py-3 px-4 rounded-md transition duration-150"
          >
            {t('loginToMint')}
          </Link>
        );
      
      case 'unauthorized':
        return (
          <Button
            className="w-full inline-block text-center bg-dark text-content font-medium py-3 px-4 rounded-md cursor-not-allowed pointer-events-none"
            onClick={(e) => e.preventDefault()}
          >
            {t('mustBeProposer')}
          </Button>
        );
      
      case 'reserved':
        return (
          <Button
            className="w-full inline-block text-center bg-dark text-content-light font-medium py-3 px-4 rounded-md cursor-not-allowed pointer-events-none"
            onClick={(e) => e.preventDefault()}
          >
            {t('completedProjectNfts.paymentPending')}
          </Button>
        );
      
      case 'mintable':
        return (
          <Button
            onClick={handleMint}
            className="w-full inline-block text-center bg-success hover:bg-success-darker text-content-light font-medium py-3 px-4 rounded-md transition duration-150"
          >
            {t('mintNFT')}
          </Button>
        );
      
      case 'minted':
        const fingerprint = getNftFingerprint();
        return (
          <Link 
            href={`https://pool.pm/${fingerprint}`}
            target="_blank"
            className="w-full inline-block text-center bg-primary hover:bg-primary-dark text-content font-medium py-3 px-4 rounded-md transition duration-150"
          >
            {t('viewNFT')}
          </Link>
        );
    }
  };

  return (
    <div className="w-full">      
      <div className="rounded-lg">
        {renderButton()}
      </div>
      {error && (
        <Paragraph className="text-sm text-error mt-2">
          {error}
        </Paragraph>
      )}
      {buttonState === 'mintable' && !getPaymentLink() && (
        <Paragraph className="text-sm text-dark mt-2">
          {t('cantFindNFT')}
        </Paragraph>
      )}
      {buttonState === 'reserved' && (
        <div className="mt-2">
          {countdown && (
            <div className="flex items-center gap-1 mt-1">
              <svg
                className="w-4 h-4 text-warning"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <Paragraph className="text-sm font-medium">
                {t('completedProjectNfts.reservedUntil')}: {countdown}
              </Paragraph>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MintButton;
