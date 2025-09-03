import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import Image from '@/Components/Image';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Copy } from 'lucide-react';
import { useState } from 'react';
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
            <div className="bg-background max-w-2xl rounded-lg p-2">
                <Title level="1" className="mb-6 font-semibold">
                    {t('blockchainData')}
                </Title>
                <Paragraph className="text-dark">
                    {t('noNFTDataAvailable')}
                </Paragraph>
            </div>
        );
    }

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="bg-background max-w-2xl rounded-lg p-2">
            {nft.storage_link || nft.preview_link ? (
                <Image
                    imageUrl={nft.storage_link || nft.preview_link}
                    alt="NFT Preview"
                    size="12"
                    className="mb-8 w-full rounded-lg"
                />
            ) : (
                <div className="bg-dark mb-8 flex h-64 w-full items-center justify-center rounded-lg">
                    <span className="text-content">
                        {t('noPreviewAvailable')}
                    </span>
                </div>
            )}

            <Title level="1" className="mb-6 font-semibold">
                {t('blockchainData')}
            </Title>

            <div className="space-y-6">
                <div className="grid grid-cols-[auto,24px,1fr] items-start gap-x-2 md:grid-cols-[160px,24px,1fr]">
                    <span className="text-dark text-sm">{t('policyID')}</span>
                    <Button
                        className="text-content hover:text-dark"
                        onClick={(e) => {
                            e.preventDefault();
                            copyToClipboard(metadata.policyid || '', 'policy');
                        }}
                    >
                        <Copy size={16} />
                    </Button>
                    <code className="text-content font-mono text-sm break-all">
                        {metadata.policyid ||
                            t('completedProjectNfts.unavailable')}
                        {copied === 'policy' && (
                            <span className="text-content ml-2">Copied!</span>
                        )}
                    </code>
                </div>

                <div className="grid grid-cols-[auto,24px,1fr] items-start gap-x-2 md:grid-cols-[160px,24px,1fr]">
                    <span className="text-dark text-sm">{t('assetName')}</span>
                    <Button
                        className="text-content hover:text-dark"
                        onClick={(e) => {
                            e.preventDefault();
                            copyToClipboard(metadata.assetname || '', 'name');
                        }}
                    >
                        <Copy size={16} />
                    </Button>
                    <code className="text-content font-mono text-sm break-all">
                        {metadata.assetname ||
                            t('completedProjectNfts.unavailable')}
                        {copied === 'name' && (
                            <span className="text-content ml-2">Copied!</span>
                        )}
                    </code>
                </div>
            </div>
        </div>
    );
};

export default BlockchainData;
