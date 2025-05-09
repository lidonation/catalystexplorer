import Title from '@/Components/atoms/Title';
import Paragraph from '@/Components/atoms/Paragraph';
import Value from '@/Components/atoms/Value';
import ValueLabel from '@/Components/atoms/ValueLabel';
import { CopyIcon } from 'lucide-react';
import TransactionData = App.DataTransferObjects.TransactionData;
import { useTranslation } from 'react-i18next';
import { formatTimestamp } from '@/utils/timeStamp';
import { getTimeSince } from '@/utils/timeSince';
import { truncateMiddle } from '@/utils/truncateMiddle';
import { copyToClipboard } from '@/utils/copyClipboard';
import DetailRow from './DetailRow';

interface TransactionDetailsCardProps {
  transaction: TransactionData;
}

export default function TransactionDetailsCard({ transaction }: TransactionDetailsCardProps) {
  const { t } = useTranslation();

  const delegations = Array.isArray(transaction.json_metadata?.voter_delegations) 
    ? transaction.json_metadata.voter_delegations 
    : [];

  return (
    <div className="bg-background rounded-lg p-6">
      <Title level='3' className='text-content font-bold pb-6 border-b border-background-lighter'>
        {t('transactions.details')}
      </Title>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="space-y-6">
          <DetailRow 
            label={t('transactions.table.hash')} 
            value={transaction.hash} 
            copyable
          />

          <DetailRow label={t('transactions.block')}>
            <div className='flex items-center flex-1'>
              <Value className='text-content font-bold truncate max-w-xs mr-2'>
                {truncateMiddle(transaction.block)}
              </Value>
              <CopyIcon 
                className='cursor-pointer text-gray-400 w-4 h-4' 
                onClick={() => copyToClipboard(transaction.block)}
              />
            </div>
          </DetailRow>

          <DetailRow label={t('vote.table.timestamp')}>
            <div className='flex-1'>
              <Value className='text-content font-bold'>
                {formatTimestamp(transaction.created_at)}
              </Value>
              <span className='text-gray-persist text-sm'>
                {getTimeSince(transaction.created_at)}
              </span>
            </div>
          </DetailRow>

          <DetailRow 
            label={t('transactions.table.epoch')} 
            value={transaction.epoch}
          />

          <DetailRow 
            label={t('transactions.votingPurpose')} 
            value={`Catalyst Proposal #${transaction.json_metadata.voting_purpose}`}
            background
          />
        </div>

        <div className="space-y-6">
          <DetailRow label={t('transactions.delegations')}>
            <div className='flex-1'>
              <div className="flex items-center mb-2">
                <Value className='bg-background-lighter px-2 py-1 rounded text-sm text-content font-bold mr-2'>
                  {delegations.length}
                </Value>
              </div>
              {delegations.map((delegation: {voting_key: string}, index: number) => (
                <div key={index} className="flex items-center mb-1">
                  <Value className='text-content font-bold'>
                    {truncateMiddle(delegation.voting_key, 10, 6)}
                  </Value>
                  <CopyIcon 
                    className='cursor-pointer text-gray-persist w-4 h-4 ml-2' 
                    onClick={() => copyToClipboard(delegation.voting_key)}
                  />
                </div>
              ))}
            </div>
          </DetailRow>

          <DetailRow 
            label={t('transactions.nonce')} 
            value={transaction.json_metadata.nonce}
          />

          <DetailRow 
            label={t('transactions.witness')} 
            value={truncateMiddle(transaction.witness)}
          />

          <DetailRow 
            label={t('transactions.type')} 
            value={transaction.type}
            background
          />
        </div>
      </div>
    </div>
  );
}
