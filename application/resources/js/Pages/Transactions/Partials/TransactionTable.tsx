import React, { useState } from 'react';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import CopyIcon from '@/Components/svgs/CopyIcon';
import TransactionData = App.DataTransferObjects.TransactionData;
import RegisterTwo from '@/Components/svgs/RegisterTwo';
import Paragraph from '@/Components/atoms/Paragraph';
import { useTranslation } from 'react-i18next';
import TransactionRow from './TransactionRow';
import CopyableCell from '@/Components/CopyableCell';

interface ColumnConfig<T> {
  key: string;
  header: string;
  width?: string;
  render: (item: T) => React.ReactNode;
}

interface CardanoTransactionTableProps {
  transactions: TransactionData[];
}

export const CardanoTransactionTable: React.FC<CardanoTransactionTableProps> = ({ transactions = [] }) => {
  const { CardanoWasm } = useConnectWallet();
  const { t } = useTranslation();
  const voterRegistrationTypes = ['cip15', 'cip36'];

  const getStakeAddress = (address: string): string => {
    if (!CardanoWasm || !address) return '';
    try {
      const addr = CardanoWasm.Address.from_bech32(address);
      const baseAddr = CardanoWasm.BaseAddress.from_address(addr);
      if (!baseAddr) return '';
      const stakeCredential = baseAddr.stake_cred();
      if (!stakeCredential) return '';
      const stakeAddress = CardanoWasm.RewardAddress.new(
        addr.network_id(),
        stakeCredential
      ).to_address().to_bech32();
      return stakeAddress;
    } catch (error) {
      console.error("Error extracting stake address:", error);
      return '';
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 12)}...${address.substring(address.length - 8)}`;
  };

  const columns: ColumnConfig<TransactionData>[] = [
    {
      key: 'hash',
      header: t('transactions.table.hash'),
      render: (tx) => (
        <div className="flex flex-col space-y-1 items-center">
          <CopyableCell
            displayText={formatAddress(tx.tx_hash)}
            fullText={tx?.tx_hash}
            title={t('transactions.table.copyTxHash')}
          />
          {voterRegistrationTypes.includes(tx.json_metadata?.txType) ? (
            <div className="flex items-center bg-background-lighter px-2 py-1 rounded">
              <RegisterTwo
                width={12}
                height={12}
                className="mr-1 text-gray-persist"
              />
              <Paragraph className="text-xs text-gray-persist font-bold">
                {t('transactions.table.voterRegistration')}
              </Paragraph>
            </div>
          ) : (
            <Paragraph size="sm">{tx.json_metadata?.txType}</Paragraph>
          )}
        </div>
      ),
    },
    {
      key: 'stakeAddress',
      header: t('transactions.table.stakeAddress'),
      render: (tx) => {    
        return (
          <CopyableCell
            displayText={formatAddress(tx?.stake_key??'')}
            fullText={tx?.stake_key??''}
            title={t('transactions.table.copyStakeAddress')}
          />
        );
      },
    },
    {
      key: 'epoch',
      header: t('transactions.table.epoch'),
      render: (tx) => <Paragraph size="sm" className='text-center'>{tx.epoch || '-'}</Paragraph>,
    },
    {
      key: 'block',
      header: t('transactions.table.block'),
      render: (tx) => (
        <CopyableCell
          displayText={formatAddress(tx.block)}
          fullText={tx.block}
          title={t('transactions.table.copyBlockHash')}
        />
      ),
    },
  ];

  return (
    <div className="w-full overflow-x-auto rounded-t-lg shadow-[0_-1px_4px_0_rgba(0,0,0,0.05)]">
    <div className="inline-block min-w-full overflow-hidden">
        <table className="min-w-full table-fixed">
            <thead className="bg-background-lighter border-gray-persist/30 border-b">
                <tr className="border-background-lighter border-r border-b">
              {columns.map(column => (
                <th key={column.key} className="p-3  border-r border-gray-persist/30 last:border-r-0">
                  <Paragraph size="sm" className="font-medium text-left text-content/60">{column.header}</Paragraph>
                </th>
              ))}
              <th className="p-3">
                <Paragraph size="sm" className="font-medium text-left text-content/60">{t('transactions.table.actions')}</Paragraph>
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <TransactionRow
                key={index}
                transaction={tx}
                columns={columns}
                onViewDetails={() => {
                  console.log(t('transactions.table.viewDetails') + ":", tx.tx_hash);
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CardanoTransactionTable;