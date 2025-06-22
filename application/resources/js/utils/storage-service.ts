import { StorageKeys } from "@/enums/storage-keys-enums";

  export class StorageService {
    private static instance: StorageService;

    private constructor() {}

    public static getInstance(): StorageService {
      if (!StorageService.instance) {
        StorageService.instance = new StorageService();
      }
      return StorageService.instance;
    }

    public save<T>(key: StorageKeys, value: T): void {
      try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
      } catch (error) {
        console.error(`Error saving to localStorage with key ${key}:`, error);
      }
    }

    /**
     * Get a value from localStorage
     */
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

    /**
     * Remove a value from localStorage
     */
    public remove(key: StorageKeys): void {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing from localStorage with key ${key}:`, error);
      }
    }

    /**
     * Clear all application storage
     */
    public clear(): void {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }

    /**
     * Check if a key exists in localStorage
     */
    public exists(key: StorageKeys): boolean {
      return localStorage.getItem(key) !== null;
    }

    /**
     * Save wallet connection
     */
    public saveWalletConnection(walletName: string): void {
      this.save(StorageKeys.LAST_CONNECTED_WALLET, walletName);
    }

    /**
     * Get last connected wallet
     */
    public getLastConnectedWallet(): string | null {
      return this.get<string>(StorageKeys.LAST_CONNECTED_WALLET);
    }

    /**
     * Clear wallet connection
     */
    public clearWalletConnection(): void {
      this.remove(StorageKeys.LAST_CONNECTED_WALLET);
    }

  }

  export default StorageService.getInstance();
