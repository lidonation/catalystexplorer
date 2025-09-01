import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Paginator from '@/Components/Paginator';
import ProposalList from '@/Pages/CompletedProjectNfts/Partials/ProposalList';
import ProposalSearchBar from '@/Pages/CompletedProjectNfts/Partials/ProposalSearchBar';
import { FiltersProvider } from '@/Context/FiltersContext';
import { StepDetails } from '@/types';
import { PaginatedData } from '@/types/paginated-data';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import { SearchParams } from '@/types/search-params';

interface Step2Props {
    profiles: Record<number, string>;
    stepDetails: StepDetails[];
    activeStep: number;
    proposals: PaginatedData<App.DataTransferObjects.ProposalData[]>;
    filters: SearchParams;
}

const Step2: React.FC<Step2Props> = ({
    stepDetails,
    activeStep,
    proposals,
    profiles,
    filters
}) => {
    const { t } = useLaravelReactI18n();
    const [selectedProposalHash, setSelectedProposalHash] = useState<
        string | null
    >(null);
    const [search, setSearch] = useState<string>('');
    const { locale } = usePage().props;

    const localizedRoute = useLocalizedRoute;

    const prevStep =
        activeStep === 1
            ? ''
            : localizedRoute('workflows.completedProjectsNft.index', {
                  step: activeStep - 1,
              });

    const nextStep = selectedProposalHash
        ? localizedRoute('completedProjectsNfts.show', {
              proposal: selectedProposalHash,
          })
        : '';

    const handleSearchProposals = useCallback(
        (searchTerm: string) => {
            setSearch(searchTerm);
            const searchRoute = generateLocalizedRoute(
                'workflows.completedProjectsNft.index',
                {
                    step: activeStep,
                    search: searchTerm,
                    profiles,
                    p: 1,
                },
                locale as string | undefined,
            );

            router.visit(searchRoute, {
                only: ['proposals'],
                preserveState: true,
            });
        },
        [activeStep, profiles, locale],
    );

    const profileHash : string = profiles?.[0] || '';

    const filtersWithProfiles = {
        ...filters,
        profiles: profiles || {},
    };

    return (
        <FiltersProvider
            defaultFilters={filtersWithProfiles}
            routerOptions={{
                preserveState: true,
                replace: true,
            }}
        >
            <WorkflowLayout
                title="Completed Projects Nfts"
                asideInfo={stepDetails[activeStep - 1].info ?? ''}
            >
                <Nav stepDetails={stepDetails} activeStep={activeStep} />

                <Content>
                    <div className="card-container bg-background sticky z-10 mb-4 w-full px-4 pt-4 lg:top-0 lg:px-6 lg:pt-8">
                        <ProposalSearchBar
                            autoFocus={true}
                            showRingOnFocus={true}
                            handleSearch={handleSearchProposals}
                            focusState={(isFocused) => console.log(isFocused)}
                        />
                    </div>

                    <ProposalList
                        onProposalClick={(hash) =>
                            setSelectedProposalHash(hash)
                        }
                        proposals={proposals || []}
                        profileHash={profileHash as string}
                    />
                </Content>

                <Footer>
                    <div className="w-full items-center justify-between gap-4 lg:flex-row">
                        {proposals &&
                            proposals.data &&
                            proposals.data.length > 0 &&
                            proposals.total > proposals.per_page && (
                                <Paginator
                                    pagination={proposals}
                                    linkProps={{
                                        preserveState: true,
                                        preserveScroll: true,
                                    }}
                                />
                            )}
                        <div className="flex justify-between">
                            <PrimaryLink
                                href={prevStep}
                                className="text-sm lg:px-8 lg:py-3"
                                disabled={activeStep === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span>{t('Previous')}</span>
                            </PrimaryLink>
                            <PrimaryLink
                                href={nextStep}
                                className="text-sm lg:px-8 lg:py-3"
                                disabled={!selectedProposalHash}
                            >
                                <span>{t('Next')}</span>
                                <ChevronRight className="h-4 w-4" />
                            </PrimaryLink>
                        </div>
                    </div>
                </Footer>
            </WorkflowLayout>
        </FiltersProvider>
    );
};

export default Step2;
