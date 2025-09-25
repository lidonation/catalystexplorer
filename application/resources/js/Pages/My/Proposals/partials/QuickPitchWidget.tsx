import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton.tsx';
import TextInput from '@/Components/atoms/TextInput';
import Card from '@/Components/Card';
import CommentIcon from '@/Components/svgs/CommentIcon';
import DurationIcon from '@/Components/svgs/DurationIcon';
import EyeIcon from '@/Components/svgs/EyeIcon';
import ThumbsUpIcon from '@/Components/svgs/ThumbsUpIcon';
import VideoCameraIcon from '@/Components/svgs/VideoCameraIcon';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { shortNumber } from '@/utils/shortNumber';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { StarIcon } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import QuickpitchVideoPlayer from './QuickPitchVideoPlayer';
import VideoStatsComponent from './VideoStatsComponent';

interface QuickPitchWidgetProps {
    proposal: App.DataTransferObjects.ProposalData;
    quickpitchMetadata: {
        thumbnail: string;
        views: number;
        likes: number;
        comments: number;
        favoriteCount: number;
        duration?: number;
    } | null;
}

export default function QuickPitchWidget({
    proposal,
    quickpitchMetadata,
}: QuickPitchWidgetProps) {
    const { t } = useLaravelReactI18n();
    const [url, setUrl] = useState(proposal.quickpitch || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const successMessage = proposal?.quickpitch
        ? t('widgets.quickPitch.success')
        : t('widgets.quickPitch.addSuccess');

    const updateRoute = useLocalizedRoute('my.proposals.quickpitch.update', {
        proposal: proposal.id,
    });

    const deleteRoute = useLocalizedRoute('my.proposals.quickpitch.delete', {
        proposal: proposal.id,
    });

    const validateUrl = (url: string): string | null => {
        if (!url.trim()) return t('widgets.quickPitch.errors.required');

        const youtubeRegex =
            /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)(\d+)/;

        if (!youtubeRegex.test(url) && !vimeoRegex.test(url)) {
            return t('widgets.quickPitch.errors.invalidUrl');
        }

        return null;
    };

    const normalizeYouTubeUrl = (url: string): string => {
        const youtubeRegex =
            /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(youtubeRegex);

        if (match && match[1]) {
            return `https://youtu.be/${match[1]}`;
        }

        return url;
    };

    const getEmbedUrl = (url: string) => {
        const ytMatch = url.match(
            /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^"&?\/\s]{11})/,
        );
        if (ytMatch && ytMatch[1]) {
            return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
        }

        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch && vimeoMatch[1]) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
        }

        return url;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateUrl(url);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        const normalizedUrl = normalizeYouTubeUrl(url.trim());

        try {
            router.patch(
                updateRoute,
                {
                    quickpitch: normalizedUrl,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(successMessage, {
                            className: 'bg-background text-content',
                            toastId: 'copied-to-clipboard',
                        });
                        setUrl(normalizedUrl);
                        setTimeout(() => setSuccess(false), 3000);
                    },
                    onError: (errors: any) => {
                        toast.error(
                            t('widgets.quickPitch.errors.updateFailed'),
                            {
                                className: 'bg-background text-content',
                                toastId: 'update-failed',
                            },
                        );
                    },
                },
            );
        } catch (err) {
            setError(t('widgets.quickPitch.errors.updateFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const deleteQuickPitch = async () => {
        try {
            router.patch(
                deleteRoute,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setSuccess(true);
                        setUrl('');
                        toast.success(t('widgets.quickPitch.deleteSuccess'), {
                            className: 'bg-background text-content',
                            toastId: 'copied-to-clipboard',
                        });

                        setTimeout(() => setSuccess(false), 3000);
                    },
                    onError: (errors: any) => {
                        setError(
                            errors.quickpitch ||
                                t('widgets.quickPitch.errors.deleteFailed'),
                        );
                        toast.error(
                            t('widgets.quickPitch.errors.deleteFailed'),
                            {
                                className: 'bg-background text-content',
                                toastId: 'update-failed',
                            },
                        );
                    },
                },
            );
        } catch (err) {
            setError(t('widgets.quickPitch.errors.deleteFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const formatDuration = (seconds?: number | string): string => {
        if (seconds === undefined || seconds === null) return '00:00:00';
        const numSeconds =
            typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
        if (isNaN(numSeconds) || numSeconds < 0) return '00:00:00';

        const hrs = Math.floor(numSeconds / 3600);
        const mins = Math.floor((numSeconds % 3600) / 60);
        const secs = numSeconds % 60;

        return [
            hrs.toString().padStart(2, '0'),
            mins.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0'),
        ].join(':');
    };

    return (
        <Card>
            <div className="border-gray-persist/80 mb-4 flex items-center justify-between border-b pb-5">
                <h3 className="text-content text-lg font-semibold">
                    {t('widgets.quickPitch.title')}
                </h3>
                {quickpitchMetadata?.duration && (
                    <div className="flex items-center justify-center gap-2">
                        <span>
                            <DurationIcon />
                        </span>
                        <span className="text-content/50 text-sm">
                            {formatDuration(
                                quickpitchMetadata?.duration ??
                                    proposal.quickpitch_length,
                            )}
                        </span>
                    </div>
                )}
            </div>
            {proposal?.quickpitch && quickpitchMetadata ? (
                <QuickpitchVideoPlayer
                    url={proposal.quickpitch!}
                    thumbnail={quickpitchMetadata.thumbnail}
                    aspectRatio="aspect-video"
                />
            ) : (
                <div className="bg-background-lighter mb-5 flex items-center justify-center rounded-2xl p-24">
                    <VideoCameraIcon
                        className="text-primary"
                        width={85}
                        height={84}
                    />
                </div>
            )}

            <div className="mt-2 mb-5 flex items-center space-x-2">
                <VideoStatsComponent
                    icon={<EyeIcon />}
                    count={shortNumber(quickpitchMetadata?.views) || 0}
                />
                <VideoStatsComponent
                    icon={<ThumbsUpIcon />}
                    count={shortNumber(quickpitchMetadata?.likes) || 0}
                />
                <VideoStatsComponent
                    icon={
                        <CommentIcon
                            width={16}
                            height={16}
                            className="text-primary"
                        />
                    }
                    count={shortNumber(quickpitchMetadata?.comments, 2) || 0}
                />
                <VideoStatsComponent
                    icon={
                        <StarIcon
                            width={16}
                            height={16}
                            className="text-warning"
                        />
                    }
                    count={quickpitchMetadata?.favoriteCount || 0}
                />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="quickpitch-url"
                        className="text-content/60 mb-2 block text-sm font-medium"
                    >
                        {t('widgets.quickPitch.urlLabel')}
                    </label>
                    <div className="mt-1">
                        <TextInput
                            id="url"
                            type="url"
                            placeholder="https://youtu.be/dQw4w9WgXcQ"
                            className="mt-1 w-full"
                            value={url}
                            required
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>
                    <p className="text-content/50 mt-1 text-xs">
                        {t('widgets.quickPitch.supportedFormats')}
                    </p>
                    {error && (
                        <div>
                            <Paragraph size="sm" className="text-error">
                                {error}
                            </Paragraph>
                        </div>
                    )}
                </div>

                <div
                    className={`grid w-full ${proposal?.quickpitch ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}
                >
                    <PrimaryButton
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2"
                        loading={isLoading}
                    >
                        {proposal?.quickpitch
                            ? t('widgets.quickPitch.update')
                            : t('widgets.quickPitch.add')}
                    </PrimaryButton>
                    {proposal?.quickpitch && (
                        <Button
                            className="bg-error text-sm font-medium tracking-widest text-white"
                            onClick={deleteQuickPitch}
                            type="button"
                        >
                            {t('widgets.quickPitch.deleteVideo')}
                        </Button>
                    )}
                </div>
            </form>
        </Card>
    );
}
