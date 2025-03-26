import BlockchainData from './BlockchainData';
import MetaDataPreview from './MetaDataPreview';
import MetaData from './MetaData';
import ContributorProfile from './ContributorProfile';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import Title from '@/Components/atoms/Title';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import NMKRMetaData = App.DataTransferObjects.NMKRNftData;
import NftData = App.DataTransferObjects.NftData;
import UserData = App.DataTransferObjects.UserData;
import { PaginatedData } from '../../../../types/paginated-data';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface PageProps{
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
    isOwner
  }: PageProps) => {
    const { t } = useTranslation();
    
    return (
      <div className="mx-auto">
        <Head title={t('completedProjectNfts.title')} />
        
        <div className="py-8">
          <div className="mb-8 container">
            <Title level='1'>{proposal.title}</Title>
          </div>

          {nft === null ? (
            <div className="mb-8 container">
             <RecordsNotFound context="proposals" />
            </div>
          ) : (
            <>
              <div className="mt-8 container grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4 overflow-hidden mt-4">
                  <BlockchainData nft={nft} metadata={metadata}/>
                </div>

                <div className="md:col-span-8 space-y-8 mt-8 sm:mt-4">
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
                    <MetaData nft={nft} isOwner={isOwner}/>
                  </div>
                </div>
              </div>

              <div className="py-4 mt-4 container">
                <ContributorProfile contributorProfiles={contributorProfiles} author={author} isOwner={isOwner} />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

export default Show;
