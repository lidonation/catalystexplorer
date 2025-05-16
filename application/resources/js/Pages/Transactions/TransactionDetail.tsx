
import { useTranslation } from "react-i18next";
import TransactionData = App.DataTransferObjects.TransactionData;
import { Head, Link } from "@inertiajs/react";
import Title from "@/Components/atoms/Title";
import { useLocalizedRoute } from "@/utils/localizedRoute";
import { ChevronLeft, CopyIcon } from "lucide-react";
import TransactionDetailsCard from "./Partials/TransactionDetailsCard";
import WalletDetailsCard from "./Partials/WalletDetailsCard";
import DetailRow from "./Partials/DetailRow";
import Value from "@/Components/atoms/Value";
import { truncateMiddle } from "@/utils/truncateMiddle";
import { copyToClipboard } from "@/utils/copyClipboard";
import MetadataCard from "./Partials/MetadataCard";

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

            <header className="mt-10">
                <div className="container mx-auto">
                    <Title level="1" className="text-content text-4xl">
                        {t('transactions.message')}
                    </Title>
                </div>
            </header>

            <div className="container mx-auto py-4">
                <Link
                    href={useLocalizedRoute('jormungandr.transactions.index')}
                    className="text-primary inline-flex items-center text-sm"
                >
                    <ChevronLeft />
                    <span className="ml-2">{t('back')}</span>
                </Link>
            </div>

            <div className="text-content min-h-screen">
                <div className="container mb-8">
                    <TransactionDetailsCard transaction={transaction} />
                </div>

        <div className="container mb-8">
          <WalletDetailsCard transaction={transaction} walletStats={walletStats} />
        </div>

                <div className="container mx-auto">
                    <MetadataCard transaction={transaction} />
                </div>
            </div>
        </>
    );
}
