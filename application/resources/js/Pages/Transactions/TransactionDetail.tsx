import Title from '@/Components/atoms/Title';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from "react-i18next";
import { ChevronLeft } from 'lucide-react';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import TransactionDetailsCard from './Partials/TransactionDetailsCard';
import WalletDetailsCard from './Partials/WalletDetailsCard';
import MetadataCard from './Partials/MetadataCard';
import TransactionData = App.DataTransferObjects.TransactionData;

interface TransactionDetailProps {
  transaction: TransactionData;
  walletStats: {
    all_time_votes: number;
    funds_participated: string[];
  };
}

export default function TransactionDetail({transaction, walletStats}: TransactionDetailProps) {
  const { t } = useTranslation();

  return (
    <>
      <Head title="Transaction" />

      <header className='mt-10'>
        <div className='container mx-auto'>
          <Title level='1' className="text-4xl text-content">{t('transactions.message')}</Title>
        </div>
      </header>
      
      <div className='container mx-auto py-4'>
        <Link href={useLocalizedRoute('jormungandr.transactions.index')} className="inline-flex items-center text-primary text-sm">
          <ChevronLeft/>
          <span className="ml-2">{t('back')}</span>
        </Link>
      </div>
      
      <div className="min-h-screen text-content">
        <div className="container mb-8">
          <TransactionDetailsCard transaction={transaction} />
        </div>

        <div className="container mb-8">
          <WalletDetailsCard transaction={transaction} walletStats={walletStats} />
        </div>

        <div className="container mx-auto">
          <MetadataCard transaction={transaction}/>
        </div>
      </div>
    </>
  );
}
