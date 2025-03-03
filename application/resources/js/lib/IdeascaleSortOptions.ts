import { useTranslation } from "react-i18next";



const IdeascaleSortingOptions = () => {
    const { t } = useTranslation();

    return [
        {
            label: t('ideascaleProfiles.options.alphabeticallyAsc'), // Alphabetically: A to Z
            value: 'name:asc',
        },
        {
            label: t('ideascaleProfiles.options.alphabeticallyDesc'), // Alphabetically: Z to A
            value: 'name:desc',
        },
        {
            label: t('ideascaleProfiles.options.awardedAdaHighToLow'), // Amount Awarded Ada: High to Low
            value: 'amount_awarded_ada:desc',
        },
        {
            label: t('ideascaleProfiles.options.awardedAdaLowToHigh'), // Amount Awarded Ada: Low to High
            value: 'amount_awarded_ada:asc',
        },
        {
            label: t('ideascaleProfiles.options.awardedUsdHighToLow'), // Amount Awarded USD: High to Low
            value: 'amount_awarded_usd:desc',
        },
        {
            label: t('ideascaleProfiles.options.awardedUsdLowToHigh'), // Amount Awarded USD: Low to High
            value: 'amount_awarded_usd:asc',
        },
        {
            label: t('ideascaleProfiles.options.primaryProposalCountHighToLow'), // Primary Proposal Count: High to Low
            value: 'own_proposals_count:desc',
        },
        {
            label: t('ideascaleProfiles.options.primaryProposalCountLowToHigh'), // Primary Proposal Count: Low to High
            value: 'own_proposals_count:asc',
        },
        {
            label: t('ideascaleProfiles.options.coProposalCountHighToLow'), // Co-Proposal Count: High to Low
            value: 'co_proposals_count:desc',
        },
        {
            label: t('ideascaleProfiles.options.coProposalCountLowToHigh'), // Co-Proposal Count: Low to High
            value: 'co_proposals_count:asc',
        },
    ]
};

export default IdeascaleSortingOptions;