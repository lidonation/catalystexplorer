import CompletionNftImage from '@/assets/images/project-completion-nfts.jpg';
import LoginForm from '@/Components/LoginForm';
import AdaIcon from '@/Components/svgs/AdaIcon';
import FileIcon from '@/Components/svgs/FileIcon';
import PeopleIcon from '@/Components/svgs/PeopleIcon';
import UsdIcon from '@/Components/svgs/UsdIcon';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import StatisticCard from './Partials/StatisticCard';
import StepTracker from './Partials/StepTracker';
import { PaginatedData } from '../../../types/paginated-data';
import { PageProps } from '@/types';
import { SearchParams } from '../../../types/search-params';
import { FiltersProvider } from '@/Context/FiltersContext';
import ProfileWorkflow from "./Partials/ProfileWorkflow";
import Title from '@/Components/atoms/Title';
import Paragraph from '@/Components/atoms/Paragraph';
import ProposalData = App.DataTransferObjects.ProposalData; 
import IdeascaleProfileData= App.DataTransferObjects.IdeascaleProfileData;
import { currency } from '@/utils/currency';


interface CompletedProjectNftsPageProps extends Record<string, unknown> {
    proposals: PaginatedData<ProposalData[]>;
    ideascaleProfiles: PaginatedData<IdeascaleProfileData[]>
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
    communityMembersFunded
}: PageProps<CompletedProjectNftsPageProps>) {

    const { t } = useTranslation();
    const { auth } = usePage().props;
    const user = auth?.user;
    // Check authentication status
    const isAuthenticated = !!user;

    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(isAuthenticated ? 2 : 1);

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
    }

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
        <FiltersProvider defaultFilters={filters} routerOptions={{ only: ['ideascaleProfiles', 'proposals'] }}>
            <Head title="Charts" />

            {/* Header Section */}
            <header className="py-12">
                <div className="container px-4 mx-auto sm:px-6">
                    <Title className="mb-4 text-3xl md:text-4xl">
                        {t("completedProjectNfts.title")}
                    </Title>
                    <Paragraph className="text-base md:text-lg">
                        {t("completedProjectNfts.subtitle")}
                    </Paragraph>
                </div>
            </header>

            {/* Hero Section */}
            <div className="container px-4 mx-auto sm:px-6">
                <div className="relative w-full overflow-hidden rounded-lg">
                    <img
                        src={CompletionNftImage}
                        alt="Project Catalyst Hero"
                        className="object-cover w-full h-auto"
                    />
                </div>
            </div>

            {/* Statistics Section */}
            <section className="container px-4 py-12 mx-auto sm:px-6">
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

                <div className="max-w-3xl mx-auto mt-8">
                    <Paragraph className="text-sm text-center">
                        {t("completedProjectNfts.description")}{" "}
                        <a href="/hello-its-nashon" className="ml-1 underline">
                            {t("completedProjectNfts.artistStatement")}
                        </a>
                    </Paragraph>
                </div>
            </section>

            <div className="container flex flex-col items-center justify-center w-full px-4 py-12 mx-auto sm:px-6">
                {currentStep === 1 && (
                    <LoginForm
                        title={`${t('completedProjectNfts.nowMinting')}: ${t('funds.funds')} 2-12`}
                    />
                )}

                {currentStep === 2 && user && <ProfileWorkflow user={user} profiles={ideascaleProfiles || []} proposals={proposals || []}/>}

                {currentStep === 3 && <Paragraph>Form 3</Paragraph>}

                <StepTracker totalSteps={3} currentStep={currentStep} />
            </div>


        </FiltersProvider >
    );
};