import { Copy } from 'lucide-react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import { useState } from 'react';
import Title from '@/Components/atoms/Title';
import Paragraph from '@/Components/atoms/Paragraph';
import Button from '@/Components/atoms/Button';
import Image from '@/Components/Image';
import NMKRMetaData = App.DataTransferObjects.NMKRNftData;
import NftData = App.DataTransferObjects.NftData;

interface BlockchainDataProps {
  nft: NftData;
  metadata: NMKRMetaData;
}

const BlockchainData = ({ nft, metadata }: BlockchainDataProps) => {
  const { t } = useLaravelReactI18n();
  const [copied, setCopied] = useState<string | null>(null);

  if (!nft) {
    return (
      <div className="rounded-lg bg-background p-2 max-w-2xl">
        <Title level='1' className="font-semibold mb-6">{t('blockchainData')}</Title>
        <Paragraph className="text-dark">{t('noNFTDataAvailable')}</Paragraph>
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
        <Image
          imageUrl={nft.storage_link || nft.preview_link}
          alt="NFT Preview"
          size = '12'
          className="w-full rounded-lg mb-8"
        />
      ) : (
        <div className="w-full h-64 bg-dark rounded-lg mb-8 flex items-center justify-center">
          <span className="text-content">{t('noPreviewAvailable')}</span>
        </div>
      )}

      <Title level='1' className="font-semibold mb-6">{t('blockchainData')}</Title>

      <div className="space-y-6">
        <div className="grid grid-cols-[auto,24px,1fr] md:grid-cols-[160px,24px,1fr] items-start gap-x-2">
          <span className="text-sm text-dark">{t('policyID')}</span>
          <Button
            className="text-content hover:text-dark"
            onClick={(e) => {
              e.preventDefault();
              copyToClipboard(metadata.policyid || '', 'policy');
            }}
          >
            <Copy size={16} />
          </Button>
          <code className="text-sm text-content font-mono break-all">
            {metadata.policyid || t("completedProjectNfts.unavailable")}
            {copied === 'policy' && <span className="text-content ml-2">Copied!</span>}
          </code>
        </div>

        <div className="grid grid-cols-[auto,24px,1fr] md:grid-cols-[160px,24px,1fr] items-start gap-x-2">
          <span className="text-sm text-dark">{t('assetName')}</span>
          <Button
            className="text-content hover:text-dark"
            onClick={(e) => {
              e.preventDefault();
              copyToClipboard(metadata.assetname || '', 'name');
            }}
          >
            <Copy size={16} />
          </Button>
          <code className="text-sm text-content font-mono break-all">
            {metadata.assetname || t("completedProjectNfts.unavailable")}
            {copied === 'name' && <span className="text-content ml-2">Copied!</span>}
          </code>
        </div>
      </div>
    </div>
  );
};

export default BlockchainData;
