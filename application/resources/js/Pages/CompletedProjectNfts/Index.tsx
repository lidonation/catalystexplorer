import CompletionNftImage from '@/assets/images/project-completion-nfts.jpg';
import LoginForm from '@/Components/LoginForm';
import AdaIcon from '@/Components/svgs/AdaIcon';
import FileIcon from '@/Components/svgs/FileIcon';
import PeopleIcon from '@/Components/svgs/PeopleIcon';
import UsdIcon from '@/Components/svgs/UsdIcon';
import CompletedNftsProposalSearchBar from '@/Pages/CompletedProjectNfts/Partials/CompletedNftsProposalSearchBar';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import StatisticCard from './Partials/StatisticCard';
import StepTracker from './Partials/StepTracker';
import { PaginatedData } from '../../../types/paginated-data';
import { PageProps } from '@/types';
import ProposalData = App.DataTransferObjects.ProposalData;
import { ProposalSearchParams } from '../../../types/proposal-search-params';
import { FiltersProvider} from '@/Context/FiltersContext';

interface CompletedProjectNftsPageProps extends Record<string, unknown> {
    proposals: PaginatedData<ProposalData[]>;
    filters: ProposalSearchParams;
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
      if(isAuthenticated) {
        console.log('proposals', JSON.stringify(proposals, null, 2));
      }
    },[proposals]);

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
            icon: <PeopleIcon stroke="#3FACD1" />,
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
                <div className="container mx-auto px-4 sm:px-6">
                    <h1 className="mb-4 text-4xl font-bold">
                        {t('completedProjectNfts.title')}
                    </h1>
                    <p className="text-lg">
                        {t('completedProjectNfts.subtitle')}
                    </p>
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

            {/* Proposals Search Bar */}
            <div className="container">
                <CompletedNftsProposalSearchBar
                    autoFocus={true}
                    showRingOnFocus={true}
                    //handleSearch={handleSearch}
                    focusState={(isFocused) => console.log(isFocused)}
                    initialSearch={''}
                />
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
                    <p className="text-center text-sm">
                        {t("completedProjectNfts.description")}{" "}
                        <a href="/hello-its-nashon" className="underline ml-1">
                            {t("completedProjectNfts.artistStatement")}
                        </a>
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12 sm:px-6 w-full flex flex-col items-center justify-center">
                {currentStep === 1 && (
                    <LoginForm
                        title={`${t('completedProjectNfts.nowMinting')}: ${t('funds.funds')} 2-12`}
                    />
                )}

                {currentStep === 2 && <p>Form 2</p>}

                {currentStep === 3 && <p>Form 3</p>}
                
                <StepTracker totalSteps={3} currentStep={currentStep} />
            </div>

            
        </FiltersProvider>
    );
};
