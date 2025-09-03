import Paragraph from '@/Components/atoms/Paragraph';
import CopyIcon from '@/Components/svgs/CopyIcon';
import ExternalLinkIcon from '@/Components/svgs/ExternalLinkIcon';
import TickIcon from '@/Components/svgs/TickIcon';
import { Button } from '@headlessui/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useState } from 'react';

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
    className = 'mt-8 p-6 bg-success-light border border-success rounded-lg my-4',
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
            <div className="mb-4 text-center">
                <Paragraph className="text-success text-lg font-semibold">
                    {t('workflows.catalystDrepSignup.publishedSuccessfully')}
                </Paragraph>
            </div>

            <div className="space-y-4">
                <div>
                    <Paragraph className="text-gray-persist mb-2 text-sm font-medium opacity-70">
                        {t('workflows.catalystDrepSignup.ipfsCid')}:
                    </Paragraph>
                    <div className="flex items-center gap-2 rounded-md p-2">
                        <Paragraph className="text-primary flex-1 text-sm break-all">
                            {ipfsData.cid.length > 16
                                ? `${ipfsData.cid.slice(0, 8)}...${ipfsData.cid.slice(-8)}`
                                : ipfsData.cid}
                        </Paragraph>
                        <div className="relative">
                            <Button
                                onClick={() => copyToClipboard(ipfsData.cid)}
                                className="hover:bg-gray-persist hover:bg-opacity-10 group rounded-md p-2 transition-all duration-200 hover:scale-105"
                                title={t(
                                    'workflows.catalystDrepSignup.copyCid',
                                )}
                            >
                                {showCopiedToast ? (
                                    <TickIcon
                                        width={16}
                                        height={16}
                                        className="text-green-600"
                                    />
                                ) : (
                                    <CopyIcon
                                        width={16}
                                        height={16}
                                        className="text-gray-persist opacity-50 group-hover:opacity-70"
                                    />
                                )}
                            </Button>

                            {showCopiedToast && (
                                <div className="bg-gray-persist bg-opacity-90 animate-in fade-in absolute -top-10 left-1/2 z-10 -translate-x-1/2 transform rounded px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg duration-200">
                                    {t('workflows.catalystDrepSignup.copied')}
                                    <div className="border-t-gray-persist border-t-opacity-90 absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-2 border-r-2 border-l-2 border-transparent"></div>
                                </div>
                            )}
                        </div>
                        <Button
                            onClick={() =>
                                window.open(ipfsData.gatewayUrl, '_blank')
                            }
                            className="hover:bg-gray-persist hover:bg-opacity-10 group rounded-md p-2 transition-all duration-200 hover:scale-105"
                            title={t(
                                'workflows.catalystDrepSignup.openInNewTab',
                            )}
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
