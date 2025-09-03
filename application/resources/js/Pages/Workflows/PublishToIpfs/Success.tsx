import ConcentricCircles from '@/assets/images/bg-concentric-circles.png';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import CopyIcon from '@/Components/svgs/CopyIcon';
import ExternalLinkIcon from '@/Components/svgs/ExternalLinkIcon';
import TickIcon from '@/Components/svgs/TickIcon';
import { VerificationBadge } from '@/Components/svgs/VerificationBadge';
import { Button } from '@headlessui/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useState } from 'react';

interface SuccessProps {
    ipfs_cid: string;
    gateway_url: string;
    filename: string;
    bookmarkHash?: string;
}

const Success: React.FC<SuccessProps> = ({ ipfs_cid, gateway_url }) => {
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
        <div
            className="splash-wrapper lg:from-background-home-gradient-color-1 lg:to-background-home-gradient-color-2 sticky z-10 -mb-4 flex justify-center md:rounded-tl-4xl lg:-top-64 lg:h-screen lg:bg-linear-to-r lg:px-8 lg:pb-8"
            data-testid="success-page-wrapper"
        >
            <div
                className="flex h-full w-full flex-col justify-center lg:gap-8 lg:px-8 lg:pt-8 lg:pb-4"
                style={{
                    backgroundImage: `url(${ConcentricCircles})`,
                    backgroundPosition: 'top',
                    backgroundRepeat: 'no-repeat',
                }}
                data-testid="success-background-container"
            >
                <div
                    className="bg-background mx-auto my-8 flex h-3/4 w-[calc(100%-4rem)] items-center justify-center rounded-lg p-8 md:w-3/4"
                    data-testid="success-content-wrapper"
                >
                    <div
                        className="flex h-full w-full flex-col items-center justify-center rounded p-8 md:w-3/4 md:shadow-sm"
                        data-testid="success-main-content"
                    >
                        <Title
                            level="4"
                            className="mx-4 mb-7 text-center font-bold"
                            data-testid="success-title"
                        >
                            {t('workflows.publishToIpfs.success.title')}
                        </Title>
                        <VerificationBadge
                            size={80}
                            data-testid="verification-badge"
                        />

                        {/* IPFS Details */}
                        <div
                            className="mt-8 max-w-full"
                            data-testid="ipfs-details-container"
                        >
                            <div className="flex w-full flex-col items-center justify-center rounded-lg p-4">
                                <Paragraph
                                    className="text-gray-persist mb-2 text-lg font-semibold"
                                    data-testid="content-id-label"
                                >
                                    {t(
                                        'workflows.publishToIpfs.success.contentIdLabel',
                                    )}
                                </Paragraph>
                                <div
                                    className="flex items-center gap-2"
                                    data-testid="cid-actions-container"
                                >
                                    <Paragraph
                                        className="text-primary max-w-full overflow-hidden text-lg break-words"
                                        data-testid="ipfs-cid-text"
                                    >
                                        {ipfs_cid.length > 16
                                            ? `${ipfs_cid.slice(0, 8)}...${ipfs_cid.slice(-8)}`
                                            : ipfs_cid}
                                    </Paragraph>
                                    <div className="relative">
                                        <Button
                                            onClick={() =>
                                                copyToClipboard(ipfs_cid)
                                            }
                                            className="hover:bg-gray-persist/10 group rounded-md p-2 transition-all duration-200 hover:scale-105"
                                            title={t(
                                                'workflows.publishToIpfs.success.copyCidTitle',
                                            )}
                                            data-testid="copy-cid-button"
                                        >
                                            {showCopiedToast ? (
                                                <TickIcon
                                                    width={16}
                                                    height={16}
                                                    className="text-green-600"
                                                    data-testid="copy-success-icon"
                                                />
                                            ) : (
                                                <CopyIcon
                                                    width={16}
                                                    height={16}
                                                    className="text-gray-persist/60 group-hover:text-gray-persist/80"
                                                    data-testid="copy-icon"
                                                />
                                            )}
                                        </Button>

                                        {/* Toast */}
                                        {showCopiedToast && (
                                            <div
                                                className="bg-gray-persist/80 animate-in fade-in absolute -top-10 left-1/2 z-10 -translate-x-1/2 transform rounded px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg duration-200"
                                                data-testid="copy-toast"
                                            >
                                                {t(
                                                    'workflows.publishToIpfs.success.copied',
                                                )}
                                                <div className="border-t-gray-persist/80 absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-2 border-r-2 border-l-2 border-transparent"></div>
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        onClick={() =>
                                            window.open(gateway_url, '_blank')
                                        }
                                        className="hover:bg-gray-persist/10 group rounded-md p-2 transition-all duration-200 hover:scale-105"
                                        title={t(
                                            'workflows.publishToIpfs.success.openInNewTabTitle',
                                        )}
                                        data-testid="open-external-button"
                                    >
                                        <ExternalLinkIcon
                                            className="group-hover:text-gray-persist/80"
                                            data-testid="external-link-icon"
                                        />
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
