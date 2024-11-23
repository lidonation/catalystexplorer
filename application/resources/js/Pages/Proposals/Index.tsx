import ProposalCardLoading from '@/Pages/Proposals/Partials/ProposalCardLoading';
import ProposalResults from '@/Pages/Proposals/Partials/ProposalResults';
import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import ProposalFilters from './Partials/ProposalFilters';
import ProposalData = App.DataTransferObjects.ProposalData;

interface HomePageProps extends Record<string, unknown> {
    proposals: ProposalData[];
}

export default function Index({ proposals }: PageProps<HomePageProps>) {
    const { t } = useTranslation();
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
                <ProposalFilters />
            </section>

            <section className="proposals-wrapper container w-full">
                <WhenVisible
                    fallback={<ProposalCardLoading />}
                    data="proposals"
                >
                    <div className="py-4">
                        <ProposalResults proposals={proposals} />
                    </div>
                </WhenVisible>
            </section>
        </>
    );
}
