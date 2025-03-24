import CompletionNftImage from '@/assets/images/project-completion-nfts.jpg';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import AdaIcon from '@/Components/svgs/AdaIcon';
import FileIcon from '@/Components/svgs/FileIcon';
import PeopleIcon from '@/Components/svgs/PeopleIcon';
import UsdIcon from '@/Components/svgs/UsdIcon';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import {PageProps} from '@/types';
import {currency} from '@/utils/currency';
import {Head, Link} from '@inertiajs/react';
import {useTranslation} from 'react-i18next';
import {PaginatedData} from '../../../types/paginated-data';
import {SearchParams} from '../../../types/search-params';
import StatisticCard from './Partials/StatisticCard';
import ProposalData = App.DataTransferObjects.ProposalData;
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import Divider from "@/Components/Divider";
import {useLocalizedRoute} from "@/utils/localizedRoute";

interface CompletedProjectNftsPageProps extends Record<string, unknown> {
    proposals: PaginatedData<ProposalData[]>;
    ideascaleProfiles: PaginatedData<IdeascaleProfileData[]>;
    filters: SearchParams;
    amountDistributedAda: number;
    amountDistributedUsd: number;
    completedProposalsCount: number;
    communityMembersFunded: number;
}

export default function Index({
                                  amountDistributedAda,
                                  amountDistributedUsd,
                                  completedProposalsCount,
                                  communityMembersFunded,
                              }: PageProps<CompletedProjectNftsPageProps>) {
    const {t} = useTranslation();

    const statistics = [
        {
            value: communityMembersFunded,
            description: t('completedProjectNfts.communityFunded'),
            icon: <PeopleIcon stroke="#3FACD1" width={32} height={32}/>,
        },
        {
            value: completedProposalsCount,
            description: t('completedProjectNfts.projectsCompleted'),
            icon: <FileIcon/>,
        },
        {
            value: currency(amountDistributedUsd, 2, 'USD'),
            description: t('completedProjectNfts.usdDistributed'),
            icon: <UsdIcon/>,
        },
        {
            value: currency(amountDistributedAda, 2, 'ADA'),
            description: t('completedProjectNfts.adaDistributed'),
            icon: <AdaIcon/>,
        },
    ];

    return (
        <>
            <Head title="Charts"/>

            {/* Hero Section */}
            <div className="container mx-auto px-4 sm:px-6 mt-4">
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
                        <span className='text-primary'>{t('completedProjectNfts.projectComplete')}</span> {t('completedProjectNfts.timeForLaunchParty')}
                    </Title>

                    <Paragraph className="md:text-lg mb-4">
                        {t('completedProjectNfts.subtitle')}
                    </Paragraph>

                    <div className='py-2'>
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

            <section className='container'>
                <div className="py-8 md:py-16 px-6 md:px-20 bg-background rounded-lg w-full">
                    <div className='max-w-3xl mx-auto'>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
                            <div className="mb-6 md:mb-0">
                                <Title level='2' className="text3xl md:text-2xl lg:text-3xl font-bold">
                                    {t('completedProjectNfts.celebrateYourWork')}
                                </Title>
                                <Title level='2' className="text-3xl md:text-2xl lg:text-3xl font-bold">
                                    {t('completedProjectNfts.onCardanoMainnet')}
                                </Title>
                            </div>
                            <div className="w-full md:w-auto">
                                <Link
                                    href={useLocalizedRoute('workflows.completedProjectsNft.index', {step: 1})}
                                    className="bg-primary hover:bg-primary-dark text-light-persist px-8 py-3 rounded-md text-center w-full">
                                    {t('completedProjectNfts.mintCompletionNft')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container mx-auto flex w-full flex-col items-center justify-center py-12">
                <RecordsNotFound showIcon={true}/>
            </section>
        </>
    );
}
