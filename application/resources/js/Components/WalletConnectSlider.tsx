import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import { CIP30API } from '@/types/wallet';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import Button from './atoms/Button';
import Paragraph from './atoms/Paragraph';
import Image from './Image';
import Modal from './layout/Modal.tsx';

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

    const { t } = useLaravelReactI18n();

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
        <Modal
            isOpen={isOpen}
            title={t('wallet.connect.title')}
            onClose={onClose}
        >
            {!CardanoWasm ? (
                <div className="flex h-full items-center justify-center">
                    <Loader2 size={24} className="text-primary animate-spin" />
                    <Paragraph
                        size="sm"
                        className="text-4 text-content-dark opacity-70"
                    >
                        {t('wallet.connect.initializing')}
                    </Paragraph>
                </div>
            ) : connectedWallet ? (
                <div className="mt-4 space-y-4">
                    <div className="bg-success-light border-success rounded-lg border p-4">
                        <Paragraph className="text-primary text-sm">
                            {t('wallet.connect.connectedTo')}
                        </Paragraph>
                        <div className="mt-2 flex items-center justify-between">
                            <Paragraph className="text-dark font-mono text-sm font-medium">
                                {userAddress.substring(0, 8)}...
                                {userAddress.substring(userAddress.length - 8)}
                            </Paragraph>
                        </div>
                    </div>
                    <Button
                        onClick={handleDisconnectWallet}
                        ariaLabel={t('wallet.connect.disconnect')}
                        disabled={isConnecting !== null}
                        className={`group border-dark hover:border-error flex w-full flex-col items-center justify-between justify-center rounded-lg border p-3 transition-colors`}
                    >
                        <Paragraph className="text-3 text-content group-hover:text-error">
                            {t('wallet.connect.disconnect')}
                        </Paragraph>
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {error && (
                        <div className="border-error mt-4 flex items-start rounded-lg border p-3">
                            <Paragraph className="text-error ml-2 text-sm">
                                {error}
                            </Paragraph>
                        </div>
                    )}

                    {wallets.length > 0 ? (
                        <div className="grid gap-4">
                            <div className="mt-4 flex w-full items-center justify-center">
                                <Paragraph className="text-content text-sm font-bold">
                                    {t('wallet.connect.selectWallet')}
                                </Paragraph>
                            </div>

                            {wallets.map((walletName) => (
                                <Button
                                    key={walletName}
                                    onClick={() => connectWallet(walletName)}
                                    disabled={isConnecting !== null}
                                    className={`group hover:border-primary flex w-full items-center justify-between rounded-lg p-3 shadow-[0px_4px_8px_var(--cx-background-lighter)] transition-colors ${isConnecting === walletName ? 'border-primary' : ''}`}
                                    dataTestId={`walletconnect-${walletName}-button`}
                                >
                                    <div className="flex items-center">
                                        {window.cardano?.[walletName]?.icon && (
                                            <Image
                                                imageUrl={
                                                    window.cardano?.[walletName]
                                                        ?.icon
                                                }
                                                size="w-6 h-6"
                                                className="mr-3 rounded-full"
                                                alt={`${walletName} icon`}
                                            />
                                        )}
                                        <Paragraph className="text-3 text-content group-hover:text-primary text-left">
                                            {window.cardano?.[walletName]
                                                ?.name ||
                                                formatWalletName(walletName)}
                                        </Paragraph>
                                    </div>

                                    {isConnecting === walletName && (
                                        <Loader2
                                            size={16}
                                            className="text-primary animate-spin"
                                        />
                                    )}
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex w-full flex-col items-center justify-center py-8 text-center">
                            <Paragraph className="text-content mt-2 text-sm">
                                {t('wallet.connect.noWallets.title')}
                            </Paragraph>
                            <Paragraph className="text-content mt-2 text-sm">
                                {t('wallet.connect.noWallets.subtitle')}
                            </Paragraph>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}
