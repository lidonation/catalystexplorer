import Image from '@/Components/Image';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import capitalizeFirstLetter from '@/utils/caps';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Loader2 } from 'lucide-react';
import Button from './atoms/Button';
import Paragraph from './atoms/Paragraph';
import Title from './atoms/Title';

const ConnectWalletList = () => {
    const { t } = useLaravelReactI18n();
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

    const handleConnectWallet = (walletName: string) => {
        connectWallet(walletName);
    };
    return (
        <div className="mx-auto flex flex-col items-center justify-center">
            <Title level="4" className="mb-6 text-center">
                {t('connectWallet')}
            </Title>

            <Paragraph className="text-gray-persist mb-8 text-center">
                {t('wallet.connect.subtitle')}
            </Paragraph>

            {!CardanoWasm ? (
                <div className="flex h-24 items-center justify-center">
                    <Loader2
                        size={24}
                        className="text-primary mr-2 animate-spin"
                    />
                    <Paragraph
                        size="sm"
                        className="text-content-dark opacity-70"
                    >
                        {t('wallet.connect.initializing')}
                    </Paragraph>
                </div>
            ) : connectedWallet ? (
                <div className="mt-4 flex flex-col items-center space-y-4">
                    <div className="bg-success-light border-success flex gap-2 rounded-lg border p-4">
                        <Paragraph className="text-primary text-sm">
                            {t('wallet.connect.connectedTo')}
                        </Paragraph>
                        <div className="flex items-center justify-between">
                            <Paragraph className="text-dark font-mono text-sm font-medium">
                                {userAddress.substring(0, 8)}...
                                {userAddress.substring(userAddress.length - 8)}
                            </Paragraph>
                        </div>
                    </div>

                    <div className="flex justify-between space-x-4">
                        <Button
                            onClick={disconnectWallet}
                            ariaLabel={t('wallet.connect.disconnect')}
                            className="group border-dark hover:border-error flex items-center justify-center rounded-lg border p-3 transition-colors"
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
                        <div className="border-error mx-auto mt-4 max-w-sm rounded-lg border p-3">
                            <Paragraph className="text-error text-center text-sm">
                                {error}
                            </Paragraph>
                        </div>
                    )}

                    {wallets.length > 0 ? (
                        <div className="grid place-items-center gap-4">
                            {wallets.map((walletName) => (
                                <Button
                                    key={walletName}
                                    onClick={() =>
                                        handleConnectWallet(walletName)
                                    }
                                    disabled={isConnecting !== null}
                                    className={`group hover:border-primary mx-auto flex w-full max-w-sm items-center justify-between rounded-lg p-3 shadow-[0px_4px_8px_var(--cx-background-lighter)] transition-colors ${isConnecting === walletName ? 'border-primary' : ''}`}
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
                                                capitalizeFirstLetter(
                                                    walletName,
                                                )}{' '}
                                            wallet
                                        </Paragraph>
                                    </div>

                                    {isConnecting === walletName && (
                                        <Loader2
                                            size={16}
                                            className="text-primary ml-3 animate-spin"
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
        </div>
    );
};

export default ConnectWalletList;
