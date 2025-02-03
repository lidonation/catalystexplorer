import { PageProps } from '@/types';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

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

    return (
        <section aria-labelledby="video-heading" className="h-full">
            <h2 id="video-heading" className="sr-only">
                {t('proposals.projectVideo')}
            </h2>
            <div className="relative h-full w-full overflow-hidden rounded-2xl">
                {videoData.error ? (
                    <div className="flex h-full items-center justify-center p-4">
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
                    videoData.id && (
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
                    )
                )}
            </div>
        </section>
    );
}
