import React, { useEffect, useState } from 'react';
import { useUIContext } from '@/Context/SharedUIContext';
import PlayerSkipBack from "@/Components/svgs/PlayerSkipBack";
import PlayerSkipForward from "@/Components/svgs/PlayerSkipForward";
import PlayerRewindLeft from "@/Components/svgs/PlayerRewindLeft";
import PlayerRewindRight from "@/Components/svgs/PlayerRewindRight";
import PlayerStop from "@/Components/svgs/PlayerStop";
import PlayerPlay from "@/Components/svgs/PlayerPlay";
import VideoCameraIcon from "@/Components/svgs/VideoCameraIcon";
import PlayerPause from "@/Components/svgs/PlayerPause";
import YouTube from 'react-youtube';
import { usePlayer } from '@/Context/PlayerContext';


const PlayerBar: React.FC = () => {
  const { isPlayerBarExpanded, togglePlayerBar } = useUIContext();
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const handleSpeedChange = () => {
    const newSpeed = playbackSpeed === 2 ? 0.5 : playbackSpeed + 0.5;
    setPlaybackSpeed(newSpeed);
  };

// player stuff
  const {
    playlist,
    currentTrackIndex,
    getCurrentTrack,
    playerRef,
    play,
    pause,
    setCurrentTime,
    currentTime,
    isPlaying,
  } = usePlayer();

  const currentTrack = getCurrentTrack();

  // Load video on track change
  useEffect(() => {
    if (playerRef.current && currentTrack) {
      playerRef.current.loadVideoById(currentTrack.id);
      if (currentTime > 0) {
        playerRef.current.seekTo(currentTime);
      }
      if (isPlaying) play();
    }
  }, [currentTrack, currentTime, isPlaying]);

  const onReady = (event) => {
    playerRef.current = event.target;
    if (currentTime > 0) {
      playerRef.current.seekTo(currentTime);
    }
    if (isPlaying) play();
  };

  const onStateChange = (event) => {
    if (event.data === 1) {
      const interval = setInterval(() => {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
      }, 1000);
      return () => clearInterval(interval);
    }
  };

  return (
      <div
          className={`sticky inset-x-0 bottom-0 mx-auto transition-all duration-300 ${
              isPlayerBarExpanded ? 'w-full max-w-xl' : 'w-16'
          } flex items-center justify-between overflow-hidden rounded-xl bg-bg-dark px-4 py-3 text-white shadow-lg`}
          onClick={togglePlayerBar}
      >
          <div className='hidden'>
              <YouTube
                  videoId={currentTrack ? currentTrack.id : ''}
                  onReady={onReady}
                  onStateChange={onStateChange}
                  opts={{ playerVars: { autoplay: 1 } }}
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