import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import RelatedProposals from '../Proposals/Partials/RelatedProposals';
import GroupData = App.DataTransferObjects.GroupData;
import ProposalData = App.DataTransferObjects.ProposalData;
import ReviewHorizontalCard from '../Reviews/Partials/ReviewHorizontalCard';
import ReviewHorizontalCardLoader from '../Reviews/Partials/ReviewHorizontalCardLoader';
import GroupCard from "@/Pages/Groups/Partials/GroupCard";
import {PaginatedData} from "../../../types/paginated-data";
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ReviewData = App.DataTransferObjects.ReviewData;
import LocationData = App.DataTransferObjects.LocationData;
import ConnectionData = App.DataTransferObjects.ConnectionData;
import ReviewHorizontalCard from '../Reviews/Partials/ReviewHorizontalCard';
import ReviewHorizontalCardLoader from '../Reviews/Partials/ReviewHorizontalCardLoader';

interface GroupPageProps extends Record<string, unknown> {
    group: GroupData;
    proposals: PaginatedData<ProposalData[]>;
    connections: ConnectionData[];
    ideascaleProfiles: PaginatedData<IdeascaleProfileData[]>;
    reviews: PaginatedData<ReviewData[]>;
    locations: PaginatedData<LocationData[]>;
}

const Group: React.FC<GroupPageProps> = ({group, proposals, connections, ideascaleProfiles, reviews, locations}) => {
    const {t} = useTranslation();

    return (
        <>
            <Head title={`${group.name} - Group`}/>

            <header>
                <div className="container">
                    <h1 className="title-1">{group.name}</h1>
                </div>
                <div className="container">
                </div>
            </header>

            <section className="container my-8 flex flex-row gap-4">
                <div className='max-w-sm'>
                    <GroupCard group={group}/>
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
