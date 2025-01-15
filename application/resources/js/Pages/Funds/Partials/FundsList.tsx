import React from 'react';
import FundCard from './FundCard';
import FundData = App.DataTransferObjects.FundData;

interface FundsListProps {
    funds: FundData[];
}

const FundsList: React.FC<FundsListProps> = ({ funds }) => {
    const sortedFunds = funds.sort((a, b) => {
        const numA = parseInt(a.title.replace(/\D/g, ''), 10);
        const numB = parseInt(b.title.replace(/\D/g, ''), 10);
        return numB - numA;
    });

    const calculatePercentageChanges = (funds: any) => {
        funds.sort((a: any, b: any) => {
            const aNumber = parseInt(a.title.replace(/\D/g, ''), 10);
            const bNumber = parseInt(b.title.replace(/\D/g, ''), 10);
            return bNumber - aNumber;
        });

        const percentageChanges = funds.map((fund: any, index: number) => {
            if (index === funds.length - 1) {
                return {
                    fund: fund.title,
                    amountAwardedPercentageChange: 0,
                    fundedProposalsPercentageChange: 0,
                };
            }

            const previousFund = funds[index + 1]; 
            let amountAwardedPercentageChange = '';
            let fundedProposalsPercentageChange = '';

            const currentAmountAwardedPercentage = ((fund.amount_awarded / fund.amount_requested) * 100).toFixed(2)
            const previousAmountAwardedPercentage = ((previousFund.amount_awarded / previousFund.amount_requested) * 100).toFixed(2);

    
        
            if (previousFund.amount_awarded > 0) {
                amountAwardedPercentageChange= (parseFloat(previousAmountAwardedPercentage) - parseFloat(currentAmountAwardedPercentage)).toFixed(2);
            }

            const currentFundedProjectsPercentage = (
                (fund.funded_proposals_count / fund.proposals_count) * 100
            ).toFixed(2);
            
            const previousFundedProjectsPercentage = (
                (previousFund.funded_proposals_count / previousFund.proposals_count) * 100
            ).toFixed(2);
            
          
            if (previousFund.funded_proposals_count > 0) {
                fundedProposalsPercentageChange = (
                    parseFloat(currentFundedProjectsPercentage) - parseFloat(previousFundedProjectsPercentage)
                ).toFixed(2); 
            }

            return {
                fund: fund.title,
                amountReceivedPercentageChange: amountAwardedPercentageChange,
                fundedProposalsPercentageChange:
                    fundedProposalsPercentageChange,
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
                        percentageChange={
                            fundPercentages[index]
                                .amountReceivedPercentageChange ?? 0
                        }
                        projectPercentageChange={
                            fundPercentages[index]
                                .fundedProposalsPercentageChange ?? 0
                        }
                    />
                </li>
            ))}
        </ul>
    );
};

export default FundsList;
