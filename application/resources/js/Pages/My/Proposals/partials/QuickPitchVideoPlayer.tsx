import PlayerPlayFilled from "@/Components/svgs/PlayerPlayFilled";
import { useState } from "react";

interface QuickpitchVideoPlayerProps {
    url: string;
    thumbnail: string;
    aspectRatio?: string;
}
export default function QuickpitchVideoPlayer({
    url,
    thumbnail,
    aspectRatio = 'aspect-[16/8]',
}: QuickpitchVideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
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
    return (
        <div className={`relative my-5 ${aspectRatio} w-full overflow-hidden rounded-2xl`}>
            {isPlaying ? (
                <iframe
                    src={getEmbedUrl(url)}
                    className="h-full w-full"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                />
            ) : (
                <>
                    <img
                        src={thumbnail}
                        alt="Quickpitch Thumbnail"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => setIsPlaying(true)}
                            className="cursor-pointer"
                        >
                            <PlayerPlayFilled />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
