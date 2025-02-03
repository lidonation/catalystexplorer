import Checkbox from '@/Components/Checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/Popover';
import PlayerPause from '@/Components/svgs/PlayerPause';
import PlayerPlay from '@/Components/svgs/PlayerPlay';
import PlayerRewindLeft from '@/Components/svgs/PlayerRewindLeft';
import PlayerRewindRight from '@/Components/svgs/PlayerRewindRight';
import PlayerSkipBack from '@/Components/svgs/PlayerSkipBack';
import PlayerSkipForward from '@/Components/svgs/PlayerSkipForward';
import PlayerStop from '@/Components/svgs/PlayerStop';
import PlaylistIcon from '@/Components/svgs/PlaylistIcon';
import VideoCameraIcon from '@/Components/svgs/VideoCameraIcon';
import { usePlayer } from '@/Context/PlayerContext';
import { useUIContext } from '@/Context/SharedUIContext';
import { usePage } from '@inertiajs/react';
import 'plyr-react/plyr.css';
import { useEffect } from 'react';
import PlaylistAnimation from './Playlist';

const PlayerBar = () => {
    const { isPlayerBarExpanded, setIsPlayerBarExpanded } = useUIContext();

    const {
        playlist,
        setPlaylist,
        currentTrackIndex,
        setCurrentTrackIndex,
        isPlaying,
        playCurrentTrack,
        pauseCurrentTrack,
        stopCurrentTrack,
        nextTrack,
        prevTrack,
        seekForward,
        seekBack,
        changeSpeed,
        playbackSpeed,
        currentTime,
        duration,
        setIsPlaying,
        loading,
    } = usePlayer();

    const handlePlayPause = () => {
        if (isPlaying) {
            pauseCurrentTrack();
        } else {
            playCurrentTrack();
            setIsPlaying(true);
        }
    };

    const handleStop = () => {
        stopCurrentTrack();
        setIsPlayerBarExpanded(false);
    };

    const speedOptions = [
        {
            value: '0.5',
            label: '0.5x',
        },
        {
            value: '0.75',
            label: '0.75x',
        },
        {
            value: '1',
            label: '1x',
        },
        {
            value: '1.5',
            label: '1.5x',
        },
        {
            value: '2',
            label: '2x',
        },
    ];

    const handleKeydown = (event: KeyboardEvent) => {
        if (event.code == 'Space') {
            event.preventDefault();
            handlePlayPause();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeydown);

        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    }, []);

    const onProposals = usePage().component == 'Proposals/Index';

    return (
        (playlist || onProposals) && (
            <div className="mr-2 flex flex-col items-center">
                {/* <div className="w-auto rounded-t-lg bg-bg-dark px-2 text-center">
                <span>Proposal: {playlist?.[currentTrackIndex]?.title}</span>
            </div> */}
                <div
                    className={`sticky inset-x-0 bottom-0 mx-auto transition-all duration-300 ${
                        isPlayerBarExpanded ? 'w-full max-w-2xl' : 'w-16'
                    } bg-bg-dark flex items-center justify-between overflow-hidden rounded-xl px-4 py-3 text-white shadow-lg`}
                >
                    {/* Video Camera Icon for Collapsed State */}
                    {!isPlayerBarExpanded && (
                        <button
                            onClick={() => setIsPlayerBarExpanded(true)}
                            className="flex h-12 w-12 items-center justify-center"
                        >
                            <VideoCameraIcon />
                        </button>
                    )}
                    {/* Expanded Player Bar with Controls */}
                    {isPlayerBarExpanded && (
                        <div className="flex w-full items-center space-x-2 sm:space-x-3">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <button
                                    disabled={loading || !playlist}
                                    onClick={prevTrack}
                                    className="background-button-gradient-color-2 border-dark hover:bg-dark flex h-8 w-8 items-center justify-center rounded-md border sm:h-12 sm:w-12"
                                >
                                    <PlayerSkipBack />
                                </button>
                                <button
                                    disabled={loading || !playlist}
                                    onClick={handlePlayPause}
                                    className="background-button-gradient-color-2 border-dark hover:bg-dark flex h-8 w-8 items-center justify-center rounded-md border sm:h-12 sm:w-12"
                                >
                                    {isPlaying ? (
                                        <PlayerPause />
                                    ) : (
                                        <PlayerPlay />
                                    )}
                                </button>
                                <button
                                    disabled={loading || !playlist}
                                    onClick={handleStop}
                                    className="background-button-gradient-color-2 border-dark hover:bg-dark flex h-8 w-8 items-center justify-center rounded-md border sm:h-12 sm:w-12"
                                >
                                    <PlayerStop />
                                </button>
                                <button
                                    disabled={loading || !playlist}
                                    onClick={nextTrack}
                                    className="background-button-gradient-color-2 border-dark hover:bg-dark flex h-8 w-8 items-center justify-center rounded-md border sm:h-12 sm:w-12"
                                >
                                    <PlayerSkipForward />
                                </button>
                            </div>
                            {/* Divider */}
                            <div className="mx-2 h-8 w-px bg-gray-600 sm:mx-4 sm:h-12" />
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <button
                                    disabled={loading || !playlist}
                                    onClick={() => seekBack(10)}
                                    className="background-button-gradient-color-2 hover:bg-dark flex h-8 w-8 items-center justify-center rounded-md border border-gray-600 sm:h-12 sm:w-12"
                                >
                                    <PlayerRewindLeft />
                                </button>
                                <div className="flex w-20 justify-center text-xs sm:text-sm">
                                    <span>{currentTime}</span>
                                    <span className="mx-1">/</span>
                                    <span>{duration}</span>
                                </div>
                                <button
                                    disabled={loading || !playlist}
                                    onClick={() => seekForward(10)}
                                    className="background-button-gradient-color-2 hover:bg-dark flex h-8 w-8 items-center justify-center rounded-md border border-gray-600 sm:h-12 sm:w-12"
                                >
                                    <PlayerRewindRight />
                                </button>
                                <div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                disabled={loading || !playlist}
                                                className="background-button-gradient-color-2 hover:bg-dark flex h-8 w-8 items-center justify-center rounded-md border border-gray-600 text-xs sm:h-12 sm:w-12 sm:text-sm"
                                            >
                                                {playbackSpeed}x
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="bg-bg-dark mb-4 w-auto border border-gray-600 p-0">
                                            <div className="p-1">
                                                {speedOptions?.map((option) => (
                                                    <div
                                                        key={option.value}
                                                        onClick={(value) =>
                                                            changeSpeed(
                                                                parseFloat(
                                                                    option.value,
                                                                ),
                                                            )
                                                        }
                                                        className="bg-bg-dark! hover:bg-background-lighter! focus:bg-background-lighter aria-selected:bg-background-lighter relative flex w-full items-center justify-between gap-2 rounded-xs p-1 text-sm outline-hidden select-none hover:cursor-pointer data-disabled:pointer-events-none data-disabled:opacity-50"
                                                    >
                                                        <span>
                                                            {option.label}
                                                        </span>
                                                        <Checkbox
                                                            id={option.value}
                                                            checked={
                                                                playbackSpeed.toString() ==
                                                                option.value
                                                            }
                                                            value={option.value}
                                                            onChange={() => {}}
                                                            className="text-content-accent bg-bg-dark checked:bg-primary checked:hover:bg-primary focus:border-primary focus:ring-primary checked:focus:bg-primary h-4 w-4 shadow-xs focus:border"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                disabled={loading || !playlist}
                                                className="background-button-gradient-color-2 hover:bg-dark flex h-8 w-8 items-center justify-center rounded-md border border-gray-600 sm:h-12 sm:w-12"
                                            >
                                                <PlaylistIcon />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="bg-bg-dark mb-4 max-h-96 min-w-96 overflow-y-auto border border-gray-600">
                                            <PlaylistAnimation />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    );
};

export default PlayerBar;
