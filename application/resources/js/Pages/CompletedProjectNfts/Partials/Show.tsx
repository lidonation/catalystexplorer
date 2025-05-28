import Title from '@/Components/atoms/Title';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { PaginatedData } from '@/types/paginated-data';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import BlockchainData from './BlockchainData';
import ContributorProfile from './ContributorProfile';
import MetaData from './MetaData';
import MetaDataPreview from './MetaDataPreview';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import NMKRMetaData = App.DataTransferObjects.NMKRNftData;
import NftData = App.DataTransferObjects.NftData;
import UserData = App.DataTransferObjects.UserData;

interface PageProps {
    proposal: App.DataTransferObjects.ProposalData;
    ideascaleProfiles: PaginatedData<IdeascaleProfileData[]>;
    claimedProfile: IdeascaleProfileData;
    contributorProfiles: IdeascaleProfileData[];
    artist: UserData;
    author: IdeascaleProfileData;
    nft: NftData | null;
    metadata: NMKRMetaData;
    isOwner: boolean;
}

const Show = ({
    proposal,
    ideascaleProfiles,
    nft,
    metadata,
    artist,
    author,
    contributorProfiles,
    claimedProfile,
    isOwner,
}: PageProps) => {
    const { t } = useTranslation();

    return (
        <div className="mx-auto">
            <Head title={t('completedProjectNfts.title')} />

            <div className="py-8">
                <div className="container mb-8">
                    <Title level="1">{proposal.title}</Title>
                </div>

                {nft === null ? (
                    <div className="container mb-8">
                        <RecordsNotFound context="proposals" />
                    </div>
                ) : (
                    <>
                        <div className="container mt-8 grid grid-cols-1 gap-4 md:grid-cols-12">
                            <div className="mt-4 overflow-hidden md:col-span-4">
                                <BlockchainData nft={nft} metadata={metadata} />
                            </div>

                            <div className="mt-8 space-y-8 sm:mt-4 md:col-span-8">
                                <div>
                                    <MetaDataPreview
                                        ideascaleProfiles={ideascaleProfiles}
                                        nft={nft}
                                        artist={artist}
                                        metadata={metadata}
                                        claimedProfile={claimedProfile}
                                    />
                                </div>
                                <div>
                                    <MetaData nft={nft} isOwner={isOwner} />
                                </div>
                            </div>
                        </div>

                        <div className="container mt-4 py-4">
                            <ContributorProfile
                                contributorProfiles={contributorProfiles}
                                author={author}
                                isOwner={isOwner}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Show;
