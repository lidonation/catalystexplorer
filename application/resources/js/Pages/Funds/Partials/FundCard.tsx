import React from 'react';
import { useTranslation } from 'react-i18next';
import ArrowTrendingDown from "@/Components/svgs/ArrowTrendingDown";
import ArrowTrendingUp from "@/Components/svgs/ArrowTrendingUp";
import FundData = App.DataTransferObjects.FundData;

interface FundCardProps {
    fund: FundData;
    totalAllocated: number;
    totalBudget: number;
    fundedProjects: number;
    totalProjects: number;
    percentageChange: string;
    projectPercentageChange: number;
}

const formatAmount = (amount: number): string => {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(2) + 'M';
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(2) + 'K';
    }
    return amount.toString();
};

const FundCard: React.FC<FundCardProps> = ({
    fund,
    totalAllocated,
    totalBudget,
    fundedProjects,
    totalProjects,
    percentageChange = "0%",
    projectPercentageChange = 0,
}) => {
    const { t } = useTranslation();

    const isIncrease = !isNaN(parseFloat(percentageChange)) && parseFloat(percentageChange) > 0;
    const formattedProjectPercentageChange = `${projectPercentageChange > 0 ? "+" : ""}${projectPercentageChange}%`;

    return (
        <div className="bg-background rounded-lg shadow-md p-3 sm:p-4 flex flex-row space-x-6 items-stretch w-full overflow-hidden">
            {/* Image Section */}
            <div className="flex-none flex flex-col items-center sm:items-start space-y-2 sm:space-y-4">
                {/* Title */}
                <h2 className="text-base sm:text-xl font-bold text-center sm:text-left truncate">
                    {fund.title}
                </h2>

                {/* Responsive Image Section */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full bg-gradient-to-r from-gray-100 to-gray-900 flex items-center justify-center overflow-hidden">
                    <img
                        src={fund.hero_img_url}
                        alt={fund.title || "Fund"}
                        className="rounded-full w-full h-full object-cover"
                    />
                </div>
            </div>


            {/* Details Section */}
            <div className="flex-grow flex flex-col space-y-1 sm:space-y-2">
                <div>
                    <p className="text-xs sm:text-sm truncate mt-8">{t('funds.totalAllocated')}</p>
                    <div className="flex items-baseline space-x-1">
                        <span className="text-sm sm:text-base font-bold truncate">
                            {formatAmount(totalAllocated)}
                        </span>
                        <span className="text-xs sm:text-sm">/</span>
                        <span className="text-xs sm:text-sm text-gray-500 truncate">
                            {formatAmount(totalBudget)} ₳
                        </span>
                    </div>
                    <div className="flex items-center mt-1">
                        {isIncrease ? (
                            <ArrowTrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        ) : (
                            <ArrowTrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                        )}
                        <span className="ml-1 text-xs sm:text-sm truncate">{percentageChange}</span>
                        <span className="ml-1 text-xs sm:text-sm truncate">vs {t('funds.lastFund')}</span>
                    </div>
                </div>

                <div>
                    <p className="text-xs sm:text-sm mt-2 truncate">{t('funds.fundedProjects')}</p>
                    <div className="flex items-baseline space-x-1">
                        <span className="text-sm sm:text-base font-bold truncate">{fundedProjects}</span>
                        <span className="text-xs sm:text-sm">/</span>
                        <span className="text-xs sm:text-sm text-gray-500 truncate">{totalProjects}</span>
                    </div>
                    <div className="flex items-center mt-1">
                        {projectPercentageChange > 0 ? (
                            <ArrowTrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        ) : (
                            <ArrowTrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                        )}
                        <span className="ml-1 text-xs sm:text-sm truncate">{formattedProjectPercentageChange}</span>
                        <span className="ml-1 text-xs sm:text-sm truncate">vs {t('funds.lastFund')}</span>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default FundCard;
