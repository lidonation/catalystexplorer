import { StorageKeys } from "@/enums/storage-keys-enums";

export interface WalletPreferences {
  autoConnect: boolean;
  lastConnected?: string;
  theme?: string;
}

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // --- Generic Methods ---

  public save<T>(key: StorageKeys, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error saving to localStorage with key ${key}:`, error);
    }
  }

  public get<T>(key: StorageKeys, defaultValue?: T): T | null {
    try {
      const value = localStorage.getItem(key);
      if (value === null) {
        return defaultValue ?? null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error retrieving from localStorage with key ${key}:`, error);
      return defaultValue ?? null;
    }
  }

  public remove(key: StorageKeys): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage with key ${key}:`, error);
    }
  }

  public clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  public exists(key: StorageKeys): boolean {
    return localStorage.getItem(key) !== null;
  }

  // --- Wallet Connection Methods ---

  public saveConnectedWallets(walletNames: string[]): void {
    const uniqueWalletNames = [...new Set(walletNames)];
    this.save(StorageKeys.CONNECTED_WALLETS, uniqueWalletNames);
  }

  public getConnectedWallets(): string[] {
    return this.get<string[]>(StorageKeys.CONNECTED_WALLETS, []) ?? [];
  }

  public addConnectedWallet(walletName: string): void {
    const currentWallets = this.getConnectedWallets();
    if (!currentWallets.includes(walletName)) {
      this.saveConnectedWallets([...currentWallets, walletName]);
    }
  }

  public removeConnectedWallet(walletName: string): void {
    const currentWallets = this.getConnectedWallets();
    const filtered = currentWallets.filter(name => name !== walletName);
    this.saveConnectedWallets(filtered);
  }

  public clearAllWalletConnections(): void {
    this.remove(StorageKeys.CONNECTED_WALLETS);
  }

  // --- Wallet Preferences Methods ---

  public saveWalletPreferences(preferences: WalletPreferences): void {
    this.save(StorageKeys.WALLET_PREFERENCES, preferences);
  }

  public getWalletPreferences(): WalletPreferences {
    return {
      autoConnect: true, // default
      ...(this.get<WalletPreferences>(StorageKeys.WALLET_PREFERENCES) ?? {}),
    };
  }

  // --- Utility ---

  public clearAllData(): void {
    this.clearAllWalletConnections();
    this.remove(StorageKeys.WALLET_PREFERENCES);
    this.remove(StorageKeys.LAST_CONNECTED_WALLET);
  }

  public getStorageInfo(): {
    connectedWallets: string[];
    preferences: WalletPreferences;
  } {
    return {
      connectedWallets: this.getConnectedWallets(),
      preferences: this.getWalletPreferences(),
    };
  }

  // --- Legacy Methods (Optional) ---

  public saveWalletConnection(walletName: string): void {
    this.save(StorageKeys.LAST_CONNECTED_WALLET, walletName);
  }

  public getLastConnectedWallet(): string | null {
    return this.get<string>(StorageKeys.LAST_CONNECTED_WALLET);
  }

  public clearWalletConnection(): void {
    this.remove(StorageKeys.LAST_CONNECTED_WALLET);
  }
}

// Singleton instance
const storageService = StorageService.getInstance();
export default storageService;

// Optionally, named exports for specific methods
export const {
  saveConnectedWallets,
  getConnectedWallets,
  addConnectedWallet,
  removeConnectedWallet,
  clearAllWalletConnections,
  saveWalletPreferences,
  getWalletPreferences,
  saveWalletConnection,
  getLastConnectedWallet,
  clearWalletConnection,
  clearAllData,
  getStorageInfo,
} = storageService;
