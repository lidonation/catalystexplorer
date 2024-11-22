import  {RangePicker}  from '@/Components/RangePicker';
import ProposalCardLoading from '@/Pages/Proposals/Partials/ProposalCardLoading';
import ProposalResults from '@/Pages/Proposals/Partials/ProposalResults';
import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProposalData = App.DataTransferObjects.ProposalData;
import ProposalFilters from './Partials/ProposalFilters';

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
            <ProposalFilters/>
            </section>

            <section className="flex w-full flex-col items-center justify-center">
                <WhenVisible
                    fallback={<ProposalCardLoading />}
                    data="proposals"
                >
                    <div className="container py-8">
                        <ProposalResults proposals={proposals} />
                    </div>
                </WhenVisible>
            </section>
        </>
    );
}
