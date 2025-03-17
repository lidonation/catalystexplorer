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
    wallets,
    connectedWallet,
    userAddress,
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

  useEffect(() => {
    if (connectedWallet && userAddress) {
      onWalletConnected(connectedWallet, userAddress);
    }
  }, [connectedWallet, userAddress, onWalletConnected]);

  const handleDisconnectWallet = () => {
    disconnectWallet();
    onWalletConnected(null, '');
  };

  const formatWalletName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

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
      ) : connectedWallet ? (
        <div className="space-y-4 mt-4">
          <div className="p-4 bg-success-light rounded-lg border border-success ">
            <Paragraph className="text-sm  text-primary">
              {t('wallet.connect.connectedTo')}
            </Paragraph>
            <div className="flex items-center justify-between mt-2">
              <Paragraph className="font-mono text-sm font-medium text-dark">
                {userAddress.substring(0, 8)}...{userAddress.substring(userAddress.length - 8)}
              </Paragraph>
            </div>
          </div>
          <Button
            onClick={handleDisconnectWallet}
            ariaLabel={t('wallet.connect.disconnect')}
            disabled={isConnecting !== null}
            className={`group flex flex-col items-center justify-center justify-between w-full p-3 border border-dark rounded-lg hover:border-error transition-colors`}
          >
            <Paragraph className="text-3 text-content group-hover:text-error">
              {t('wallet.connect.disconnect')}
            </Paragraph>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-3 mt-4 rounded-lg border border-error flex items-start">
              <Paragraph className="ml-2 text-sm text-error ">
                {error}
              </Paragraph>
            </div>
          )}

          {wallets.length > 0 ? (
            <div className="grid gap-4">
              <div className="flex mt-4 w-full items-center justify-center">
                <Paragraph className="text-sm text-content font-bold">
                  {t('wallet.connect.selectWallet')}
                </Paragraph>
              </div>

              {wallets.map((walletName) => (
                <Button
                  key={walletName}
                  onClick={() => connectWallet(walletName)}
                  disabled={isConnecting !== null}
                  className={`group flex items-center justify-between w-full p-3 rounded-lg hover:border-primary transition-colors shadow-[0px_4px_8px_var(--cx-background-lighter)] ${isConnecting === walletName ? 'border-primary' : ''
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
    </ModalSidebar>
  );
}