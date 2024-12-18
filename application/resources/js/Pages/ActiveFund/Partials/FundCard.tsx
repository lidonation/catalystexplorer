import React from 'react';
import FundData = App.DataTransferObjects.FundData;
import { useTranslation } from 'react-i18next';

interface FundCardProps {
  fund: FundData & { media?: { original_url: string }[] };
}

const formatAmount = (amount: number | string): string => {
  const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (parsedAmount >= 1_000_000_000) {
    return (parsedAmount / 1_000_000_000).toFixed(2).replace(/\.0$/, '') + 'B';
  } else if (parsedAmount >= 1_000_000) {
    return (parsedAmount / 1_000_000).toFixed(2).replace(/\.0$/, '') + 'M';
  } else if (parsedAmount >= 1_000) {
    return (parsedAmount / 1_000).toFixed(2).replace(/\.0$/, '') + 'K';
  }
  return parsedAmount.toFixed(0);
};

const formatCurrency = (amount: number | string | null | undefined): string => {
  const formattedAmount = formatAmount(amount ? parseInt(amount.toString()) : 0);
  return `${formattedAmount}`;
};

const FundCard: React.FC<FundCardProps> = ({ fund }) => {
  const { t } = useTranslation();

  const heroImageUrl = fund.media?.[0]?.original_url || null;

  return (
    <div>
      <div className="h-60 bg-gray-200 rounded-lg overflow-hidden">
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt={fund.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {t('noImage')}
          </div>
        )}
      </div>
      <div className="pt-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center justify-between">
            {fund.title}
            <svg width="34" height="34" version="1.1" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
                <path d="m400 350c0-27.613 22.387-50 50-50h400c27.613 0 50 22.387 50 50v400c0 27.613-22.387 50-50 50s-50-22.387-50-50v-279.29l-414.64 414.64c-19.527 19.523-51.184 19.523-70.711 0-19.527-19.527-19.527-51.184 0-70.711l414.64-414.64h-279.29c-27.613 0-50-22.387-50-50z"/>
            </svg>
        </h3>
        <p className="text-content-dark opacity-80 mb-4 line-clamp-3">
          {fund.excerpt}
        </p>
        <div className="flex gap-2">
          <p className="bg-background text-content rounded-md border pr-2 pl-2">
            {t('proposals.proposals')}: {fund.proposals_count}
          </p>
          <p className="bg-background text-content rounded-md border pr-2 pl-2">
            {t('proposals.filters.budget')}: {fund.currency} {formatCurrency(fund.amount)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FundCard;
