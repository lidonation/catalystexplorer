import VerticalCardLoading from '@/Pages/Proposals/Partials/ProposalVerticalCardLoading';
import HorizontaCardLoading from './Partials/ProposalHorizontalCardLoading';
import CardLayoutSwitcher from './Partials/CardLayoutSwitcher';
import ProposalResults from '@/Pages/Proposals/Partials/ProposalResults';
import { PageProps } from '@/types';
import { useState } from 'react';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import ProposalFilters from './Partials/ProposalFilters';
import { PaginatedProposals } from "../../../types/paginated-proposals";
import { ProposalSearchParams } from "../../../types/proposal-search-params";

interface HomePageProps extends Record<string, unknown> {
    proposals: PaginatedProposals;
    filters: ProposalSearchParams;
}

export default function Index({ proposals, filters }: PageProps<HomePageProps>) {
    const { t } = useTranslation();
    const [sortBy, setSortBy] = useState('');

    const handleSort = (sortBy: string) => {
        setSortBy(sortBy);
        // Implement sorting logic here
    };

    const [isHorizontal, setIsHorizontal] = useState(false);

    const [quickPitchView, setQuickPitchView] = useState(false);

    const setGlobalQuickPitchView = (value: boolean) => setQuickPitchView(value);


    return (
        <>
            <Head title="Proposals" />

            <header>
                <div className="container">
                    <h1 className="title-1">{t('proposals.proposals')}</h1>
                </div>

                <div className="container">
                    <p className="text-content">
                        {t('proposals.pageSubtitle')}
                    </p>
                </div>
            </header>

            <section className="container flex w-full flex-col items-center justify-center">
                <ProposalFilters filters={filters} onSort={handleSort} />
            </section>

            <section className="container  items-end flex flex-col mt-4">
                <CardLayoutSwitcher
                    isHorizontal={isHorizontal}
                    quickPitchView={quickPitchView}
                    setIsHorizontal={setIsHorizontal}
                    setGlobalQuickPitchView={setGlobalQuickPitchView}
                />
            </section>

            <section className="proposals-wrapper container w-full">
                <WhenVisible
                    fallback={
                        isHorizontal ? (
                            <HorizontaCardLoading />
                        ) : (
                            <VerticalCardLoading />
                        )
                    }
                    data="proposals"
                >
                    <div className="py-4">
                        <ProposalResults
                            proposals={proposals?.data}
                            isHorizontal={isHorizontal}
                            quickPitchView={quickPitchView}
                            setGlobalQuickPitchView={setGlobalQuickPitchView}
                        />
                    </div>
                </WhenVisible>
            </section>
        </>
    );
}
