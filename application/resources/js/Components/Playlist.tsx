'use client';

import { usePlayer } from '@/Context/PlayerContext';
import { motion } from 'framer-motion';

function WaveformBars() {
    const bars = Array.from({ length: 3 }, (_, i) => ({
        id: i,
        initialHeight: 20 + Math.random() * 20,
    }));

    return (
        <div className="size-12 flex h-full items-center space-x-[2px]">
            {bars.map((bar) => (
                <motion.div
                    key={bar.id}
                    className="w-[3px] rounded-lg bg-white"
                    initial={{ height: `${bar.initialHeight}%` }}
                    animate={{
                        height: [
                            `${bar.initialHeight}%`,
                            `${bar.initialHeight + 30}%`,
                            `${bar.initialHeight}%`,
                        ],
                    }}
                    transition={{
                        duration: 8000,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
}

export default function PlaylistAnimation() {
    const {
        currentTrackIndex,
        isPlaying,
        pauseCurrentTrack,
        playCurrentTrack,
        playlist,
        duration,
    } = usePlayer();

    const handlePlayPause = () => {
        if (isPlaying) {
            pauseCurrentTrack();
        } else {
            playCurrentTrack();
        }
    };

    return (
        <div className="mx-auto w-full  bg-[#1B2230] ">
            <div >
                <ul className="space-y-3 flex flex-col">
                    {playlist &&
                        playlist.map((track, index) => {
                            const isCurrentTrack = index === currentTrackIndex;
                            return (
                                <li
                                    className=""
                                    key={index}
                                    onClick={() =>
                                        isCurrentTrack && handlePlayPause()
                                    }
                                >
                                    <div
                                        className={`rounded-lg py-3 ${
                                            isCurrentTrack
                                                ? 'bg-blue-500'
                                                : 'bg-gray-800 transition-colors hover:bg-gray-700'
                                        }`}
                                    >
                                        {isCurrentTrack && (
                                            <motion.div
                                                className="bg-blue-600/50"
                                                initial={{ width: '0%' }}
                                                animate={{
                                                    width: isPlaying
                                                        ? '100%'
                                                        : '0%',
                                                }}
                                                transition={{
                                                    duration: duration,
                                                    ease: 'linear',
                                                    repeat: Infinity,
                                                }}
                                            />
                                        )}
                                        <div className="flex items-center justify-between truncate px-6">
                                            <div className="z-10 mr-4 flex-grow">
                                                <h4
                                                    className={`mb-1 truncate text-base font-semibold ${
                                                        isCurrentTrack
                                                            ? 'text-white'
                                                            : 'text-gray-200'
                                                    }`}
                                                >
                                                    {track.title}
                                                </h4>
                                                {/* <p
                                                    className={`truncate text-sm ${
                                                        isCurrentTrack
                                                            ? 'text-white/80'
                                                            : 'text-gray-400'
                                                    }`}
                                                >
                                                    {track.artist}
                                                </p> */}
                                            </div>
                                            <div className='relative'>
                                                {isCurrentTrack && isPlaying && (
                                                    <WaveformBars />
                                                )}
                                                {isCurrentTrack && (
                                                    <span
                                                        className={`z-10 whitespace-nowrap text-sm font-medium text-white`}
                                                    >
                                                        {duration}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                </ul>
            </div>
        </div>
    );
}
