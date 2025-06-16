import React, { createContext, useState, useContext, useEffect } from 'react';
import { CIP30API } from '@/types/wallet';
import WalletSlider from '@/Components/WalletConnectSlider';
import { useTranslation } from 'react-i18next';
import { usePage } from '@inertiajs/react';
import storageService from '@/utils/storage-service';

interface ConnectedWalletInfo {
  id: string;
  name: string;
  api: CIP30API;
  provider: any;
  userAddress: string;
  stakeKey: string;
  stakeAddress: string;
  networkId: number;
  networkName: string;
  connectedAt: Date;
}

interface WalletContextType {
  availableWallets: string[];
  connectedWallets: ConnectedWalletInfo[];
  error: string;
  isConnecting: string | null;
  isWalletConnectorOpen: boolean;
  CardanoWasm: any;
  connectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: (walletId: string) => void;
  disconnectAllWallets: () => void;
  setIsConnecting: (value: string | null) => void;
  openConnectWalletSlider: () => void;
  closeConnectWalletSlider: () => void;
  extractSignature: (message: string, walletId?: string) => Promise<{signature: string, key: string} | null>;
  getWalletById: (walletId: string) => ConnectedWalletInfo | null;

  wallets: string[];
  connectedWallet: CIP30API | null; // First connected wallet's API
  connectedWalletProvider: any | null; // First connected wallet's provider
  userAddress: string; // First connected wallet's address
  stakeKey: string; // First connected wallet's stake key
  stakeAddress: string; // First connected wallet's stake address
  networkId: number | null; // First connected wallet's network ID
  networkName: string;
}

interface WalletProviderProps {
  children: React.ReactNode;
  onWalletConnected?: (wallet: ConnectedWalletInfo) => void;
  onWalletDisconnected?: (walletId: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function ConnectWalletProvider({
  children,
  onWalletConnected,
  onWalletDisconnected,
}: WalletProviderProps) {
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWalletInfo[]>([]);
  const [error, setError] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [CardanoWasm, setCardanoWasm] = useState<any>(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const { t } = useTranslation();
  const { environment } = usePage().props;
  const primaryWallet = connectedWallets[0] || null;
    const unconnectedWallets = availableWallets.filter(walletName =>
      !connectedWallets.some(connected => connected.name === walletName)
      );

  const deriveStakeAddress = (hexStakeAddressBytes: string, isTestnet: boolean): string => {
    try {
      if (!CardanoWasm || !hexStakeAddressBytes) {
        return '';
      }
      const hexPairs = hexStakeAddressBytes.match(/.{1,2}/g) || [];
      const addressBytes = new Uint8Array(hexPairs.map(byte => parseInt(byte, 16)));

      try {
        const address = CardanoWasm.Address.from_bytes(addressBytes);
        const bech32Address = address.to_bech32();
        return bech32Address;
      } catch (error) {
        console.warn('Could not parse as Address, trying as RewardAddress:', error);

        try {
          const rewardAddress = CardanoWasm.RewardAddress.from_bytes(addressBytes);
          const bech32Address = rewardAddress.to_address().to_bech32();
          return bech32Address;
        } catch (error2) {
          console.warn('Could not parse as RewardAddress either:', error2);
          const prefix = isTestnet ? 'stake_test1' : 'stake1';
          const simplifiedAddress = `${prefix}${hexStakeAddressBytes}`;
          console.log('Using simplified stake address (fallback):', simplifiedAddress);
          return simplifiedAddress;
        }
      }
    } catch (error) {
      console.error('Error deriving stake address:', error);
      const prefix = isTestnet ? 'stake_test1' : 'stake1';
      return `${prefix}${hexStakeAddressBytes}`;
    }
  };

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
    setAvailableWallets(detected);
  }, []);

  useEffect(() => {
    // Load previously connected wallets from storage
    if (CardanoWasm) {
      const savedWallets = storageService.getConnectedWallets();
      if (savedWallets && savedWallets.length > 0) {
        savedWallets.forEach(walletName => {
          if (window.cardano?.[walletName]) {
            connectWallet(walletName);
          }
        });
      }
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

  const generateWalletId = (walletName: string, userAddress: string): string => {
    return `${walletName}-${userAddress.substring(0, 8)}`;
  };

  const extractSignature = async (message: string, walletId?: string) => {
    try {
      let targetWallet: ConnectedWalletInfo | null = null;

      if (walletId) {
        targetWallet = connectedWallets.find(w => w.id === walletId) || null;
      } else {
        // Use the first connected wallet if no specific wallet is specified
        targetWallet = connectedWallets[0] || null;
      }

      if (!targetWallet) {
        throw new Error(t('wallet.errors.notConnected'));
      }

      const encoder = new TextEncoder();
      const messageBytes = encoder.encode(message);
      const messageHex = Array.from(messageBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (!targetWallet.userAddress) {
        throw new Error(t('wallet.errors.noAddresses'));
      }

      let addressToSignWith;
      if (targetWallet.userAddress.startsWith('addr')) {
        addressToSignWith = CardanoWasm.Address.from_bech32(targetWallet.userAddress).to_hex();
      } else {
        addressToSignWith = targetWallet.userAddress;
      }

      const signatureResult = await targetWallet.api.signData(
        addressToSignWith,
        messageHex
      );

      return {
        signature: signatureResult.signature,
        key: signatureResult.key
      };
    } catch (error) {
      console.error('Error extracting signature:', error);
      setError(error instanceof Error ? error.message : t('wallet.errors.signFailed'));
      return null;
    }
  };

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

      const usedAddresses = await api.getUsedAddresses();
      const unusedAddresses = await api.getUnusedAddresses();
      const allAddresses = [...usedAddresses, ...unusedAddresses];

      if (allAddresses.length === 0) {
        throw new Error(t('wallet.connect.errors.noAddresses'));
      }

      const hexAddress = allAddresses[0];
      const address = CardanoWasm.Address.from_hex(hexAddress);
      const bech32Address = address.to_bech32();

      // Check if this wallet is already connected
      const existingWallet = connectedWallets.find(w =>
        w.name === walletName && w.userAddress === bech32Address
      );

      if (existingWallet) {
        throw new Error(t('wallet.connect.errors.alreadyConnected'));
      }

      let stakeKey = '';
      let derivedStakeAddress = '';

      try {
        const rewardAddresses = await api.getRewardAddresses();

        if (rewardAddresses && rewardAddresses.length > 0) {
          stakeKey = rewardAddresses[0];
          console.log('Stake key retrieved:', stakeKey);
          const isTestnet = walletNetworkId === 0;
          derivedStakeAddress = deriveStakeAddress(stakeKey, isTestnet);
        } else {
          console.warn('No reward addresses found');
        }
      } catch (stakeError) {
        console.error('Error getting stake key:', stakeError);
      }

      const walletId = generateWalletId(walletName, bech32Address);
      const newWallet: ConnectedWalletInfo = {
        id: walletId,
        name: walletName,
        api,
        provider: wallet,
        userAddress: bech32Address,
        stakeKey,
        stakeAddress: derivedStakeAddress,
        networkId: walletNetworkId,
        networkName: walletNetworkId === 0 ? 'Preview' : 'Mainnet',
        connectedAt: new Date(),
      };

      setConnectedWallets(prev => [...prev, newWallet]);

      // Save to storage
      const updatedWalletNames = [...connectedWallets.map(w => w.name), walletName];
      storageService.saveConnectedWallets(updatedWalletNames);

      setIsSliderOpen(false);

      if (onWalletConnected) {
        onWalletConnected(newWallet);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : t('wallet.connect.errors.connectionFailed'));
    } finally {
      setIsConnecting(null);
    }
  };

  const disconnectWallet = (walletId: string) => {
    const wallet = connectedWallets.find(w => w.id === walletId);

    if (wallet) {
      if (wallet.api && 'disable' in wallet.api) {
        try {
          (wallet.api as any).disable();
        } catch (e) {
          console.error(t('wallet.connect.errors.disconnectError'), e);
        }
      }

      setConnectedWallets(prev => prev.filter(w => w.id !== walletId));

      // Update storage
      const remainingWalletNames = connectedWallets
        .filter(w => w.id !== walletId)
        .map(w => w.name);
      storageService.saveConnectedWallets(remainingWalletNames);

      if (onWalletDisconnected) {
        onWalletDisconnected(walletId);
      }
    }
  };

  const disconnectAllWallets = () => {
    connectedWallets.forEach(wallet => {
      if (wallet.api && 'disable' in wallet.api) {
        try {
          (wallet.api as any).disable();
        } catch (e) {
          console.error(t('wallet.connect.errors.disconnectError'), e);
        }
      }
    });

    setConnectedWallets([]);
    storageService.clearAllWalletConnections();
  };

  const getWalletById = (walletId: string): ConnectedWalletInfo | null => {
    return connectedWallets.find(w => w.id === walletId) || null;
  };

  return (
    <WalletContext.Provider
      value={{
        availableWallets: unconnectedWallets,
        connectedWallets,
        error,
        isConnecting,
        CardanoWasm,
        connectWallet,
        disconnectWallet,
        disconnectAllWallets,
        setIsConnecting,
        openConnectWalletSlider: () => setIsSliderOpen(true),
        closeConnectWalletSlider: () => setIsSliderOpen(false),
        isWalletConnectorOpen: isSliderOpen,
        extractSignature,
        getWalletById,

        wallets: unconnectedWallets,
        connectedWallet: primaryWallet?.api || null,
        connectedWalletProvider: primaryWallet?.provider || null,
        userAddress: primaryWallet?.userAddress || '',
        stakeKey: primaryWallet?.stakeKey || '',
        stakeAddress: primaryWallet?.stakeAddress || '',
        networkId: primaryWallet?.networkId || null,
        networkName: primaryWallet?.networkName || '',
      }}
    >
      {children}
      <WalletSlider
        isOpen={isSliderOpen}
        onClose={() => setIsSliderOpen(false)}
        onWalletConnected={(wallet) => {
          // Wallet connection is handled in connectWallet function
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
