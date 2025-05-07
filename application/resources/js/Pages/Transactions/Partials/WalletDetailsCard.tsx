import Title from '@/Components/atoms/Title';
import Paragraph from '@/Components/atoms/Paragraph';
import Value from '@/Components/atoms/Value';
import { CopyIcon } from 'lucide-react';
import { t } from 'i18next';
import Button from '@/Components/atoms/Button';
import DetailRow from './DetailRow';
import { copyToClipboard } from '@/utils/copyClipboard';
import { truncateMiddle } from '@/utils/truncateMiddle';
import { adaFormat } from '@/utils/adaFormat';
import TransactionData = App.DataTransferObjects.TransactionData;

interface WalletDetailsCardProps {
  transaction: TransactionData;
  walletStats: {
    all_time_votes: number;
    funds_participated: string[];
  };
}

export default function WalletDetailsCard({ transaction, walletStats }: WalletDetailsCardProps) {
  return (
    <div className="bg-background rounded-lg p-6">
      <Title level='3' className='text-content font-bold pb-6 border-b border-background-lighter'>
        {t('transactions.walletDetails')}
      </Title>

      <div className='pt-4'>
        <div className="space-y-6">
          <DetailRow 
            label={t('transactions.balance')} 
            value={adaFormat(transaction.json_metadata.controlled_amount)}
          />

          <DetailRow
            label={t('transactions.allTimeVotes')} 
            value={`${walletStats.all_time_votes} votes`}
            background
          />

          <DetailRow 
            label={t('transactions.fundsParticipated')} 
            value={walletStats.funds_participated.length}
            background
          />

          <DetailRow label={t('transactions.drepStatus')}>
            <Paragraph 
              className={`font-bold px-2 py-1 rounded-xl ${
                transaction.json_metadata.status === 'true' ? 'bg-success-light text-success border' : 'bg-error-light text-error border'
              }`}
            >
              {transaction.json_metadata.status === 'true' ? 'Active' : 'Inactive'}
            </Paragraph>
          </DetailRow>

          <DetailRow label={t('transactions.stakePub')}>
            <div className='flex items-center flex-1'>
              <Value className='text-content font-bold truncate mr-2'>
                {truncateMiddle(transaction.stake_pub)}
              </Value>
              <CopyIcon 
                className='cursor-pointer text-gray-persist font-bold w-4 h-4' 
                onClick={() => copyToClipboard(transaction.stake_pub)}
              />
            </div>
          </DetailRow>

          <DetailRow 
            label={t('transactions.paymentAddress')}
            className="border-none"
          >
            <div className='flex items-center flex-1'>
              <Value className='text-content font-bold truncate mr-2'>
                {truncateMiddle(transaction.json_metadata.payment_address)}
              </Value>
              <CopyIcon 
                className='cursor-pointer text-gray-persist w-4 h-4' 
                onClick={() => copyToClipboard(transaction.json_metadata.payment_address)}
              />
            </div>
          </DetailRow>

          <Button className='text-primary'>
            {t('transactions.view')}
          </Button>
        </div>
      </div>
    </div>
  );
}
