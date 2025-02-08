import {Head, WhenVisible} from '@inertiajs/react';
import {useTranslation} from 'react-i18next';
import RelatedProposals from '../Proposals/Partials/RelatedProposals';
import GroupData = App.DataTransferObjects.GroupData;
import ProposalData = App.DataTransferObjects.ProposalData;
import GroupCard from "@/Pages/Groups/Partials/GroupCard";
import {PaginatedData} from "../../../types/paginated-data";
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ReviewData = App.DataTransferObjects.ReviewData;
import LocationData = App.DataTransferObjects.LocationData;

interface GroupPageProps extends Record<string, unknown> {
    group: GroupData;
    proposals: PaginatedData<ProposalData[]>;
    ideascaleProfiles: PaginatedData<IdeascaleProfileData[]>;
    reviews: PaginatedData<ReviewData[]>;
    locations: PaginatedData<LocationData[]>;
}

const Group: React.FC<GroupPageProps> = ({group, proposals, ideascaleProfiles, reviews, locations}) => {
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

                <div className='flex flex-col gap-32'>
                    <WhenVisible data="proposals" fallback={<div>Loading Proposals...</div>}>
                        <RelatedProposals
                            proposals={proposals}
                            groupId={group.id ?? undefined}
                            className='proposals-wrapper w-full grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3'
                        />
                    </WhenVisible>

                    <section>
                        <h2>Connections</h2>
                    </section>

                    <section>
                        <WhenVisible data='ideascaleProfiles' fallback={<div>Loading Ideascale Profiles</div>}>
                            <div className='w-full overflow-auto'>
                                <h1>Ideascale Profiles</h1>

                                {typeof ideascaleProfiles?.data !== 'undefined' && (
                                    <div className='max-w-lg'>
                                        {JSON.stringify(ideascaleProfiles?.data)}
                                    </div>
                                )}
                            </div>
                        </WhenVisible>
                    </section>

                    <section>
                        <WhenVisible data='reviews' fallback={<div>Loading Reviews</div>}>
                            <div className='w-full overflow-auto'>
                                <h1>Reviews</h1>

                                {typeof reviews?.data !== 'undefined' && (
                                    <div className='max-w-lg'>
                                        {JSON.stringify(reviews?.data)}
                                    </div>
                                )}
                            </div>
                        </WhenVisible>
                    </section>

                    <section>
                        <WhenVisible data='locations' fallback={<div>Loading Locations</div>}>
                            <div className='w-full overflow-auto'>
                                <h1>Locations</h1>

                                {typeof locations?.data !== 'undefined' && (
                                    <div className='max-w-lg'>
                                        {JSON.stringify(locations?.data)}
                                    </div>
                                )}
                            </div>
                        </WhenVisible>
                    </section>
                </div>
            </section>
        </>
    );
};

export default Group;
