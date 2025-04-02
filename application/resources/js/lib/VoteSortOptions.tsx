import { useTranslation } from "react-i18next";
import { VoteEnums } from "@/enums/vote-search-enums";

const VoteSortOptions = () => {
    const { t } = useTranslation();
    
    return [
        {
            label: 'Voting Power: High to Low',
            value: 'voting_power:desc',
            param: VoteEnums.SORT
        },
        {
            label: 'Voting Power: Low to High',
            value: 'voting_power:asc',
            param: VoteEnums.SORT
        },
        {
            label: 'Time: Older to Newer',
            value: 'time:asc',
            param: VoteEnums.SORT
        },
        {
            label: 'Time: Newer to Older',
            value: 'time:desc',
            param: VoteEnums.SORT
        }
    ];
};

export default VoteSortOptions;
