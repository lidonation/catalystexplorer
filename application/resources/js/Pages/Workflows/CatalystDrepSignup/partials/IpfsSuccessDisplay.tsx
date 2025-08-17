import React, { useState } from 'react';
import { Button } from '@headlessui/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import Paragraph from '@/Components/atoms/Paragraph';
import CopyIcon from '@/Components/svgs/CopyIcon';
import ExternalLinkIcon from '@/Components/svgs/ExternalLinkIcon';
import TickIcon from '@/Components/svgs/TickIcon';

interface IpfsSuccessDisplayProps {
    ipfsData: {
        cid: string;
        gatewayUrl: string;
        filename: string;
    };
    className?: string;
}

const IpfsSuccessDisplay: React.FC<IpfsSuccessDisplayProps> = ({ 
    ipfsData, 
    className = "mt-8 p-6 bg-success-light border border-success rounded-lg my-4" 
}) => {
    const { t } = useLaravelReactI18n();
    const [showCopiedToast, setShowCopiedToast] = useState(false);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setShowCopiedToast(true);
            setTimeout(() => {
                setShowCopiedToast(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className={className}>
            <div className="text-center mb-4">
                <Paragraph className="text-lg font-semibold text-success">
                    {t('workflows.catalystDrepSignup.publishedSuccessfully')}
                </Paragraph>
            </div>
            
            <div className="space-y-4">
                <div>
                    <Paragraph className="text-sm font-medium text-gray-persist opacity-70 mb-2">
                        {t('workflows.catalystDrepSignup.ipfsCid')}:
                    </Paragraph>
                    <div className="flex items-center gap-2 p-2 rounded-md">
                        <Paragraph className="text-sm text-primary break-all flex-1">
                            {ipfsData.cid.length > 16 ? `${ipfsData.cid.slice(0, 8)}...${ipfsData.cid.slice(-8)}` : ipfsData.cid}
                        </Paragraph>
                        <div className="relative">
                            <Button
                                onClick={() => copyToClipboard(ipfsData.cid)}
                                className="p-2 hover:bg-gray-persist hover:bg-opacity-10 rounded-md transition-all duration-200 hover:scale-105 group"
                                title={t('workflows.catalystDrepSignup.copyCid')}
                            >
                                {showCopiedToast ? (
                                    <TickIcon width={16} height={16} className="text-green-600" />
                                ) : (
                                    <CopyIcon width={16} height={16} className="text-gray-persist opacity-50 group-hover:opacity-70" />
                                )}
                            </Button>
                            
                            {showCopiedToast && (
                                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-persist bg-opacity-90 text-white text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap animate-in fade-in duration-200">
                                    {t('workflows.catalystDrepSignup.copied')}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-persist border-t-opacity-90"></div>
                                </div>
                            )}
                        </div>
                        <Button
                            onClick={() => window.open(ipfsData.gatewayUrl, '_blank')}
                            className="p-2 hover:bg-gray-persist hover:bg-opacity-10 rounded-md transition-all duration-200 hover:scale-105 group"
                            title={t('workflows.catalystDrepSignup.openInNewTab')}
                        >
                            <ExternalLinkIcon className="text-gray-persist opacity-50 group-hover:opacity-70" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IpfsSuccessDisplay;
