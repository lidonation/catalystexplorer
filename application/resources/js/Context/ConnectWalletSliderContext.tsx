import React, { createContext, useState, useContext, useEffect } from 'react';
import { CIP30API } from '@/types/wallet';
import WalletSlider from '@/Components/WalletConnectSlider';
import { useTranslation } from 'react-i18next';

interface WalletContextType {
  wallets: string[];
  connectedWallet: CIP30API | null;
  connectedWalletProvider: any | null;
  userAddress: string;
  error: string;
  isConnecting: string | null;
  isWalletConnectorOpen: boolean;
  CardanoWasm: any;
  connectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: () => void;
  setIsConnecting: (value: string | null) => void;
  openConnectWallet: () => void;
  closeConnectWallet: () => void;
}


interface WalletProviderProps {
  children: React.ReactNode;
  onWalletConnected?: (wallet: CIP30API | null, address: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function ConnectWalletProvider({ children, onWalletConnected }: WalletProviderProps) {
  const [wallets, setWallets] = useState<string[]>([]);
  const [connectedWallet, setConnectedWallet] = useState<CIP30API | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [CardanoWasm, setCardanoWasm] = useState<any>(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [connectedWalletProvider, setConnectedWalletProvider] = useState<any | null>(null);
  const { t } = useTranslation();

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
    const lastWallet = localStorage.getItem('lastConnectedWallet');
    if (lastWallet && window.cardano?.[lastWallet] && CardanoWasm) {
      connectWallet(lastWallet);
    }
  }, [CardanoWasm]);

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

      const networkId = await api.getNetworkId();
      if (networkId !== 1) throw new Error(t('wallet.connect.errors.wrongNetwork'));

      const usedAddresses = await api.getUsedAddresses();
      const unusedAddresses = await api.getUnusedAddresses();
      const allAddresses = [...usedAddresses, ...unusedAddresses];

      if (allAddresses.length === 0) {
        throw new Error(t('wallet.connect.errors.noAddresses'));
      }

      const hexAddress = allAddresses[0];
      const address = CardanoWasm.Address.from_hex(hexAddress);
      const bech32Address = address.to_bech32();

      setConnectedWallet(api);
      setUserAddress(bech32Address);
      setConnectedWalletProvider(wallet);

      localStorage.setItem('lastConnectedWallet', walletName);

      setIsSliderOpen(false);

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
    localStorage.removeItem('lastConnectedWallet');
  };

  const resetConnection = () => {
    setConnectedWallet(null);
    setConnectedWalletProvider(null);
    setError('');
    setUserAddress('');
  };

  const handleWalletConnected = (wallet: CIP30API | null, address: string) => {
    onWalletConnected?.(wallet, address);
  };

  return (
    <WalletContext.Provider
      value={{
        wallets,
        connectedWallet,
        userAddress,
        error,
        isConnecting,
        CardanoWasm,
        connectWallet,
        disconnectWallet,
        setIsConnecting,
        openConnectWallet: () => setIsSliderOpen(true),
        closeConnectWallet: () => setIsSliderOpen(false),
        isWalletConnectorOpen: isSliderOpen,
        connectedWalletProvider
      }}
    >
      {children}
      <WalletSlider
        isOpen={isSliderOpen}
        onClose={() => setIsSliderOpen(false)}
        onWalletConnected={handleWalletConnected}
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