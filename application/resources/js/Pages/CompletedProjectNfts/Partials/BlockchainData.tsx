import { Copy } from 'lucide-react';
import CompletedNftImage from "@/assets/images/completed-nft.png";
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Title from '@/Components/atoms/Title';

const BlockchainData = () => {
  const { t } = useTranslation();
  const [data] = useState({
    policyID: '656cnewjfbe82rg39udbjwbkbe82rg39udb',
    assetName: '373030303033352349',
  });
  
  return (
    <div className="rounded-lg bg-background p-2 max-w-2xl">
      <img
        src={CompletedNftImage}
        alt="NFT Preview"
        className="w-full rounded-lg mb-8"
      />
      
      <Title level='1' className="font-semibold mb-6">{t('blockchainData')}</Title>
      
      <div className="space-y-6">
        <div className="grid grid-cols-[auto,24px,1fr] md:grid-cols-[160px,24px,1fr] items-start gap-x-2">
          <span className="text-sm text-gray-500">{t('policyID')}</span>
          <button className="text-content hover:text-gray-600">
            <Copy size={16} />
          </button>
          <code className="text-sm text-content font-mono break-all">
            {data.policyID}
          </code>
        </div>

        <div className="grid grid-cols-[auto,24px,1fr] md:grid-cols-[160px,24px,1fr] items-start gap-x-2">
          <span className="text-sm text-gray-500">{t('assetName')}</span>
          <button className="text-content hover:text-gray-600">
            <Copy size={16} />
          </button>
          <code className="text-sm text-content font-mono break-all">
            {data.assetName}
          </code>
        </div>
      </div>
    </div>
  );
};

export default BlockchainData;
