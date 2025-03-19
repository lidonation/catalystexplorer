import CompletionNftImage from '@/assets/images/project-completion-nfts.jpg';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import AdaIcon from '@/Components/svgs/AdaIcon';
import FileIcon from '@/Components/svgs/FileIcon';
import PeopleIcon from '@/Components/svgs/PeopleIcon';
import UsdIcon from '@/Components/svgs/UsdIcon';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { PageProps } from '@/types';
import { currency } from '@/utils/currency';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import { SearchParams } from '../../../types/search-params';
import StatisticCard from './Partials/StatisticCard';
import ProposalData = App.DataTransferObjects.ProposalData;
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;

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
    proposals,
    filters,
    ideascaleProfiles,
    amountDistributedAda,
    amountDistributedUsd,
    completedProposalsCount,
    communityMembersFunded,
}: PageProps<CompletedProjectNftsPageProps>) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const user = auth?.user;
    // Check authentication status
    const isAuthenticated = !!user;

    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(
        isAuthenticated ? 2 : 1,
    );

    useEffect(() => {
        if (isAuthenticated && currentStep === 1) {
            setCurrentStep(2);
        }
    }, [isAuthenticated]);

    const goToNextStep = (step: 1 | 2 | 3) => {
        setCurrentStep(step);
    };

    const goToPreviousStep = (step: 1 | 2 | 3) => {
        setCurrentStep(step);
    };

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

            {/* Header Section */}
            <header className="py-12">
                <div className="container mx-auto px-4 sm:px-6">
                    <Title className="mb-4 text-3xl md:text-4xl">
                        {t('completedProjectNfts.title')}
                    </Title>
                    <Paragraph className="text-base md:text-lg">
                        {t('completedProjectNfts.subtitle')}
                    </Paragraph>
                </div>
            </header>

            {/* Hero Section */}
            <div className="container mx-auto px-4 sm:px-6">
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
                    <Paragraph className="text-center text-sm">
                        {t('completedProjectNfts.description')}{' '}
                        <a href="/hello-its-nashon" className="ml-1 underline">
                            {t('completedProjectNfts.artistStatement')}
                        </a>
                    </Paragraph>
                </div>
            </section>

            <div className="container mx-auto flex w-full flex-col items-center justify-center px-4 py-12 sm:px-6">
                <RecordsNotFound showIcon={true} />
            </div>
        </>
    );
}
