import React from 'react';
import FundCard from './FundCard';
import FundData = App.DataTransferObjects.FundData;

interface FundsListProps {
    funds: FundData[];
}

const FundsList: React.FC<FundsListProps> = ({ funds }) => {
    const sortedFunds: FundData[] = [...funds].sort((a, b) => {
        const numA = a.title ? parseInt(a.title.replace(/\D/g, ''), 10) : NaN;
        const numB = b.title ? parseInt(b.title.replace(/\D/g, ''), 10) : NaN;

        if (isNaN(numA) && isNaN(numB)) return 0;
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;

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

            const currentAmountAwardedChange =
                (fund.amount_awarded / fund.amount_requested) * 100;
            const previousAmountAwardedChange =
                (previousFund.amount_awarded / previousFund.amount_requested) *
                100;

            amountAwardedPercentageChange = Number(
                ((currentAmountAwardedChange - previousAmountAwardedChange) /
                    previousAmountAwardedChange) *
                    100,
            ).toFixed(2);

            const currentFundedProjectsPercentage =
                (fund.funded_proposals_count / fund.proposals_count) * 100;
            const previousFundedProjectsPercentage =
                (previousFund.funded_proposals_count /
                    previousFund.proposals_count) *
                100;

            fundedProposalsPercentageChange = Number(
                ((currentFundedProjectsPercentage -
                    previousFundedProjectsPercentage) /
                    previousFundedProjectsPercentage) *
                    100,
            ).toFixed(2);

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
        <ul
            className="grid w-full auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3"
            data-testid="funds-list"
        >
            {sortedFunds.map((fund, index) => (
                <li
                    key={index}
                    className="h-full"
                    data-testid={`fund-item-${fund.title}`}
                >
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
