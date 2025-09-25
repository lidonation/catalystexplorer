'use client';
import Title from '@/Components/atoms/Title';
import { PageProps } from '@/types';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import 'plyr-react/plyr.css';
import React, { Suspense, useEffect, useMemo, useState } from 'react';

const Plyr = React.lazy(() => import('plyr-react'));

interface ProposalQuickpitch extends Record<string, unknown> {
    quickpitch?: string | null;
}

type Provider = 'youtube' | 'vimeo' | 'html5';

interface VideoData {
    id: string | null;
    provider: Provider;
    error: string | null;
}

export default function ProposalQuickpitch({
    quickpitch,
}: PageProps<ProposalQuickpitch>) {
    const { t } = useLaravelReactI18n();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    function extractYouTubeId(url: string): string | null {
        try {
            const regExp =
                /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            return match && match[1].length === 11 ? match[1] : null;
        } catch {
            return null;
        }
    }

    const videoData = useMemo<VideoData>(() => {
        if (quickpitch) {
            const id = extractYouTubeId(quickpitch);
            if (!id) {
                return {
                    id: null,
                    provider: 'youtube',
                    error: 'Invalid YouTube URL',
                };
            }
            return { id, provider: 'youtube', error: null };
        }
        return { id: null, provider: 'html5', error: null };
    }, [quickpitch]);

    const LoadingSpinner = () => (
        <div className="bg-background flex h-full w-full items-center justify-center">
            <div className="text-center">
                <div className="border-primary mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
        </div>
    );

    return (
        <section
            aria-labelledby="video-heading"
            className="h-full"
            data-testid="proposal-quickpitch-section"
        >
            <Title
                level="2"
                id="video-heading"
                className="sr-only"
                data-testid="proposal-quickpitch-title"
            >
                {t('proposals.projectVideo')}
            </Title>
            <div className="relative h-full w-full overflow-hidden rounded-2xl">
                {videoData.error ? (
                    <div
                        className="flex h-full items-center justify-center p-4"
                        data-testid="proposal-quickpitch-error"
                    >
                        <div className="max-w-lg text-center">
                            <p className="mb-2">{videoData.error}</p>
                            {quickpitch && (
                                <p className="text-sm break-all">
                                    {t('proposals.providedUrl')}: {quickpitch}
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    videoData.id &&
                    isClient && (
                        <Suspense fallback={<LoadingSpinner />}>
                            <Plyr
                                key={videoData.id}
                                source={{
                                    type: 'video',
                                    sources: [
                                        {
                                            src: videoData.id,
                                            provider: videoData.provider,
                                        },
                                    ],
                                }}
                                options={{
                                    controls: [
                                        'play-large',
                                        'play',
                                        'progress',
                                        'current-time',
                                        'mute',
                                        'volume',
                                        'fullscreen',
                                    ],
                                    ratio: '16:9',
                                    hideControls: false,
                                    autoplay: false,
                                    invertTime: false,
                                    tooltips: { controls: true, seek: true },
                                }}
                            />
                        </Suspense>
                    )
                )}
            </div>
        </section>
    );
}
