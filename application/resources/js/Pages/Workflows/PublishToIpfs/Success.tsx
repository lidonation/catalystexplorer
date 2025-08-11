import React, { useState } from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import ConcentricCircles from '@/assets/images/bg-concentric-circles.png';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import { VerificationBadge } from '@/Components/svgs/VerificationBadge';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import CopyIcon from '@/Components/svgs/CopyIcon';
import ExternalLinkIcon from '@/Components/svgs/ExternalLinkIcon';
import TickIcon from '@/Components/svgs/TickIcon';
import { Button } from '@headlessui/react';

interface SuccessProps {
    ipfs_cid: string;
    gateway_url: string;
    filename: string;
    bookmarkHash?: string;
}

const Success: React.FC<SuccessProps> = ({ 
    ipfs_cid, 
    gateway_url, 
}) => {
    const { t } = useLaravelReactI18n();
    const [showCopiedToast, setShowCopiedToast] = useState(false);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setShowCopiedToast(true);
            // Hide toast after 2 seconds
            setTimeout(() => {
                setShowCopiedToast(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className="splash-wrapper lg:from-background-home-gradient-color-1 lg:to-background-home-gradient-color-2 sticky z-10 flex justify-center md:rounded-tl-4xl lg:-top-64 lg:h-screen lg:bg-linear-to-r lg:px-8 lg:pb-8 -mb-4" data-testid="success-page-wrapper">
            <div
                className="flex h-full w-full flex-col justify-center lg:gap-8 lg:px-8 lg:pt-8 lg:pb-4"
                style={{
                    backgroundImage: `url(${ConcentricCircles})`,
                    backgroundPosition: 'top',
                    backgroundRepeat: 'no-repeat',
                }}
                data-testid="success-background-container"
            >
                <div className="flex w-[calc(100%-4rem)] my-8 mx-auto md:w-3/4 h-3/4 items-center justify-center bg-background rounded-lg p-8" data-testid="success-content-wrapper">
                    <div className="flex flex-col w-full h-full md:w-3/4 items-center justify-center rounded md:shadow-sm p-8" data-testid="success-main-content">
                        <Title level="4" className="font-bold text-center mx-4 mb-7" data-testid="success-title">
                            {t('workflows.publishToIpfs.success.title')}
                        </Title>
                        <VerificationBadge size={80} data-testid="verification-badge" />
                    
                        {/* IPFS Details */}
                        <div className=" mt-8 max-w-full" data-testid="ipfs-details-container">
                            <div className="flex flex-col items-center  justify-center w-full p-4  rounded-lg">
                                <Paragraph className="text-lg font-semibold text-gray-persist mb-2" data-testid="content-id-label">
                                    {t('workflows.publishToIpfs.success.contentIdLabel')}
                                </Paragraph>
                                <div className="flex items-center gap-2" data-testid="cid-actions-container">
                                    <Paragraph className="text-lg text-primary break-words max-w-full overflow-hidden" data-testid="ipfs-cid-text">
                                        {ipfs_cid.length > 16 ? `${ipfs_cid.slice(0, 8)}...${ipfs_cid.slice(-8)}` : ipfs_cid}
                                    </Paragraph>
                                    <div className="relative">
                                        <Button
                                            onClick={() => copyToClipboard(ipfs_cid)}
                                            className="p-2 hover:bg-gray-persist/10 rounded-md transition-all duration-200 hover:scale-105 group"
                                            title={t('workflows.publishToIpfs.success.copyCidTitle')}
                                            data-testid="copy-cid-button"
                                        >
                                            {showCopiedToast ? (
                                                <TickIcon width={16} height={16} className="text-green-600" data-testid="copy-success-icon" />
                                            ) : (
                                                <CopyIcon width={16} height={16} className="text-gray-persist/60 group-hover:text-gray-persist/80" data-testid="copy-icon" />
                                            )}
                                        </Button>
                                        
                                        {/* Toast */}
                                        {showCopiedToast && (
                                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-persist/80 text-white text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap animate-in fade-in duration-200" data-testid="copy-toast">
                                                {t('workflows.publishToIpfs.success.copied')}
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-persist/80"></div>
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        onClick={() => window.open(gateway_url, '_blank')}
                                        className="p-2 hover:bg-gray-persist/10 rounded-md transition-all duration-200 hover:scale-105 group"
                                        title={t('workflows.publishToIpfs.success.openInNewTabTitle')}
                                        data-testid="open-external-button"
                                    >
                                        <ExternalLinkIcon className="group-hover:text-gray-persist/80" data-testid="external-link-icon" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Success;
