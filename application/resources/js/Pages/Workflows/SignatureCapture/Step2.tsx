import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { generateLocalizedRoute, useLocalizedRoute } from '@/utils/localizedRoute';

import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import WorkflowLayout from '../WorkflowLayout';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';


interface SignatureData {
  stake_key?: string;
  stake_address?: string;
  signature?: string;
  signature_key?: string;
  message?: string;
  wallet_provider?: string;
}

interface Step2Props {
  stepDetails: any[];
  activeStep: number;
  walletData: {
    wallet?: string;
    walletAddress?: string;
    network?: string;
    networkId?: string;
    stake_key?: string;
    stake_address?: string;
  };
  signatureData: SignatureData;
  existingSignatures: any[];
  flash: {
    success?: string;
    error?: string;
  };
}

const Step2: React.FC<Step2Props> = ({
  stepDetails,
  activeStep,
  walletData,
  signatureData,
  existingSignatures,
  flash
}) => {
  const { t } = useTranslation();
  const localizedRoute = useLocalizedRoute;
  const prevStep = localizedRoute('workflows.signature.index', { step: activeStep - 1 });
  const saveSignatureRoute = generateLocalizedRoute('workflows.signature.saveSignature');

  const generateMessage = () => {
    const timestamp = new Date().toISOString();
    const randomNonce = Math.random().toString(36).substring(2, 10);
  
    return JSON.stringify({
      type: t('workflows.signature.verification.title'),
      walletAddress: walletData.walletAddress || 'N/A',
      stakeKey: walletData.stake_key || 'N/A', 
      network: walletData.network || 'N/A',
      nonce: randomNonce,
      timestamp: timestamp
    });
  };

  const [message] = useState(generateMessage);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(flash?.error || null);
  const [success, setSuccess] = useState<string | null>(flash?.success || null);
  const [isComplete, setIsComplete] = useState(!!signatureData?.signature);

  const hasDuplicates = existingSignatures?.length > 1;
  const { extractSignature } = useConnectWallet();

  const handleSignature = async () => {
    setIsSigning(true);
    setError(null);

    try {

      const signatureResult = await extractSignature(message);

      if (!signatureResult) {
        setError(t('workflows.signature.errors.failedToGetSignature'));
        setIsSigning(false);
        return;
      }

      router.post(saveSignatureRoute, {
        signature: signatureResult.signature,
        signature_key: signatureResult.key,
        message: message,
      }, {
        onSuccess: (page) => {
          interface FlashData {
            success?: string;
            error?: string;
          }
          const flashData: FlashData = page.props.flash || {};
          if (flashData.success) {
            setSuccess(flashData.success);
            setError(null);
          } else if (flashData.error) {
            setError(flashData.error);
            setSuccess(null);
          }
          setIsComplete(true);
        },
        onError: (errors) => {
          console.error('Signature errors:', errors);
          setError(t('workflows.signature.errors.failedToSaveSignature', {
            details: Object.values(errors).join(', ')
          }));
        },
        onFinish: () => {
          setIsSigning(false);
        }
      });
    } catch (error) {
      console.error('Error during signature process:', error);
      setError(t('workflows.signature.errors.processingError', {
        details: error instanceof Error ? error.message : t('workflows.signature.errors.unknownError')
      }));
      setIsSigning(false);
    }
  };

  return (
    <WorkflowLayout asideInfo={stepDetails[activeStep - 1]?.info || ''}>
      <Nav stepDetails={stepDetails} activeStep={activeStep} />

      <Content>
        <div className="max-w-3xl mx-auto w-full">
          <div className="p-6 rounded-lg">
            <Title level="4" className="mb-6 text-center">
              {t('workflows.signature.signWallet')}
            </Title>
            <>

              <div className="text-center max-w-sm mx-auto">
                <Paragraph className="mb-4 text-gray-persist">
                  {t('workflows.signature.signAuth')}
                </Paragraph>

                <PrimaryButton
                  className="w-full py-3 mt-4"
                  onClick={handleSignature}
                  disabled={isSigning}
                >
                  {isSigning ? (
                    <div className="flex items-center justify-center">
                      <Loader2 size={16} className="animate-spin mr-2" />
                      {t('workflows.signature.signing')}
                    </div>
                  ) : (
                    t('workflows.signature.signMessage')
                  )}
                </PrimaryButton>

                {error && (
                  <div className="flex flex-col w-full w-full items-center text-error">
                    <div className="flex items-center text-error">
                      <Paragraph className="mb-4 text-sm">
                        {error}
                      </Paragraph>
                    </div>
                  </div>
                )}
              </div>
            </>
          </div>
        </div>
      </Content>

      <Footer>
        <PrimaryLink
          href={prevStep}
          className="text-sm lg:px-8 lg:py-3"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{t('Previous')}</span>
        </PrimaryLink>
      </Footer>
    </WorkflowLayout>
  );
};

export default Step2;