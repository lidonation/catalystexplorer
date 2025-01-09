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
        <div className="bg-background rounded-lg shadow-md p-4 sm:p-6 flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-4 w-full">
            {/* Title and Image Section */}
            <div className="flex-none flex flex-col items-center sm:items-start space-y-4 w-full sm:w-1/2 flex-shrink-0 sm:flex-grow-0">
                <h2 className="text-lg sm:text-xl font-bold text-center sm:text-left truncate">
                    {fund.title}
                </h2>
                <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gradient-to-r from-gray-100 to-gray-900 flex items-center justify-center overflow-hidden">
                    <img
                        src={fund.hero_img_url || "/default-hero-image.jpg"}
                        alt={fund.title || "Fund"}
                        className="rounded-full w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Details Section */}
            <div className="flex-grow flex flex-col justify-between space-y-4 overflow-hidden w-full sm:w-1/2 flex-shrink-0">
                <div className="w-full">
                    <p className="text-sm truncate mt-6">{t('funds.totalAllocated')}</p>
                    <div className="flex items-baseline space-x-1">
                        <span className="text-lg sm:text-xl font-bold">{formatAmount(totalAllocated)}</span>
                        <span className="text-sm">/</span>
                        <span className="text-md text-gray-500 truncate">{formatAmount(totalBudget)} ₳</span>
                    </div>
                    <div className="flex items-center mt-1">
                        {isIncrease ? (
                            <ArrowTrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                            <ArrowTrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className="truncate ml-1">{percentageChange}</span>
                        <span className="ml-1">vs {t('funds.lastFund')}</span>
                    </div>
                </div>

                <div className="w-full">
                    <p className="text-sm truncate">{t('funds.fundedProjects')}</p>
                    <div className="flex items-baseline space-x-1">
                        <span className="text-lg sm:text-xl font-bold">{fundedProjects}</span>
                        <span className="text-sm">/</span>
                        <span className="text-md text-gray-500 truncate">{totalProjects}</span>
                    </div>
                    <div className="flex items-center mt-1">
                        {projectPercentageChange > 0 ? (
                            <ArrowTrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                            <ArrowTrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span
                            className={`${projectPercentageChange > 0 ? "text-green-500" : "text-red-500"} truncate ml-1`}
                        >
                            {formattedProjectPercentageChange}
                        </span>
                        <span className="ml-1">vs {t('funds.lastFund')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FundCard;
