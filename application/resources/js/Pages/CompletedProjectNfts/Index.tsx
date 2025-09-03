import CompletionNftImage from '@/assets/images/project-completion-nfts.jpg';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import Divider from '@/Components/Divider';
import AdaIcon from '@/Components/svgs/AdaIcon';
import FileIcon from '@/Components/svgs/FileIcon';
import PeopleIcon from '@/Components/svgs/PeopleIcon';
import UsdIcon from '@/Components/svgs/UsdIcon';
import { PageProps } from '@/types';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { currency } from '@/utils/currency';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Head, Link, WhenVisible } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import MintedNftsCardLoader from './Partials/MintedNftsCardLoader';
import MintedNftsList from './Partials/MintedNftsList';
import StatisticCard from './Partials/StatisticCard';
import ProposalData = App.DataTransferObjects.ProposalData;
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import NftData = App.DataTransferObjects.NftData;

interface CompletedProjectNftsPageProps extends Record<string, unknown> {
    proposals: PaginatedData<ProposalData[]>;
    ideascaleProfiles: PaginatedData<IdeascaleProfileData[]>;
    filters: SearchParams;
    amountDistributedAda: number;
    amountDistributedUsd: number;
    completedProposalsCount: number;
    communityMembersFunded: number;
    mintedNfts: NftData[];
}

export default function Index({
    amountDistributedAda,
    amountDistributedUsd,
    completedProposalsCount,
    communityMembersFunded,
    mintedNfts,
}: PageProps<CompletedProjectNftsPageProps>) {
    const { t } = useLaravelReactI18n();

    const statistics = [
        {
            value: communityMembersFunded,
            description: t('completedProjectNfts.communityFunded'),
            icon: <PeopleIcon stroke="#3FACD1" width={32} height={32} />,
        },
        {
            value: completedProposalsCount,
            description: t('completedProjectNfts.projectsCompleted'),
            icon: <FileIcon />,
        },
        {
            value: currency(amountDistributedUsd, 2, 'USD'),
            description: t('completedProjectNfts.usdDistributed'),
            icon: <UsdIcon />,
        },
        {
            value: currency(amountDistributedAda, 2, 'ADA'),
            description: t('completedProjectNfts.adaDistributed'),
            icon: <AdaIcon />,
        },
    ];

    return (
        <>
            <Head title="Charts" />

            {/* Hero Section */}
            <div className="container mx-auto mt-4 px-4 sm:px-6">
                <div className="relative w-full overflow-hidden rounded-lg">
                    <img
                        src={CompletionNftImage}
                        alt="Project Catalyst Hero"
                        className="h-auto w-full object-cover"
                    />
                </div>
            </div>

            {/* Statistics Section */}
            <section className="container mx-auto px-4 py-12 sm:px-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {statistics.map((stat, index) => (
                        <StatisticCard
                            key={index}
                            value={stat.value}
                            description={stat.description}
                            icon={stat.icon}
                        />
                    ))}
                </div>

                <div className="mx-auto mt-8 max-w-3xl">
                    <Title level="1">
                        <span className="text-primary">
                            {t('completedProjectNfts.projectComplete')}
                        </span>{' '}
                        {t('completedProjectNfts.timeForLaunchParty')}
                    </Title>

                    <Paragraph className="mb-4 md:text-lg">
                        {t('completedProjectNfts.subtitle')}
                    </Paragraph>

                    <div className="py-2">
                        <Divider />
                    </div>

                    <Paragraph className="md:text-lg">
                        {t('completedProjectNfts.description')}{' '}
                        <Link href="/hello-its-nashon" className="underline">
                            {t('completedProjectNfts.artistStatement')}
                        </Link>
                    </Paragraph>
                </div>
            </section>

            <section className="container">
                <div className="bg-background w-full rounded-lg px-6 py-8 md:px-20 md:py-16">
                    <div className="mx-auto max-w-3xl">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-6">
                            <div className="mb-6 md:mb-0">
                                <Title
                                    level="2"
                                    className="text3xl font-bold md:text-2xl lg:text-3xl"
                                >
                                    {t(
                                        'completedProjectNfts.celebrateYourWork',
                                    )}
                                </Title>
                                <Title
                                    level="2"
                                    className="text-3xl font-bold md:text-2xl lg:text-3xl"
                                >
                                    {t('completedProjectNfts.onCardanoMainnet')}
                                </Title>
                            </div>
                            <div className="w-full md:w-auto">
                                <Link
                                    href={useLocalizedRoute(
                                        'workflows.completedProjectsNft.index',
                                        { step: 1 },
                                    )}
                                    className="bg-primary hover:bg-primary-dark text-light-persist w-full rounded-md px-8 py-3 text-center"
                                >
                                    {t(
                                        'completedProjectNfts.mintCompletionNft',
                                    )}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container py-8">
                <WhenVisible fallback={<MintedNftsCardLoader />} data="funds">
                    <MintedNftsList nfts={mintedNfts} />
                </WhenVisible>
            </section>
        </>
    );
}
