import Title from '@/Components/atoms/Title';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import { SearchParams } from '../../../types/search-params';
import ProposalMilestoneData = App.DataTransferObjects.ProposalMilestoneData;

interface ActiveFundsProp extends Record<string, unknown> {
    proposalMilestones: PaginatedData<ProposalMilestoneData[]>;
    filters: SearchParams;
}

const Index: React.FC<ActiveFundsProp> = ({ proposalMilestones, filters }) => {
    const { t } = useTranslation();

    return (
        <>
            <Head title="Groups" />

            <header>
                <div className="container">
                    <Title level="1">{t('milestones.milestones')}</Title>
                </div>
                <div className="container">
                    <p className="text-content">{t('milestones.milestones')}</p>
                </div>
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <Title level="2">{t('comingSoon')}</Title>
            </div>
        </>
    );
};

export default Index;
