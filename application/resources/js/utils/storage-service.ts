import { StorageKeys } from '@/enums/storage-keys-enums';

type StorageType = 'local' | 'session';

export class StorageService {
    private static instance: StorageService;

    private constructor() {}

    public static getInstance(): StorageService {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService();
        }
        return StorageService.instance;
    }

    private getStorage(type: StorageType): Storage {
        return type === 'session' ? sessionStorage : localStorage;
    }

    public save<T>(key: StorageKeys, value: T, storage: StorageType = 'local'): void {
        try {
            const serializedValue = JSON.stringify(value);
            this.getStorage(storage).setItem(key, serializedValue);
        } catch (error) {
            console.error(
                `Error saving to ${storage}Storage with key ${key}:`,
                error,
            );
        }
    }
    /**
     * Save  with TTL(Time To Live)
     */
    public saveWithTTL<T>(key: StorageKeys, value: T, ttlMs: number): void {
        try {
            const item = {
                value,
                expiry: Date.now() + ttlMs,
            };
            const serializedValue = JSON.stringify(item);
            localStorage.setItem(key, serializedValue);
        } catch (error) {
            console.error(`Error saving to localStorage with key ${key}:`, error);
        }
    }
    /**
     * Get value with TTL check
     */
    public getWithTTL<T>(key: StorageKeys, defaultValue?: T): T | null {
        try {
            const itemStr = localStorage.getItem(key);
            if (!itemStr) {
                return defaultValue ?? null;
            }

            const item = JSON.parse(itemStr);
            const now = Date.now();

            // Check if item has expired
            if (item.expiry && now > item.expiry) {
                this.remove(key);
                return defaultValue ?? null;
            }

            return item.value as T;
        } catch (error) {
            console.error(`Error retrieving from localStorage with key ${key}:`, error);
            return defaultValue ?? null;
        }
    }

    /**
     * Get a value from storage
     */
    public get<T>(key: StorageKeys, defaultValue?: T, storage: StorageType = 'local'): T | null {
        try {
            const value = this.getStorage(storage).getItem(key);
            if (value === null) {
                return defaultValue ?? null;
            }
            return JSON.parse(value) as T;
        } catch (error) {
            console.error(
                `Error retrieving from ${storage}Storage with key ${key}:`,
                error,
            );
            return defaultValue ?? null;
        }
    }

    /**
     * Remove a value from storage
     */
    public remove(key: StorageKeys, storage: StorageType = 'local'): void {
        try {
            this.getStorage(storage).removeItem(key);
        } catch (error) {
            console.error(
                `Error removing from ${storage}Storage with key ${key}:`,
                error,
            );
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
