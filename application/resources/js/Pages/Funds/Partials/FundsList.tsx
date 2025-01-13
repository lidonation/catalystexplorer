import React from 'react';
import FundCard from './FundCard';
import FundData = App.DataTransferObjects.FundData;

interface FundsListProps {
    funds: FundData[];
}

const FundsList: React.FC<FundsListProps> = ({
    funds
}) => {

    const sortedFunds = funds.sort((a, b) => {
        const numA = parseInt(a.title.replace(/\D/g, ''), 10);
        const numB = parseInt(b.title.replace(/\D/g, ''), 10);
        return numB - numA; // Descending order
    });

    const calculatePercentageChanges = (funds: any) => {
        // Sort the funds based on the numeric value extracted from the title in descending order
        funds.sort((a: any, b: any) => {
            const aNumber = parseInt(a.title.replace(/\D/g, ''), 10);
            const bNumber = parseInt(b.title.replace(/\D/g, ''), 10);
            return bNumber - aNumber; 
        });
    
        // Map through the funds to calculate percentage changes
        const percentageChanges = funds.map((fund: any, index: number) => {
            // For the first fund set percentage change to 0
            if (index === funds.length - 1) {
                return { 
                    fund: fund.title,
                    amountReceivedPercentageChange: 0,
                    fundedProposalsPercentageChange: 0
                };
            }
    
            const previousFund = funds[index + 1]; // Compare with the next fund 
            let amountReceivedPercentageChange = 0;
            let fundedProposalsPercentageChange = 0;
    
            // Calculate amount received percentage change
            if (previousFund.amount_received > 0) {
                amountReceivedPercentageChange = ((fund.amount_received - previousFund.amount_received) / previousFund.amount_received) * 100;
                amountReceivedPercentageChange = Math.round(amountReceivedPercentageChange * 100) / 100; // Round to 2 decimal places
            }
    
            // Calculate funded proposals percentage change
            if (previousFund.funded_proposals_count > 0) {
                fundedProposalsPercentageChange = ((fund.funded_proposals_count - previousFund.funded_proposals_count) / previousFund.funded_proposals_count) * 100;
                fundedProposalsPercentageChange = Math.round(fundedProposalsPercentageChange * 100) / 100; // Round to 2 decimal places
            }
    
            return {
                fund: fund.title,
                amountReceivedPercentageChange: amountReceivedPercentageChange,
                fundedProposalsPercentageChange: fundedProposalsPercentageChange
            };
        });
    
        return percentageChanges;
    };
    
    
    const fundPercentages = calculatePercentageChanges(funds);

    return (
        <ul className="grid w-full auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedFunds.map((fund, index) => (
                <li key={index} className="h-full">
                    <FundCard
                        fund={fund}
                        percentageChange={fundPercentages[index].amountReceivedPercentageChange ?? 0}
                        projectPercentageChange={
                            fundPercentages[index].fundedProposalsPercentageChange ?? 0
                        }
                    />
                </li>
            ))}
        </ul>
    );
};

export default FundsList;
