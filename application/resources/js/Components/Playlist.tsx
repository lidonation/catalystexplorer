'use client';

import { usePlayer } from '@/Context/PlayerContext';
import { useEffect, useRef } from 'react';
import Title from './atoms/Title';

function WaveformBars() {
    const bars = Array.from({ length: 3 }, (_, i) => ({
        id: i,
        initialHeight: 20 + Math.random() * 20,
    }));

    return (
        <div className="z-10 flex size-8 items-center space-x-[2px]">
            {bars.map((bar) => (
                <div
                    key={bar.id}
                    className="animate-waveform w-[3px] rounded-full bg-white"
                    style={{
                        height: `${bar.initialHeight}%`,
                        animationDelay: `${bar.id * 0.2}s`,
                    }}
                />
            ))}
        </div>
    );
}

export default function PlaylistAnimation() {
    const progressRef = useRef<HTMLDivElement>(null);
    const {
        currentTrackIndex,
        isPlaying,
        pauseCurrentTrack,
        playCurrentTrack,
        playlist,
        duration,
        progress,
        setCurrentTrackIndex,
    } = usePlayer();

    const handlePlayPause = () => {
        if (isPlaying) {
            pauseCurrentTrack();
        } else {
            playCurrentTrack();
        }
    };

    useEffect(() => {
        if (progressRef.current) {
            progressRef.current.style.width = `${progress}%`;
        }
    }, [progress]);

    return (
        <div className="relative">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Title className="text-2xl font-bold text-white">
                        Now Playing
                    </Title>
                </div>

                <ul className="space-y-3">
                    {playlist &&
                        playlist.map((track, index) => {
                            const isCurrentTrack = index === currentTrackIndex;
                            return (
                                <li
                                    key={track.title}
                                    className={
                                        !isCurrentTrack
                                            ? 'hover:cursor-pointer'
                                            : ''
                                    }
                                    onClick={() => setCurrentTrackIndex(index)}
                                >
                                    <div
                                        className={`relative flex rounded-lg p-2 ${
                                            isCurrentTrack
                                                ? 'bg-primary'
                                                : 'bg-gray-800 transition-colors hover:bg-gray-700'
                                        }`}
                                    >
                                        {isCurrentTrack && (
                                            <div
                                                ref={progressRef}
                                                className="bg-primary-dark absolute inset-0 rounded-lg transition-all duration-100 ease-linear"
                                                style={{ width: '0%' }}
                                            />
                                        )}
                                        <div className="flex w-full items-center justify-between px-6">
                                            <div className="z-10 mr-4 grow">
                                                <h4
                                                    className={`..." mb-1 truncate text-base font-semibold ${
                                                        isCurrentTrack
                                                            ? 'text-white'
                                                            : 'text-gray-200'
                                                    }`}
                                                >
                                                    {track.title}
                                                </h4>
                                            </div>
                                            {isCurrentTrack && (
                                                <div className="flex items-center gap-2">
                                                    {isPlaying && (
                                                        <WaveformBars />
                                                    )}
                                                    <span
                                                        className={`z-10 text-sm font-medium whitespace-nowrap ${
                                                            isCurrentTrack
                                                                ? 'text-white/90'
                                                                : 'text-gray-400'
                                                        }`}
                                                    >
                                                        {duration}
                                                    </span>
                                                </div>
                                            )}
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
