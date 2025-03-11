import { Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Title from '@/Components/atoms/Title';
import { Link } from '@inertiajs/react';

interface BlockchainDataProps {
  nft: any;
}

const BlockchainData = ({ nft }: BlockchainDataProps) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState<string | null>(null);

  if (!nft) {
    return (
      <div className="rounded-lg bg-background p-2 max-w-2xl">
        <Title level='1' className="font-semibold mb-6">{t('blockchainData')}</Title>
        <p className="text-gray-500">{t('noNFTDataAvailable')}</p>
      </div>
    );
  }
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="rounded-lg bg-background p-2 max-w-2xl">
      {nft.storage_link || nft.preview_link ? (
        <img
          src={nft.storage_link || nft.preview_link}
          alt="NFT Preview"
          className="w-full rounded-lg mb-8"
        />
      ) : (
        <div className="w-full h-64 bg-gray-200 rounded-lg mb-8 flex items-center justify-center">
          <span className="text-content">{t('noPreviewAvailable')}</span>
        </div>
      )}
      
      <Title level='1' className="font-semibold mb-6">{t('blockchainData')}</Title>
      
      <div className="space-y-6">
        <div className="grid grid-cols-[auto,24px,1fr] md:grid-cols-[160px,24px,1fr] items-start gap-x-2">
          <span className="text-sm text-dark">{t('policyID')}</span>
          <Link 
            href="#"
            className="text-content hover:text-dark"
            onClick={(e) => {
              e.preventDefault();
              copyToClipboard(nft.policy || '', 'policy');
            }}
          >
            <Copy size={16} />
          </Link>
          <code className="text-sm text-content font-mono break-all">
            {nft.policy || 'Not available'}
            {copied === 'policy' && <span className="text-content ml-2">Copied!</span>}
          </code>
        </div>

        <div className="grid grid-cols-[auto,24px,1fr] md:grid-cols-[160px,24px,1fr] items-start gap-x-2">
          <span className="text-sm text-dark">{t('assetName')}</span>
          <Link 
            href="#"
            className="text-content hover:text-dark"
            onClick={(e) => {
              e.preventDefault();
              copyToClipboard(nft.name || '', 'name');
            }}
          >
            <Copy size={16} />
          </Link>
          <code className="text-sm text-content font-mono break-all">
            {nft.name || t("unavailable")}
            {copied === 'name' && <span className="text-content ml-2">Copied!</span>}
          </code>
        </div>
      </div>
    </div>
  );
};

export default BlockchainData;
