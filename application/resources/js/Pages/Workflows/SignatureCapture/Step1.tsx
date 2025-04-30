import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { router } from '@inertiajs/react';
import { generateLocalizedRoute } from '@/utils/localizedRoute';

import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import Button from '@/Components/atoms/Button';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import WorkflowLayout from '../WorkflowLayout';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import { Loader2 } from 'lucide-react';
import Image from '@/Components/Image';

interface Step1Props {
  stepDetails: any[];
  activeStep: number;
}

const Step1: React.FC<Step1Props> = ({ stepDetails, activeStep }) => {
  const { t } = useTranslation();
  const nextStep = generateLocalizedRoute('workflows.signature.index', { step: activeStep + 1 });
  const signMessageRoute = generateLocalizedRoute('workflows.signature.signMessage');

  const {
    isConnecting,
    wallets,
    connectedWallet,
    connectedWalletProvider,
    userAddress,
    stakeKey,
    stakeAddress,
    error,
    CardanoWasm,
    connectWallet,
    disconnectWallet,
    networkName,
    networkId
  } = useConnectWallet();

  const handleConnectWallet = (walletName: string) => {
    connectWallet(walletName);
  };

  const handleNext = () => {
    router.post(signMessageRoute, {
      wallet: connectedWalletProvider?.name || '',
      walletAddress: userAddress,
      network: networkName,
      networkId: networkId ? String(networkId) : null,
      stake_key: stakeKey,
      stake_address: stakeAddress,
    }, {
      onSuccess: () => {
        router.visit(nextStep);
      },
      onError: (errors) => {
        console.error('Wallet connection errors:', errors);
      }
    });
  };

  const formatWalletName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <WorkflowLayout asideInfo={stepDetails[activeStep - 1]?.info || ''}>
      <Nav stepDetails={stepDetails} activeStep={activeStep} />

      <Content>
        <div className="max-w-3xl mx-auto w-full">
          <div className="p-6 rounded-lg">
            <Title level="4" className="mb-6 text-center">
              {t('connectWallet')}
            </Title>

            <Paragraph className="text-center mb-8 text-gray-persist">
              {t('wallet.connect.subtitle')}
            </Paragraph>

            {!CardanoWasm ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 size={24} className="animate-spin text-primary mr-2" />
                <Paragraph size="sm" className="text-content-dark opacity-70">
                  {t('wallet.connect.initializing')}
                </Paragraph>
              </div>
            ) : connectedWallet ? (
              <div className="space-y-4 mt-4 flex flex-col items-center">
                <div className="p-4 flex bg-success-light rounded-lg gap-2 border border-success">
                  <Paragraph className="text-sm text-primary">
                    {t('wallet.connect.connectedTo')}
                  </Paragraph>
                  <div className="flex items-center justify-between">
                    <Paragraph className="font-mono text-sm font-medium text-dark">
                      {userAddress.substring(0, 8)}...{userAddress.substring(userAddress.length - 8)}
                    </Paragraph>
                  </div>
                </div>

                <div className="flex justify-between space-x-4">
                  <Button
                    onClick={disconnectWallet}
                    ariaLabel={t('wallet.connect.disconnect')}
                    className="group flex items-center justify-center p-3 border border-dark rounded-lg hover:border-error transition-colors"
                  >
                    <Paragraph className="text-3 text-content group-hover:text-error">
                      {t('wallet.connect.disconnect')}
                    </Paragraph>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <div className="p-3 mt-4 rounded-lg border border-error max-w-sm mx-auto">
                    <Paragraph className="text-sm text-error text-center">
                      {error}
                    </Paragraph>
                  </div>
                )}

                {wallets.length > 0 ? (
                  <div className="grid gap-4 place-items-center">
                    {wallets.map((walletName) => (
                      <Button
                        key={walletName}
                        onClick={() => handleConnectWallet(walletName)}
                        disabled={isConnecting !== null}
                        className={`group flex items-center justify-between max-w-sm mx-auto p-3 rounded-lg hover:border-primary transition-colors shadow-[0px_4px_8px_var(--cx-background-lighter)] ${isConnecting === walletName ? 'border-primary' : ''}`}
                      >
                        <div className="flex items-center">
                          {window.cardano?.[walletName]?.icon && (
                            <Image
                              imageUrl={window.cardano?.[walletName]?.icon}
                              size="w-6 h-6"
                              className="rounded-full mr-3"
                              alt={`${walletName} icon`}
                            />
                          )}
                          <Paragraph className="text-3 text-content group-hover:text-primary text-left">
                            {window.cardano?.[walletName]?.name || formatWalletName(walletName)} wallet
                          </Paragraph>
                        </div>

                        {isConnecting === walletName && (
                          <Loader2 size={16} className="ml-3 animate-spin text-primary" />
                        )}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center justify-center py-8 text-center">
                    <Paragraph className="mt-2 text-sm text-content">
                      {t('wallet.connect.noWallets.title')}
                    </Paragraph>
                    <Paragraph className="mt-2 text-sm text-content">
                      {t('wallet.connect.noWallets.subtitle')}
                    </Paragraph>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Content>

      <Footer>
        <div></div>
        <PrimaryLink
          href={connectedWallet ? nextStep : ''}
          className="text-sm lg:px-8 lg:py-3"
          disabled={!connectedWallet}
          onClick={(e) => {
            e.preventDefault();
            if (connectedWallet) {
              handleNext();
            }
          }}
        >
          <span>{t('Next')}</span>
          <ChevronRight className="h-4 w-4" />
        </PrimaryLink>

      </Footer>
    </WorkflowLayout>
  );
};

export default Step1;