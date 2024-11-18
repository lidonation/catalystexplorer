import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { PageProps } from "@/types";

interface ProposalQuickpitch extends Record<string, unknown> {
    quickpitch?: string | null;
}

export default function ProposalQuickpitch({ quickpitch }: PageProps<ProposalQuickpitch>) {
    // Extract video ID for different providers
    const extractVideoId = (url?: string | null) => {
        if (!url) return null;

        if (url.includes('youtube.com')) {
            const youtubeMatch = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
            return youtubeMatch ? youtubeMatch[1] : null;
        }

        if (url.includes('vimeo.com')) {
            const vimeoMatch = url.match(/\/(\d+)/);
            return vimeoMatch ? vimeoMatch[1] : null;
        }

        return null;
    }; 

    // Determine provider based on the URL
    const getProvider = (url?: string | null) => {
        if (!url) return 'html5';
        if (url.includes('youtube.com')) return 'youtube';
        if (url.includes('vimeo.com')) return 'vimeo';
        return 'html5';
    };

    const videoId = extractVideoId(quickpitch);
    const provider = getProvider(quickpitch);

    return (
        <section aria-labelledby="video-heading" className="h-full">
            <h2 id="video-heading" className="sr-only">
                Project Video
            </h2>
            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-b from-blue-200 to-purple-200">
                {videoId && (
                    <Plyr
                        source={{
                            type: "video", 
                            sources: [
                                {
                                    src: videoId,
                                    provider: provider
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
                )}
            </div>
        </section>
    );
}
