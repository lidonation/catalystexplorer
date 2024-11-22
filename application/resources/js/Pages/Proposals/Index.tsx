import {Head, WhenVisible} from '@inertiajs/react';
import {useTranslation} from "react-i18next";
import {PageProps} from "@/types";
import ProposalData = App.DataTransferObjects.ProposalData;
import ProposalCardLoading from "@/Pages/Proposals/Partials/ProposalCardLoading";
import ProposalResults from "@/Pages/Proposals/Partials/ProposalResults";

interface HomePageProps extends Record<string, unknown> {
    proposals: ProposalData[];
}

export default function Index({proposals}: PageProps<HomePageProps>) {
    const {t} = useTranslation();
    return (
        <>
            <Head title="Proposals" />

            <header>
                <div className='container'>
                    <h1 className="title-1">
                        {t('proposals.proposals')}
                    </h1>
                </div>

                <div className='container'>
                    <p className="text-content">
                        {t('proposals.pageSubtitle')}
                    </p>
                </div>
            </header>

            <div className="w-full container proposals-wrapper">
                <WhenVisible
                    fallback={<ProposalCardLoading/>}
                    data="proposals"
                >
                    <div className='container py-8'>
                        <ProposalResults proposals={proposals} />
                    </div>
                </WhenVisible>
            </div>
        </>
    );
}
