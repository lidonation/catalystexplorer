import React from 'react';
import MintedNftsCard from './MintedNftsCard';
import NftData = App.DataTransferObjects.NftData;
import RecordsNotFound from '@/Layouts/RecordsNotFound';

interface MintedNftsListProps {
  nfts: NftData[];
}

const MintedNftsList: React.FC<MintedNftsListProps> = ({ nfts }) => {

  if (!nfts?.length) {
    return (
      <div className="text-center text-gray-500 text-lg">
        <RecordsNotFound />
      </div>
    );
  }

  return (
    <div className="grid gap-6 p-4 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
      {nfts.map((nft, index) => (
        <MintedNftsCard
          key={index}
          image={nft.preview_link}
          name={nft.name || 'Unnamed NFT'}
          description={nft.description || 'No description available'}
          preview_link={nft.preview_link}
          onView={() =>
            window.location.href = `/completed-project-nfts/${nft.id}/mint`
          }
        />
      ))}
    </div>
  );
};

export default MintedNftsList;
