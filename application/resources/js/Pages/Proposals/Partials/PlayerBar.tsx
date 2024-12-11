import { useState, useRef } from "react";
import PlayerSkipBack from "@/Components/svgs/PlayerSkipBack"
import PlayerSkipForward from "@/Components/svgs/PlayerSkipForward"
import PlayerRewindLeft from "@/Components/svgs/PlayerRewindLeft"
import PlayerRewindRight from "@/Components/svgs/PlayerRewindRight"
import PlayerStop from "@/Components/svgs/PlayerStop"
import PlayerPlay from "@/Components/svgs/PlayerPlay"
import VideoCameraIcon from "@/Components/svgs/VideoCameraIcon"
import PlayerPause from "@/Components/svgs/PlayerPause"


const PlayerBar = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const handleSpeedChange = () => {
        const newSpeed = playbackSpeed === 2 ? 0.5 : playbackSpeed + 0.5;
        setPlaybackSpeed(newSpeed);
    };
    return (
        <div
            className={`sticky bottom-0 inset-x-0 mx-auto transition-all duration-300 ${isPlaying ? "w-11/12 max-w-xl" : "w-16"}
                bg-gray-800 text-white flex items-center justify-between py-2 px-4 rounded-xl shadow-lg border border-gray-700 overflow-hidden`}
        >
            {/* Left Section (Only visible when expanded) */}
            {isPlaying && (
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <button
                        className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-md border border-gray-600"
                    >
                        <PlayerSkipBack />
                    </button>
                    <button
                        onClick={togglePlay}
                        className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-md border border-gray-600"
                    >
                        <PlayerPause />
                    </button>
                    <button
                        className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-md border border-gray-600"
                    >
                        <PlayerStop />
                    </button>
                    <button
                        className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-md border border-gray-600"
                    >
                        <PlayerSkipForward />
                    </button>
                </div>
            )}

            {/* Divider */}
            {isPlaying && (
                <div className="w-px h-8 sm:h-10 bg-gray-600 mx-2 sm:mx-4"></div>
            )}

            {isPlaying ? (
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <button
                        className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-md border border-gray-600"
                    >
                        <PlayerRewindLeft />
                    </button>
                    <div className="text-xs sm:text-sm font-mono">
                        <span>0:00</span>
                        <span className="mx-1">/</span>
                        <span>5:00</span>
                    </div>
                    <button
                        className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-md border border-gray-600"
                    >
                        <PlayerRewindRight />
                    </button>
                    <button
                        onClick={handleSpeedChange}
                        className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-md border border-gray-600 text-xs sm:text-sm"
                    >
                        {playbackSpeed}x
                    </button>
                </div>
            ) : (
                <button
                    onClick={togglePlay}
                    className="w-12 h-12 flex items-center justify-center"
                >
                    <VideoCameraIcon />
                </button>
            )}
        </div>
    );
};

export default PlayerBar;
