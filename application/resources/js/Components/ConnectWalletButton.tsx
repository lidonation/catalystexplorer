import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from './atoms/Button';
import Paragraph from './atoms/Paragraph';
import SecondaryButton from './atoms/SecondaryButton';
import Image from './Image';
import ConnectWalletIcon from './svgs/ConnectWalletIcon';

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
    onClick,
}) => {
    const {
        connectedWalletProvider,
        isConnecting,
        disconnectWallet,
        openConnectWalletSlider,
    } = useConnectWallet();

    const { t } = useTranslation();

    return (
        <div className="mt-4 flex w-full flex-col items-center justify-center">
            <SecondaryButton
                className={`hover:bg-background-lighter flex gap-2 rounded-md px-4 py-1.5 text-sm sm:text-base ${className}`}
                icon={
                    icon ||
                    (connectedWalletProvider && (
                        <Image
                            imageUrl={connectedWalletProvider?.icon}
                            size="w-6 h-6"
                            className="rounded-full"
                            alt={`${connectedWalletProvider?.name || 'Wallet'} icon`}
                        />
                    )) || <ConnectWalletIcon className="bg-background" />
                }
                iconPosition={iconPosition || 'left'}
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
                    : isConnecting
                      ? t('wallet.status.connecting')
                      : t('wallet.connect.title')}
            </SecondaryButton>

            {connectedWalletProvider && (
                <Button
                    onClick={disconnectWallet}
                    ariaLabel={t('wallet.status.disconnect')}
                    disabled={isConnecting !== null}
                    className="group flex flex-col items-center justify-between justify-center rounded-lg p-3"
                >
                    <Paragraph className="text-3 text-content group-hover:text-error">
                        {t('wallet.status.disconnect')}
                    </Paragraph>
                </Button>
            )}
        </div>
    );
};

export default ConnectWalletButton;
