import { VoteEnums } from '@/enums/vote-search-enums';
import { useLaravelReactI18n } from 'laravel-react-i18n';

const VoteSortOptions = () => {
    const { t } = useLaravelReactI18n();

    return [
        {
            label: t('vote.votingPowerHighToLow'),
            value: 'voting_power:desc',
            param: VoteEnums.SORT,
        },
        {
            label: t('vote.votingPowerLowToHigh'),
            value: 'voting_power:asc',
            param: VoteEnums.SORT,
        },
        {
            label: t('vote.timeOlderToNewer'),
            value: 'time:asc',
            param: VoteEnums.SORT,
        },
        {
            label: t('vote.timeNewerToOlder'),
            value: 'time:desc',
            param: VoteEnums.SORT,
        },
    ];
};

export default VoteSortOptions;
