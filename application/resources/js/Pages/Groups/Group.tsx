import React from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import GroupData = App.DataTransferObjects.GroupData;
import ProposalData = App.DataTransferObjects.ProposalData;
import GroupCard from "@/Pages/Groups/Partials/GroupCard";
import { PaginatedData } from "../../../types/paginated-data";
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ReviewData = App.DataTransferObjects.ReviewData;
import LocationData = App.DataTransferObjects.LocationData;
import ConnectionData = App.DataTransferObjects.ConnectionData;
import Title from '@/Components/atoms/Title';
import GroupSocials from './Partials/GroupSocials';
import Image from '@/Components/Image';
import GroupHeader from '@/assets/images/group-header.jpg';
import GroupTabs from './Partials/GroupTab';

interface GroupPageProps extends Record<string, unknown> {
    group: GroupData;
    proposals: PaginatedData<ProposalData[]>;
    connections: ConnectionData;
    ideascaleProfiles: PaginatedData<IdeascaleProfileData[]>;
    reviews: PaginatedData<ReviewData[]>;
    locations: PaginatedData<LocationData[]>;
}

const Group: React.FC<GroupPageProps> = ({ group, proposals, connections, ideascaleProfiles, reviews, locations }) => {
    const { t } = useTranslation();

    return (
        <>
            <Head title={`${group.name} - Group`} />

            <header className="relative">
                <div className="overflow-hidden rounded-lg mx-8 mt-4 sm:mx-10 h-80 sm:h-full">
                    <Image
                        imageUrl={group.hero_img_url || GroupHeader}
                        size="w-full h-full object-cover"
                    />
                </div>
                <div className="container px-4 relative -mt-10 sm:-mt-15">
                    <div className="flex flex-row items-start">
                        <Image
                            imageUrl={group.profile_photo_url}
                            size="ml-8 sm:ml-2 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full"
                        />
                        <div className="ml-5 pt-12 sm:pt-20">
                            <Title className="text-xl sm:text-2xl font-bold text-content drop-shadow-lg mb-2">
                                {group.name}
                            </Title>
                            <GroupSocials group={group} />
                        </div>
                    </div>
                </div>
            </header>

            <section className="container mx-auto px-8 sm:px-1 mt-10 flex flex-col lg:flex-row gap-8">
                <div className="w-full h-full lg:w-1/3 xl:w-1/4">
                    <GroupCard group={group}/>
                </div>

                <div className="flex flex-col gap-8 w-full lg:w-2/3 xl:w-3/4 shadow-xl bg-background p-4 rounded-lg">
                    <GroupTabs
                        group={group}
                        proposals={proposals}
                        connections={connections}
                        ideascaleProfiles={ideascaleProfiles}
                        reviews={reviews}
                        locations={locations}
                    />
                </div>
            </section>
        </>
    );
};

export default Group;
