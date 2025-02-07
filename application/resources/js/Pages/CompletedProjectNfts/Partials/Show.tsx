import { useState } from 'react';
import BlockchainData from './BlockchainData';
import MetaDataPreview from './MetaDataPreview';
import MetaData from './MetaData';
import ContributorProfile from './ContributorProfile';

const Show = () => {
  const [data] = useState({
    title: 'Token 2049 Side Event: Enterprise-Focused RWA',
  });

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-content">{data.title}</h1>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <BlockchainData />
          </div>

          <div className="md:col-span-8 space-y-8">
            <div>
              <MetaDataPreview />
            </div>
            <div>
              <MetaData />
            </div>
          </div>
        </div>

        <div className="py-4">
          <ContributorProfile />
        </div>
      </div>
    </div>
  );
};

export default Show;
