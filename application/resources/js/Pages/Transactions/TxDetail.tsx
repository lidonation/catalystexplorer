import Title from '@/Components/atoms/Title';
import { Head } from '@inertiajs/react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import TransactionData = App.DataTransferObjects.TransactionData;

interface TransactionDetailProps {
  transaction: TransactionData;
  metadataLabels: { id: number; name: string }[]; // Array of label objects
  primaryLabel: string;
}

export default function TransactionDetail({
  transaction,
  metadataLabels,
  primaryLabel
}: TransactionDetailProps) {

  const { t } = useLaravelReactI18n();

  return (
    <>
      <Head title="Transaction" />

      <header>
        <div className='container'>
          <Title level='1'>Transaction</Title>
        </div>
        <div className='container'>
          <p className="text-content">
            View transaction details and related information
          </p>
        </div>
      </header>

      <div className="flex flex-col h-screen w-full items-center justify-center">
        <Title level='2'>{t('comingSoon')}</Title>
      </div>
    </>
  );
}
