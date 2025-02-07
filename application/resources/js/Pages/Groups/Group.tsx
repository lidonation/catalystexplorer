import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import RelatedProposals from '../Proposals/Partials/RelatedProposals';
import GroupData = App.DataTransferObjects.GroupData;
import ProposalData = App.DataTransferObjects.ProposalData;
import GroupCard from "@/Pages/Groups/Partials/GroupCard";

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

            <section className="container my-8 flex flex-row gap-4">
                <div className='max-w-sm'>
                    <GroupCard group={group}  />
                </div>

                <div className='flex flex-col gap-16'>
                    <RelatedProposals
                        proposals={proposals}
                        groupId={group.id ?? undefined}
                        className='proposals-wrapper w-full grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3'
                    />
                </div>
            </section>
        </>
    );
};

export default Group;
