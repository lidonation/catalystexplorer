import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import RelatedProposals from '../Proposals/Partials/RelatedProposals';
import GroupData = App.DataTransferObjects.GroupData;
import ProposalData = App.DataTransferObjects.ProposalData;
import ReviewHorizontalCard from '../Reviews/Partials/ReviewHorizontalCard';
import ReviewHorizontalCardLoader from '../Reviews/Partials/ReviewHorizontalCardLoader';
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

            <section className="container my-8 flex flex-col gap-16">
                <div className='max-w-md'>
                    <GroupCard group={group}  />
                </div>

                <RelatedProposals
                    proposals={proposals}
                    groupId={group.id ?? undefined}
                />
                <div className='mt-4'>
                    <WhenVisible
                        fallback={<ReviewHorizontalCardLoader/>}
                        data="review"
                    >
                        <ReviewHorizontalCard/>
                    </WhenVisible>
                </div>
            </section>
        </>
    );
};

export default Group;
