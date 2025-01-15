import ArrowTrendingDown from '@/Components/svgs/ArrowTrendingDown';
import ArrowTrendingUp from '@/Components/svgs/ArrowTrendingUp';
import { currency } from '@/utils/currency';
import React from 'react';
import { useTranslation } from 'react-i18next';
import FundData = App.DataTransferObjects.FundData;

interface FundCardProps {
    fund: FundData;
    percentageChange: number;
    projectPercentageChange: number;
}

const FundCard: React.FC<FundCardProps> = ({
    fund,
    percentageChange,
    projectPercentageChange,
}) => {

    const { t } = useTranslation();

    return (
        <div className="flex w-full flex-row items-stretch space-x-6 overflow-hidden rounded-lg bg-background p-3 shadow-md sm:p-4">
            {/* Image Section */}
            <div className="flex flex-none flex-col items-center space-y-2 sm:items-start sm:space-y-4">
                {/* Title */}
                <h2 className="truncate text-center text-base font-bold sm:text-left sm:text-xl">
                    {fund.title}
                </h2>

                {/* Responsive Image Section */}
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-gray-100 to-gray-900 sm:h-32 sm:w-32 lg:h-36 lg:w-36">
                    <img
                        src={fund.hero_img_url}
                        alt={fund.title || 'Fund'}
                        className="h-full w-full rounded-full object-cover"
                    />
                </div>
            </div>

            {/* Details Section */}
            <div className="flex flex-grow flex-col space-y-1 sm:space-y-2">
                <div>
                    <p className="mt-8 truncate text-xs sm:text-sm">
                        {t('funds.totalAwarded')}
                    </p>
                    <div className="flex items-baseline space-x-1">
                        <span className="truncate text-sm font-bold sm:text-base">
                            {currency(
                                fund?.amount_awarded ?? 0,
                                fund?.currency,
                                undefined,
                                2,
                            )}
                        </span>
                        <span className="text-xs sm:text-sm">/</span>
                        <span className="truncate text-xs text-gray-500 sm:text-sm">
                            {currency(
                                fund?.amount_requested ?? 0,
                                fund?.currency,
                                undefined,
                                2,
                            )}
                        </span>
                    </div>
                    <div className="mt-1 flex items-center">
                        {percentageChange >= 0 ? (
                            <ArrowTrendingUp className="h-3 w-3 text-green-500 sm:h-4 sm:w-4" />
                        ) : (
                            <ArrowTrendingDown className="h-3 w-3 text-red-500 sm:h-4 sm:w-4" />
                        )}
                        <span className="ml-1 truncate text-xs sm:text-sm">
                            {`${Math.abs(percentageChange)}%`}
                        </span>
                        <span className="ml-1 truncate text-xs sm:text-sm">
                            vs {t('funds.lastFund')}
                        </span>
                    </div>
                </div>

                <div>
                    <p className="mt-2 truncate text-xs sm:text-sm">
                        {t('funds.fundedProjects')}
                    </p>
                    <div className="flex items-baseline space-x-1">
                        <span className="truncate text-sm font-bold sm:text-base">
                            {fund.funded_proposals_count}
                        </span>
                        <span className="text-xs sm:text-sm">/</span>
                        <span className="truncate text-xs text-gray-500 sm:text-sm">
                            {fund.proposals_count}
                        </span>
                    </div>
                    <div className="mt-1 flex items-center">
                        {projectPercentageChange >= 0 ? (
                            <ArrowTrendingUp className="h-3 w-3 text-green-500 sm:h-4 sm:w-4" />
                        ) : (
                            <ArrowTrendingDown className="h-3 w-3 text-red-500 sm:h-4 sm:w-4" />
                        )}
                        <span className="ml-1 truncate text-xs sm:text-sm">
                            {`${Math.abs(projectPercentageChange)}%`}
                        </span>
                        <span className="ml-1 truncate text-xs sm:text-sm">
                            vs {t('funds.lastFund')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FundCard;
