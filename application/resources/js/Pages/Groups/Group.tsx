import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import RelatedProposals from '../Proposals/Partials/RelatedProposals';
import GroupData = App.DataTransferObjects.GroupData;
import ProposalData = App.DataTransferObjects.ProposalData;
import ReviewHorizontalCard from '../Campaign/Partials/ReviewHorizontalCard';

interface GroupPageProps extends Record<string, unknown> {
    group: GroupData;
    proposals: {
        data: ProposalData[];
        total: number;
    };
}

const Group: React.FC<GroupPageProps> = ({ group, proposals }) => {
    const { t } = useTranslation();

    return (
        <>
            <Head title={`${group.name} - Group`} />

            <header>
                <div className="container">
                    <h1 className="title-1">{group.name}</h1>
                </div>
                <div className="container">
                </div>
            </header>

            <section className="container my-8">                
                <RelatedProposals 
                    proposals={proposals}
                    groupId={group.id ?? undefined}
                />
            </section>
        </>
    );
};

export default Group;
