import PlayerPause from '@/Components/svgs/PlayerPause';
import PlayerRewindLeft from '@/Components/svgs/PlayerRewindLeft';
import PlayerRewindRight from '@/Components/svgs/PlayerRewindRight';
import PlayerSkipBack from '@/Components/svgs/PlayerSkipBack';
import PlayerSkipForward from '@/Components/svgs/PlayerSkipForward';
import PlayerStop from '@/Components/svgs/PlayerStop';
import VideoCameraIcon from '@/Components/svgs/VideoCameraIcon';
import { useUIContext } from '@/Context/SharedUIContext';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';
import React, { useEffect, useRef, useState } from 'react';

const PlayerBar: React.FC = () => {
    const { isPlayerBarExpanded, togglePlayerBar } = useUIContext();
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    const handleSpeedChange = () => {
        const newSpeed = playbackSpeed === 2 ? 0.5 : playbackSpeed + 0.5;
        setPlaybackSpeed(newSpeed);
    };
    const plyrInstance = useRef(null);

    useEffect(() => console.log({ plyrInstance }, [plyrInstance]));

    return (
        <div
            className={`sticky inset-x-0 bottom-0 mx-auto transition-all duration-300 ${
                isPlayerBarExpanded ? 'w-full max-w-xl' : 'w-16'
            } flex items-center justify-between overflow-hidden rounded-xl bg-bg-dark px-4 py-3 text-white shadow-lg`}
            onClick={togglePlayerBar}
        >
            <div className="hidden">
                <Plyr
                    ref={plyrInstance}
                    key={'QoHxrFBM0f'}
                    source={{
                        type: 'video',
                        sources: [
                            {
                                src: 'QoHxrFBM0f',
                                provider: 'html5',
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
            </div>
            {/* Video Camera Icon for Collapsed State */}
            {!isPlayerBarExpanded && (
                <button className="flex h-12 w-12 items-center justify-center">
                    <VideoCameraIcon />
                </button>
            )}

            {/* Expanded Player Bar with Controls */}
            {isPlayerBarExpanded && (
                <div className="flex w-full items-center space-x-2 sm:space-x-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <button className="background-button-gradient-color-2 flex h-8 w-8 items-center justify-center rounded-md border border-dark hover:bg-dark sm:h-12 sm:w-12">
                            <PlayerSkipBack />
                        </button>
                        <button
                            onClick={() => {}}
                            className="background-button-gradient-color-2 flex h-8 w-8 items-center justify-center rounded-md border border-dark hover:bg-dark sm:h-12 sm:w-12"
                        >
                            <PlayerPause />
                        </button>
                        <button className="background-button-gradient-color-2 flex h-8 w-8 items-center justify-center rounded-md border border-dark hover:bg-dark sm:h-12 sm:w-12">
                            <PlayerStop />
                        </button>
                        <button className="background-button-gradient-color-2 flex h-8 w-8 items-center justify-center rounded-md border border-dark hover:bg-dark sm:h-12 sm:w-12">
                            <PlayerSkipForward />
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="mx-2 h-8 w-px bg-gray-600 sm:mx-4 sm:h-12" />

                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <button className="background-button-gradient-color-2 flex h-8 w-8 items-center justify-center rounded-md border border-gray-600 hover:bg-dark sm:h-12 sm:w-12">
                            <PlayerRewindLeft />
                        </button>
                        <div className="text-xs sm:text-sm">
                            <span>0:00</span>
                            <span className="mx-1">/</span>
                            <span>5:00</span>
                        </div>
                        <button className="background-button-gradient-color-2 flex h-8 w-8 items-center justify-center rounded-md border border-gray-600 hover:bg-dark sm:h-12 sm:w-12">
                            <PlayerRewindRight />
                        </button>
                        <button
                            onClick={handleSpeedChange}
                            className="background-button-gradient-color-2 flex h-8 w-8 items-center justify-center rounded-md border border-gray-600 text-xs hover:bg-dark sm:h-12 sm:w-12 sm:text-sm"
                        >
                            {playbackSpeed}x
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerBar;
