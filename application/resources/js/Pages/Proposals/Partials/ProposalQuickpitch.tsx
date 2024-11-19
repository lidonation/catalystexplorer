import { useState, useEffect } from 'react';
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { PageProps } from "@/types";
import { useTranslation } from 'react-i18next';

interface ProposalQuickpitch extends Record<string, unknown> {
    quickpitch?: string | null;
}

type Provider = "youtube" | "vimeo" | "html5";

interface VideoData {
    id: string | null;
    provider: Provider;
    error: string | null;
}

export default function ProposalQuickpitch({ quickpitch }: PageProps<ProposalQuickpitch>) {
    const { t } = useTranslation();
    const [videoData, setVideoData] = useState<VideoData>({
        id: null,
        provider: 'html5',
        error: null
    });

    const processVideoUrl = (url?: string | null): VideoData => {
        if (!url) {
            return { 
                id: null, 
                provider: 'html5', 
                error: t('proposalQuickpitch.errors.noUrl') 
            };
        }

        try {
            new URL(url);

            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const youtubeMatch = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
                if (!youtubeMatch) {
                    return {
                        id: null,
                        provider: 'youtube',
                        error: t('proposalQuickpitch.errors.invalidYoutubeFormat')
                    };
                }
                return { id: youtubeMatch[1], provider: 'youtube', error: null };
            }

            if (url.includes('vimeo.com')) {
                const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
                if (!vimeoMatch) {
                    return {
                        id: null,
                        provider: 'vimeo',
                        error: t('proposalQuickpitch.errors.invalidVimeoFormat')
                    };
                }
                return { id: vimeoMatch[1], provider: 'vimeo', error: null };
            }

            return {
                id: null,
                provider: 'html5',
                error: t('proposalQuickpitch.errors.invalidUrlFormat')
            };
        } catch (e) {
            return {
                id: null,
                provider: 'html5',
                error: t('proposalQuickpitch.errors.invalidUrl')
            };
        }
    };

    useEffect(() => {
        const result = processVideoUrl(quickpitch);
        setVideoData(result);
    }, [quickpitch, t]);

    return (
        <section aria-labelledby="video-heading" className="h-full">
            <h2 id="video-heading" className="sr-only">
                {t('proposalQuickpitch.projectVideo')}
            </h2>
            <div className="relative h-full w-full overflow-hidden rounded-2xl">
                {videoData.error ? (
                    <div className="flex h-full items-center justify-center p-4">
                        <div className="text-center max-w-lg">
                            <p className="mb-2">
                                {videoData.error}
                            </p>
                            {quickpitch && (
                                <p className="text-sm break-all">
                                    {t('proposalQuickpitch.providedUrl')}: {quickpitch}
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    videoData.id && (
                        <Plyr
                            key={videoData.id}
                            source={{
                                type: "video",
                                sources: [
                                    {
                                        src: videoData.id,
                                        provider: videoData.provider
                                    }
                                ]
                            }}
                            options={{
                                controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
                                ratio: '16:9',
                                hideControls: false,
                                autoplay: false,
                                invertTime: false,
                                tooltips: { controls: true, seek: true },
                            }}
                        />
                    )
                )}
            </div>
        </section>
    );
}