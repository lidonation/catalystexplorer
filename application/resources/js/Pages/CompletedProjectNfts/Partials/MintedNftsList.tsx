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
      <div className="text-center text-slate text-lg">
        <RecordsNotFound />
      </div>
    );
  }

  return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 p-4">
          {nfts.map((nft, index) => (
              <MintedNftsCard
                  key={index}
                  image={nft.preview_link}
                  fingerprint={nft.fingerprint}
                  name={nft.name || 'Unnamed NFT'}
                  description={nft.description || 'No description available'}
                  preview_link={nft.preview_link}
              />
          ))}
      </div>
  );
};

export default MintedNftsList;
