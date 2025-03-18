import React from 'react';
import SecondaryButton from './atoms/SecondaryButton';
import Button from './atoms/Button';
import Paragraph from './atoms/Paragraph';
import ConnectWalletIcon from './svgs/ConnectWalletIcon';
import { useTranslation } from 'react-i18next';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import Image from './Image';

interface ConnectWalletButtonProps {
    className?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    onClick?: () => void;
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
    className = '',
    icon,
    iconPosition = 'left',
    onClick
}) => {
    
    const { 
        wallets,
        connectedWallet,
        connectedWalletProvider,
        userAddress,
        error,
        isConnecting,
        isWalletConnectorOpen,
        CardanoWasm,
        networkId,
        networkName,
        connectWallet,
        disconnectWallet,
        setIsConnecting,
        openConnectWalletSlider,
        closeConnectWalletSlider,
    } = useConnectWallet();

    const { t } = useTranslation();

    return (
        <div className="mt-4 flex flex-col justify-center items-center w-full">
            <SecondaryButton
                className={`hover:bg-background-lighter flex gap-2 rounded-md px-4 py-1.5 text-sm sm:text-base ${className}`}
                icon={icon || (connectedWalletProvider && <Image
                    imageUrl={connectedWalletProvider?.icon}
                    size="w-6 h-6"
                    className="rounded-full"
                    alt={`${connectedWalletProvider?.name || 'Wallet'} icon`}
                />) || <ConnectWalletIcon className="bg-background" />}
                iconPosition={iconPosition || "left"}
                type="button"
                disabled={!!isConnecting}
                onClick={() => {
                    if (!connectedWalletProvider) {
                        openConnectWalletSlider();
                        onClick?.();
                    }
                }}
            >
                {connectedWalletProvider
                    ? t('wallet.status.connected')
                    : (isConnecting
                        ? t('wallet.status.connecting')
                        : t('wallet.connect.title')
                    )}

            </SecondaryButton>

            {connectedWalletProvider &&
                <Button
                    onClick={disconnectWallet}
                    ariaLabel={t('wallet.status.disconnect')}
                    disabled={isConnecting !== null}
                    className="group flex flex-col items-center justify-center justify-between p-3 rounded-lg"
                >
                    <Paragraph className="text-3 text-content group-hover:text-error">
                        {t('wallet.status.disconnect')}
                    </Paragraph>
                </Button>}
        </div>
    );
};

export default ConnectWalletButton;