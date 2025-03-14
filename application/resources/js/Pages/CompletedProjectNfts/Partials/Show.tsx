import BlockchainData from './BlockchainData';
import MetaDataPreview from './MetaDataPreview';
import MetaData from './MetaData';
import ContributorProfile from './ContributorProfile';
import Title from '@/Components/atoms/Title';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import UserData = App.DataTransferObjects.UserData;
import { PaginatedData } from '../../../../types/paginated-data';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface PageProps{
  proposal: App.DataTransferObjects.ProposalData;
  ideascaleProfiles: IdeascaleProfileData[];
  author: IdeascaleProfileData;
  artist: UserData;
  campaignTitle: string,
  nft: any;
  isOwner: boolean;
}

const Show = ({proposal, ideascaleProfiles, nft, artist, author, isOwner}: PageProps) => {
  const { t } = useTranslation();
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8">
      <Head title={t('completedProjectNfts.title')} />
      
      <div className="py-8">
        <div className="mb-8">
          <Title level='1'>{proposal.title}</Title>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <BlockchainData nft={nft}/>
          </div>

          <div className="md:col-span-8 space-y-8">
            <div>
              <MetaDataPreview ideascaleProfiles={ideascaleProfiles} nft={nft} artist={artist} isOwner={isOwner} />
            </div>
            <div>
              <MetaData nft={nft} isOwner={isOwner}/>
            </div>
          </div>
        </div>

        <div className="py-4">
          <ContributorProfile ideascaleProfiles={ideascaleProfiles} author={author} />
        </div>
      </div>
    </div>
  );
};

export default Show;
