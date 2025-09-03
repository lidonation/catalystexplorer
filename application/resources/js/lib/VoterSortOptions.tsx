import { useLaravelReactI18n } from 'laravel-react-i18n';

const VoterSortOptions = () => {
    const { t } = useLaravelReactI18n();

    return [
        {
            value: 'created_at:desc',
            label: t('voter.sort.newestFirst'),
        },
        {
            value: 'created_at:asc',
            label: t('voter.sort.oldestFirst'),
        },
        {
            value: 'voting_power:desc',
            label: t('voter.sort.votingPowerDesc'),
        },
        {
            value: 'voting_power:asc',
            label: t('voter.sort.votingPowerAsc'),
        },
        {
            value: 'votes_count:desc',
            label: t('voter.sort.votesCountDesc'),
        },
        {
            value: 'votes_count:asc',
            label: t('voter.sort.votesCountAsc'),
        },
        {
            value: 'proposals_voted_on:desc',
            label: t('voter.sort.proposalsVotedOnDesc'),
        },
        {
            value: 'proposals_voted_on:asc',
            label: t('voter.sort.proposalsVotedOnAsc'),
        },
    ];
};

export default VoterSortOptions;
