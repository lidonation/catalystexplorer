import { useEffect } from 'react';
import { CIP30API } from '@/types/wallet';
import { Loader2 } from 'lucide-react';
import Button from './atoms/Button';
import Paragraph from './atoms/Paragraph';
import ModalSidebar from './layout/ModalSidebar';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import Image from './Image';
import { useTranslation } from 'react-i18next';

export default function WalletSlider({
  isOpen,
  onClose,
  onWalletConnected,
}: {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected: (wallet: CIP30API | null, address: string) => void;
}) {
  const {
    isConnecting,
    availableWallets,
    connectedWallets,
    error,
    CardanoWasm,
    connectWallet,
    disconnectWallet,
  } = useConnectWallet();

  const { t } = useTranslation();

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  const formatWalletName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const handleDisconnectWallet = (walletId: string) => {
    disconnectWallet(walletId);
    // Note: This callback might need to be updated based on your parent component needs
    onWalletConnected(null, '');
  };

  return (
    <ModalSidebar
      isOpen={isOpen}
      title={t('wallet.connect.title')}
      onClose={onClose}
    >
      {!CardanoWasm ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 size={24} className="animate-spin text-primary" />
          <Paragraph size="sm" className="text-4 text-content-dark opacity-70">
            {t('wallet.connect.initializing')}
          </Paragraph>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Connected Wallets Section */}
          {connectedWallets.length > 0 && (
            <div className="space-y-4">
              <div className="space-y-3">
                {connectedWallets.map((wallet) => (
                  <div key={wallet.id} className="p-4 bg-success-light rounded-lg border border-success">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {window.cardano?.[wallet.name]?.icon && (
                          <Image
                            imageUrl={window.cardano?.[wallet.name]?.icon}
                            size="w-6 h-6"
                            className="rounded-full"
                            alt={`${wallet.name} icon`}
                          />
                        )}
                        <div>
                          <Paragraph className="text-sm font-medium text-primary">
                            {window.cardano?.[wallet.name]?.name || formatWalletName(wallet.name)}
                          </Paragraph>
                          <Paragraph className="text-xs text-content-dark opacity-70">
                            {wallet.networkName} • Connected {wallet.connectedAt.toLocaleTimeString()}
                          </Paragraph>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleDisconnectWallet(wallet.id)}
                        className="text-xs px-2 py-1 text-error hover:bg-error hover:text-white border border-error rounded transition-colors"
                      >
                        {t('wallet.connect.disconnect')}
                      </Button>
                    </div>

                    <div className="mt-2">
                      <Paragraph className="font-mono text-sm text-dark">
                        {wallet.userAddress.substring(0, 12)}...{wallet.userAddress.substring(wallet.userAddress.length - 8)}
                      </Paragraph>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-lg border border-error flex items-start">
              <Paragraph className="ml-2 text-sm text-error">
                {error}
              </Paragraph>
            </div>
          )}

          {/* Available Wallets Section */}
          {availableWallets.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Paragraph className="text-sm text-content font-bold">
                  {connectedWallets.length > 0
                    ? t('wallet.connect.addAnotherWallet')
                    : t('wallet.connect.selectWallet')
                  }
                </Paragraph>
              </div>

              <div className="grid gap-3">
                {availableWallets.map((walletName) => (
                  <Button
                    key={walletName}
                    onClick={() => connectWallet(walletName)}
                    disabled={isConnecting !== null}
                    className={`group flex items-center justify-between w-full p-3 rounded-lg hover:border-primary transition-colors shadow-[0px_4px_8px_var(--cx-background-lighter)] ${
                      isConnecting === walletName ? 'border-primary' : ''
                    }`}
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
                        {window.cardano?.[walletName]?.name || formatWalletName(walletName)}
                      </Paragraph>
                    </div>

                    {isConnecting === walletName && (
                      <Loader2 size={16} className="animate-spin text-primary" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          ) : connectedWallets.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center py-8 text-center">
              <Paragraph className="mt-2 text-sm text-content">
                {t('wallet.connect.noWallets.title')}
              </Paragraph>
              <Paragraph className="mt-2 text-sm text-content">
                {t('wallet.connect.noWallets.subtitle')}
              </Paragraph>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-4 text-center">
              <Paragraph className="text-sm text-content">
                {t('wallet.connect.allWalletsConnected')}
              </Paragraph>
            </div>
          )}
        </div>
      )}
    </ModalSidebar>
  );
}
