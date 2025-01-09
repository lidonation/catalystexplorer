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
                        totalAllocated={fund.totalAllocated ?? 0}
                        totalBudget={fund.totalBudget ?? 0}
                        fundedProjects={fund.fundedProjects ?? 0}
                        totalProjects={fund.totalProjects ?? 0}
                        percentageChange={fund.percentageChange }  
                        projectPercentageChange={fund.projectPercentageChange ?? 0}
                    />
                </li>
            ))}
        </ul>
    );
};

export default FundsList;
