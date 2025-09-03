import { useLaravelReactI18n } from 'laravel-react-i18n';

const ProposalSortingOptions = () => {
    const { t } = useLaravelReactI18n();
    return [
        {
            label: t('proposals.options.titleAtoZ'),
            value: 'title:asc',
        },
        {
            label: t('proposals.options.titleZtoA'),
            value: 'title:desc',
        },
        {
            label: t('proposals.options.votesCastLowToHigh'),
            value: 'votes_cast:asc',
        },
        {
            label: t('proposals.options.votesCastHighToLow'),
            value: 'votes_cast:desc',
        },
        {
            label: t('proposals.options.budgetHighToLow'),
            value: 'amount_requested:desc',
        },
        {
            label: t('proposals.options.budgetLowToHigh'),
            value: 'amount_requested:asc',
        },
        {
            label: t('proposals.options.communityRankingHighToLow'),
            value: 'ranking_total:desc',
        },
        {
            label: t('proposals.options.communityRankingLowToHigh'),
            value: 'ranking_total:asc',
        },
        {
            label: t('proposals.options.paymentsReceivedHighToLow'),
            value: 'amount_received:desc',
        },
        {
            label: t('proposals.options.paymentsReceivedLowToHigh'),
            value: 'amount_received:asc',
        },
        {
            label: t('proposals.options.yesVotesHighToLow'),
            value: 'yes_votes_count:desc',
        },
        {
            label: t('proposals.options.yesVotesLowToHigh'),
            value: 'yes_votes_count:asc',
        },
        {
            label: t('proposals.options.noVotesHighToLow'),
            value: 'abstain_votes_count:desc',
        },
        {
            label: t('proposals.options.noVotesLowToHigh'),
            value: 'abstain_votes_count:asc',
        },
        {
            label: t('proposals.options.ratingHighToLow'),
            value: 'ca_rating:desc',
        },
        {
            label: t('proposals.options.ratingLowToHigh'),
            value: 'ca_rating:asc',
        },
        {
            label: t('proposals.options.impactAlignmentHighToLow'),
            value: 'alignment_score:desc',
        },
        {
            label: t('proposals.options.impactAlignmentLowToHigh'),
            value: 'alignment_score:asc',
        },
        {
            label: t('proposals.options.feasibilityHighToLow'),
            value: 'feasibility_score:desc',
        },
        {
            label: t('proposals.options.feasibilityLowToHigh'),
            value: 'feasibility_score:asc',
        },
        {
            label: t('proposals.options.valueForMoneyHighToLow'),
            value: 'auditability_score:desc',
        },
        {
            label: t('proposals.options.valueForMoneyLowToHigh'),
            value: 'auditability_score:asc',
        },
        {
            label: t('proposals.options.fundingStatusAtoZ'),
            value: 'funding_status:asc',
        },
        {
            label: t('proposals.options.fundingStatusZtoA'),
            value: 'funding_status:desc',
        },
    ];
};

export default ProposalSortingOptions;
