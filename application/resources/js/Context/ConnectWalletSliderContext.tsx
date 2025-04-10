import React, { createContext, useState, useContext, useEffect } from 'react';
import { CIP30API } from '@/types/wallet';
import WalletSlider from '@/Components/WalletConnectSlider';
import { useTranslation } from 'react-i18next';
import { usePage } from '@inertiajs/react';
import storageService from '@/utils/storage-service';
interface WalletContextType {
  wallets: string[];
  connectedWallet: CIP30API | null;
  connectedWalletProvider: any | null;
  userAddress: string;
  stakeKey: string;
  error: string;
  isConnecting: string | null;
  isWalletConnectorOpen: boolean;
  CardanoWasm: any;
  networkId: number | null;
  networkName: string;
  connectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: () => void;
  setIsConnecting: (value: string | null) => void;
  openConnectWalletSlider: () => void;
  closeConnectWalletSlider: () => void;
}

interface WalletProviderProps {
  children: React.ReactNode;
  onWalletConnected?: (wallet: CIP30API | null, address: string, networkId: number) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function ConnectWalletProvider({
  children,
  onWalletConnected,
}: WalletProviderProps) {
    const [stakeKey, setStakeKey] = useState<string>('');
  const [wallets, setWallets] = useState<string[]>([]);
  const [connectedWallet, setConnectedWallet] = useState<CIP30API | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [CardanoWasm, setCardanoWasm] = useState<any>(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [connectedWalletProvider, setConnectedWalletProvider] = useState<any | null>(null);
  const [networkId, setNetworkId] = useState<number | null>(null);
  const [networkName, setNetworkName] = useState<string>('');
  const { t } = useTranslation();
  const { environment } = usePage().props;

  useEffect(() => {
    async function initializeWasm() {
      try {
        const CardanoLib = await import('@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib');
        setCardanoWasm(CardanoLib);
      } catch (err) {
        console.error(t('wallet.errors.wasmInitError'), err);
        setError(t('wallet.errors.wasmLibError'));
      }
    }

    initializeWasm();
  }, [t]);

  useEffect(() => {
    const supportedWallets = ['nami', 'eternl', 'flint', 'lace', 'typhon', 'yoroi', 'gerowallet'];
    const detected = supportedWallets.filter(w => window.cardano?.[w]);
    setWallets(detected);
  }, []);

  useEffect(() => {
    const lastWallet = storageService.getLastConnectedWallet();
    if (lastWallet && window.cardano?.[lastWallet] && CardanoWasm) {
      connectWallet(lastWallet);
    }
  }, [CardanoWasm]);

  const getAllowedNetworks = (environment: any): number[] => {
    if (environment === 'production') {
      return [1];
    } else {
      return [0];
    }
  };

  const allowedNetworks = getAllowedNetworks(environment);

  const connectWallet = async (walletName: string) => {
    try {
      if (!CardanoWasm) {
        throw new Error(t('wallet.connect.errors.notInitialized'));
      }

      setError('');
      setIsConnecting(walletName);

      const wallet = window.cardano?.[walletName];

      if (!wallet) throw new Error(t('wallet.connect.errors.walletNotFound', { walletName }));

      const api = await wallet.enable();

      const walletNetworkId = await api.getNetworkId();

      if (!allowedNetworks.includes(walletNetworkId)) {
        const expectedNetwork = environment === 'production' ? 'Mainnet' : 'Preview/Testnet';
        throw new Error(t('wallet.connect.errors.wrongNetwork', {
          expected: expectedNetwork
        }));
      }

      setNetworkId(walletNetworkId);
      setNetworkName(walletNetworkId === 0 ? 'Preview' : 'Mainnet');

      const usedAddresses = await api.getUsedAddresses();
      const unusedAddresses = await api.getUnusedAddresses();
      const allAddresses = [...usedAddresses, ...unusedAddresses];

      if (allAddresses.length === 0) {
        throw new Error(t('wallet.connect.errors.noAddresses'));
      }

      const hexAddress = allAddresses[0];
      const address = CardanoWasm.Address.from_hex(hexAddress);
      const bech32Address = address.to_bech32();

      try {
          const rewardAddresses = await api.getRewardAddresses();

          if (rewardAddresses && rewardAddresses.length > 0) {
              const stakeKeyHex = rewardAddresses[0];
              setStakeKey(stakeKeyHex);
              console.log('Stake key retrieved:', stakeKeyHex);
            } else {
                console.warn('No reward addresses found');
                setStakeKey('');
            }
        } catch (stakeError) {
            console.error('Error getting stake key:', stakeError);
            setStakeKey('');
        }

      setConnectedWallet(api);
      setUserAddress(bech32Address);
      setConnectedWalletProvider(wallet);

      storageService.saveWalletConnection(walletName);

      setIsSliderOpen(false);

      if (onWalletConnected) {
        onWalletConnected(api, bech32Address, walletNetworkId);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : t('wallet.connect.errors.connectionFailed'));
    } finally {
      setIsConnecting(null);
    }
  };

  const disconnectWallet = () => {
    if (connectedWallet && 'disable' in connectedWallet) {
      try {
        (connectedWallet as any).disable();
      } catch (e) {
        console.error(t('wallet.connect.errors.disconnectError'), e);
      }
    }

    resetConnection();
    storageService.clearWalletConnection();
  };

  const resetConnection = () => {
    setConnectedWallet(null);
    setConnectedWalletProvider(null);
    setError('');
    setUserAddress('');
    setStakeKey('')
    setNetworkId(null);
    setNetworkName('');
  };

  return (
    <WalletContext.Provider
      value={{
        wallets,
        connectedWallet,
        userAddress,
          stakeKey,
        error,
        isConnecting,
        CardanoWasm,
        networkId,
        networkName,
        connectWallet,
        disconnectWallet,
        setIsConnecting,
        openConnectWalletSlider: () => setIsSliderOpen(true),
        closeConnectWalletSlider: () => setIsSliderOpen(false),
        isWalletConnectorOpen: isSliderOpen,
        connectedWalletProvider,
      }}
    >
      {children}
      <WalletSlider
        isOpen={isSliderOpen}
        onClose={() => setIsSliderOpen(false)}
        onWalletConnected={(wallet, address) => {
          if (onWalletConnected && networkId !== null) {
            onWalletConnected(wallet, address, networkId);
          }
        }}
      />

    </WalletContext.Provider>
  );
}

export function useConnectWallet() {
  const { t } = useTranslation();
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error(t('wallet.errors.contextError'));
  }
  return context;
}
