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
import ProposalData = App.DataTransferObjects.ProposalData;
import { SearchParams } from '../../../types/search-params';
import { FiltersProvider } from '@/Context/FiltersContext';
import ProfileWorkflow from "./Partials/ProfileWorkflow";
import Title from '@/Components/atoms/Title';


interface CompletedProjectNftsPageProps extends Record<string, unknown> {
    proposals: PaginatedData<ProposalData[]>;
    filters: SearchParams;
}

export default function Index({
    proposals,
    filters
}: PageProps<CompletedProjectNftsPageProps>) {

    const { t } = useTranslation();
    const { auth } = usePage().props;
    const user = auth?.user;
    // Check authentication status
    const isAuthenticated = !!user;

    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(isAuthenticated ? 2 : 1);

    useEffect(() => {
        if (isAuthenticated) {
            console.log('proposals', JSON.stringify(proposals, null, 2));
        }
    }, [proposals]);

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
            value: '1436',
            description: t('completedProjectNfts.communityFunded'),
            icon: <PeopleIcon stroke="#3FACD1" width={32} height={32} />,
        },
        {
            value: '1064',
            description: t('completedProjectNfts.projectsCompleted'),
            icon: <FileIcon />,
        },
        {
            value: '$35.37M',
            description: t('completedProjectNfts.usdDistributed'),
            icon: <UsdIcon />,
        },
        {
            value: '84.96M ₳',
            description: t('completedProjectNfts.adaDistributed'),
            icon: <AdaIcon />,
        },
    ];

    return (
        <FiltersProvider defaultFilters={filters} routerOptions={{ only: ['proposals'] }}>
            <Head title="Charts" />

            {/* Header Section */}
            <header className="py-12">
                <div className="container px-4 mx-auto sm:px-6">
                    <Title className="mb-4 text-3xl md:text-4xl">
                        {t("completedProjectNfts.title")}
                    </Title>
                    <p className="text-base md:text-lg">
                        {t("completedProjectNfts.subtitle")}
                    </p>
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
                    <p className="text-sm text-center">
                        {t("completedProjectNfts.description")}{" "}
                        <a href="/hello-its-nashon" className="ml-1 underline">
                            {t("completedProjectNfts.artistStatement")}
                        </a>
                    </p>
                </div>
            </section>

            <div className="container flex flex-col items-center justify-center w-full px-4 py-12 mx-auto sm:px-6">
                {currentStep === 1 && (
                    <LoginForm
                        title={`${t('completedProjectNfts.nowMinting')}: ${t('funds.funds')} 2-12`}
                    />
                )}

                {currentStep === 2 && user && <ProfileWorkflow user={user} />}

                {currentStep === 3 && <p>Form 3</p>}

                <StepTracker totalSteps={3} currentStep={currentStep} />
            </div>


        </FiltersProvider >
    );
};
