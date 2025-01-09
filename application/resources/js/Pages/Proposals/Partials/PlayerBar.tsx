import React, { useState } from 'react';
import { useUIContext } from '@/Context/SharedUIContext';
import PlayerSkipBack from "@/Components/svgs/PlayerSkipBack";
import PlayerSkipForward from "@/Components/svgs/PlayerSkipForward";
import PlayerRewindLeft from "@/Components/svgs/PlayerRewindLeft";
import PlayerRewindRight from "@/Components/svgs/PlayerRewindRight";
import PlayerStop from "@/Components/svgs/PlayerStop";
import VideoCameraIcon from "@/Components/svgs/VideoCameraIcon";
import PlayerPause from "@/Components/svgs/PlayerPause";


const PlayerBar: React.FC = () => {
  const { isPlayerBarExpanded, togglePlayerBar } = useUIContext();
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const handleSpeedChange = () => {
    const newSpeed = playbackSpeed === 2 ? 0.5 : playbackSpeed + 0.5;
    setPlaybackSpeed(newSpeed);
  };

  return (
    <div
      className={`sticky bottom-0 inset-x-0 mx-auto transition-all duration-300 ${
        isPlayerBarExpanded ? 'w-full max-w-xl' : 'w-16'
      } bg-bg-dark text-white flex items-center justify-between py-3 px-4 rounded-xl shadow-lg overflow-hidden`}
      onClick={togglePlayerBar}
    >
      {/* Video Camera Icon for Collapsed State */}
      {!isPlayerBarExpanded && (
        <button className="w-12 h-12 flex items-center justify-center">
          <VideoCameraIcon />
        </button>
      )}

      {/* Expanded Player Bar with Controls */}
      {isPlayerBarExpanded && (
        <div className="flex items-center space-x-2 sm:space-x-3 w-full">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button className="w-8 sm:w-12 h-8 sm:h-12 flex items-center justify-center background-button-gradient-color-2 hover:bg-dark rounded-md border border-dark">
              <PlayerSkipBack />
            </button>
            <button
              onClick={() => {}}
              className="w-8 sm:w-12 h-8 sm:h-12 flex items-center justify-center background-button-gradient-color-2 hover:bg-dark rounded-md border border-dark"
            >
              <PlayerPause />
            </button>
            <button className="w-8 sm:w-12 h-8 sm:h-12 flex items-center justify-center background-button-gradient-color-2 hover:bg-dark rounded-md border border-dark">
              <PlayerStop />
            </button>
            <button className="w-8 sm:w-12 h-8 sm:h-12 flex items-center justify-center background-button-gradient-color-2 hover:bg-dark rounded-md border border-dark">
              <PlayerSkipForward />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-8 sm:h-12 bg-gray-600 mx-2 sm:mx-4" />

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button className="w-8 sm:w-12 h-8 sm:h-12 flex items-center justify-center background-button-gradient-color-2 hover:bg-dark rounded-md border border-gray-600">
              <PlayerRewindLeft />
            </button>
            <div className="text-xs sm:text-sm ">
              <span>0:00</span>
              <span className="mx-1">/</span>
              <span>5:00</span>
            </div>
            <button className="w-8 sm:w-12 h-8 sm:h-12 flex items-center justify-center background-button-gradient-color-2 hover:bg-dark rounded-md border border-gray-600">
              <PlayerRewindRight />
            </button>
            <button
              onClick={handleSpeedChange}
              className="w-8 sm:w-12 h-8 sm:h-12 flex items-center justify-center background-button-gradient-color-2 hover:bg-dark rounded-md border border-gray-600 text-xs sm:text-sm"
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
