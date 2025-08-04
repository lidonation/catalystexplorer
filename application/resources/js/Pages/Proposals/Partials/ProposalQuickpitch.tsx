'use client'
import Title from '@/Components/atoms/Title';
import { PageProps } from '@/types';
import 'plyr-react/plyr.css';
import React, { useMemo, useState, useEffect, Suspense } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";

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

    // Memoize the video data to avoid recalculating it on every render
    const videoData = useMemo<VideoData>(() => {
        if (quickpitch) {
            return {
                id: quickpitch,
                provider: 'youtube',
                error: null,
            };
        }
        return { id: null, provider: 'html5', error: null };
    }, [quickpitch]);

    const LoadingSpinner = () => (
        <div className="flex items-center justify-center w-full h-full bg-background">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            </div>
        </div>
    );

    return (
        <section aria-labelledby="video-heading" className="h-full" data-testid="proposal-quickpitch-section">
            <Title level='2' id="video-heading" className="sr-only" data-testid="proposal-quickpitch-title">
                {t('proposals.projectVideo')}
            </Title>
            <div className="relative h-full w-full overflow-hidden rounded-2xl">
                {videoData.error ? (
                    <div className="flex h-full items-center justify-center p-4" data-testid="proposal-quickpitch-error">
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
                    videoData.id && isClient && (
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
