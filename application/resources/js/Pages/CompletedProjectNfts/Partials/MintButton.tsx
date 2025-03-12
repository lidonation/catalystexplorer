import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePage, router, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { PaginatedData } from '../../../../types/paginated-data';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import NMKRNftData = App.DataTransferObjects.NMKRNftData;
import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';

export type MintButtonState = 'unauthenticated' | 'unauthorized' | 'mintable' | 'minted' | 'loading';

interface MintButtonProps {
  nft: any & { 
    metas?: Array<{
      key: string;
      content: string;
    }>;
    minted_at?: string | null;
  };
  ideascaleProfiles?: PaginatedData<IdeascaleProfileData[]>;
}

const MintButton: React.FC<MintButtonProps> = ({ 
  nft,
  ideascaleProfiles
}) => {
  const { t } = useTranslation();
  const { auth } = usePage<PageProps>().props;
  const user = auth?.user;

  const [buttonState, setButtonState] = useState<MintButtonState>('loading');
  const [error, setError] = useState<string | null>(null);

  // Safely parse NMKR metadata
  const parseNmkrMetadata = (): NMKRNftData | null => {
    try {
      const nmkrMetadataRaw = nft.metas?.find((meta: { key: string }) => meta.key === 'nmkr_metadata');
      if (!nmkrMetadataRaw) return null;

      const nmkrMetadata = JSON.parse(nmkrMetadataRaw.content);
      
      const policyKey = Object.keys(nmkrMetadata['721'])[0];
      const nftKey = Object.keys(nmkrMetadata['721'][policyKey])[0];
      
      return nmkrMetadata['721'][policyKey][nftKey]['nftDetails'] as NMKRNftData;
    } catch (e) {
      console.error('Error parsing NMKR metadata:', e);
      return null;
    }
  };

  const getPaymentLink = (): string | null => {
    const nftDetails = parseNmkrMetadata();
    return nftDetails?.paymentGatewayLinkForSpecificSale || null;
  };

  useEffect(() => {
    if (!user) {
      setButtonState('unauthenticated');
      return;
    }

    const nftDetails = parseNmkrMetadata();
    const isMinted = nft.minted_at || nftDetails?.minted || nftDetails?.state === 'sold';

    if (isMinted) {
      setButtonState('minted');
      return;
    }

    if (ideascaleProfiles?.data && ideascaleProfiles.data.length > 0) {
      setButtonState('mintable');
    } else {
      setButtonState('unauthorized');
    }
  }, [user, nft, ideascaleProfiles]);

  const handleMint = (e: React.MouseEvent) => {
    e.preventDefault();
    const paymentUrl = getPaymentLink();
    if (paymentUrl) {
      openPaymentWindow(paymentUrl);
    } else {
      setError('Payment link not available');
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

  const getNftFingerprint = (): string | null => {
    const nftDetails = parseNmkrMetadata();
    return nftDetails?.fingerprint || null;
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
      
      case 'mintable':
        const paymentLink = getPaymentLink();
        
        // If payment link is not available, show disabled button
        if (!paymentLink) {
          return (
            <Button
              className="w-full inline-block text-center bg-dark text-content-light font-medium py-3 px-4 rounded-md cursor-not-allowed pointer-events-none"
              onClick={(e) => e.preventDefault()}
            >
              {t('mintNFT')}
            </Button>
          );
        }
        
        // Show green MINT NFT button
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
        // Show VIEW NFT button linking to pool.pm
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
      {buttonState === 'mintable' && !getPaymentLink() && (
        <Paragraph className="text-sm text-dark mt-2">
          {t('cantFindNFT')}
        </Paragraph>
      )}
    </div>
  );
};

export default MintButton;
