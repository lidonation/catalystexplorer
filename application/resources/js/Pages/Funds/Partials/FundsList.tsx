import React from 'react';
import FundCard from './FundCard';
import FundData = App.DataTransferObjects.FundData;

interface FundsListProps {
    funds: FundData[];
}

const FundsList: React.FC<FundsListProps> = ({ funds }) => {
    return (
        <ul className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {funds.map((fund, index) => (
                <li key={index} className="h-full">
                    <FundCard
                        fund={fund}
                        totalAllocated={fund.totalAllocated}
                        totalBudget={fund.totalBudget}
                        fundedProjects={fund.fundedProjects}
                        totalProjects={fund.totalProjects}
                        percentageChange={fund.percentageChange}
                        projectPercentageChange={fund.projectPercentageChange}
                    />
                </li>
            ))}
        </ul>
    );
};

export default FundsList;
