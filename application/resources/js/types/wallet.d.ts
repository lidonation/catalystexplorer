declare global {
    interface Window {
      cardano?: {
        [walletName: string]: {
          enable: () => Promise<CIP30API>;
          isEnabled: () => Promise<boolean>;
          apiVersion: string;
          icon: string;
          name: string;
        };
      };
    }
  }

  export interface CIP30API {
    getNetworkId: () => Promise<number>;
    getUtxos: () => Promise<string[] | undefined>;
    getCollateral: () => Promise<string[] | undefined>;
    getBalance: () => Promise<string>;
    getUsedAddresses: () => Promise<string[]>;
    getUnusedAddresses: () => Promise<string[]>;
    getRewardAddresses: () => Promise<string[]>;
    signTx: (tx: string, partialSign?: boolean) => Promise<string>;
    submitTx: (tx: string) => Promise<string>;
    signData(addr: string, payload: string): Promise<{ signature: string, key: string }>;
    experimental?: {
      getCollateralParams: () => Promise<any>;
    };
  }
