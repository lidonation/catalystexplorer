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
import { useFilterContext } from '@/Context/FiltersContext';
import { Playlist, usePlayer } from '@/Context/PlayerContext';
import { useUIContext } from '@/Context/SharedUIContext';
import { PageProps } from '@/types';
import 'plyr-react/plyr.css';
import { useEffect } from 'react';
import ProposalData = App.DataTransferObjects.ProposalData;

interface PlayerBarProps extends Record<string, unknown> {
    proposals?: ProposalData[];
}

const PlayerBar = ({ proposals }: PageProps<PlayerBarProps>) => {
    const { isPlayerBarExpanded, togglePlayerBar } = useUIContext();
    const { filters } = useFilterContext();

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
        loading,
    } = usePlayer();

    const handlePlayPause = () => {
        if (isPlaying) {
            pauseCurrentTrack();
        } else {
            playCurrentTrack();
        }
    };

    const handleStop = () => {
        stopCurrentTrack();
        togglePlayerBar();
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

    const createPlaylist = () => {
        const regex = /[a-zA-Z]/g;
        const playlist = proposals
            ?.filter((item) => item.quickpitch)
            .map((item): Playlist => {
                const { title, quickpitch, id } = item;
                const provider = quickpitch?.match(regex) ? 'youtube' : 'vimeo';
                return { title, quickpitch, provider, id };
            });

        setPlaylist(playlist);
    };

    useEffect(() => {
        if (proposals) {
            createPlaylist();
        }
    }, [proposals]);

    return (
        <div className="flex flex-col items-center">
            {/* <div className="w-auto rounded-t-lg bg-bg-dark px-2 text-center">
                <span>Proposal: {playlist?.[currentTrackIndex]?.title}</span>
            </div> */}
            <div
                className={`sticky inset-x-0 bottom-0 mx-auto transition-all duration-300 ${
                    isPlayerBarExpanded ? 'w-full max-w-2xl' : 'w-16'
                } flex items-center justify-between overflow-hidden rounded-xl bg-bg-dark px-4 py-3 text-white shadow-lg`}
            >
                {/* Video Camera Icon for Collapsed State */}
                {!isPlayerBarExpanded && (
                    <button
                        disabled={loading}
                        onClick={togglePlayerBar}
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
                                disabled={loading}
                                onClick={prevTrack}
                                className="background-button-gradient-color-2 flex h-8 w-8 items-center justify-center rounded-md border border-dark hover:bg-dark sm:h-12 sm:w-12"
                            >
                                <PlayerSkipBack />
                            </button>
                            <button
                                disabled={loading}
                                onClick={handlePlayPause}
                                className="background-button-gradient-color-2 flex h-8 w-8 items-center justify-center rounded-md border border-dark hover:bg-dark sm:h-12 sm:w-12"
                            >
                                {isPlaying ? <PlayerPause /> : <PlayerPlay />}
                            </button>
                            <button
                                disabled={loading}
                                onClick={handleStop}
                                className="background-button-gradient-color-2 flex h-8 w-8 items-center justify-center rounded-md border border-dark hover:bg-dark sm:h-12 sm:w-12"
                            >
                                <PlayerStop />
                            </button>
                            <button
                                disabled={loading}
                                onClick={nextTrack}
                                className="background-button-gradient-color-2 flex h-8 w-8 items-center justify-center rounded-md border border-dark hover:bg-dark sm:h-12 sm:w-12"
                            >
                                <PlayerSkipForward />
                            </button>
                        </div>
                        {/* Divider */}
                        <div className="mx-2 h-8 w-px bg-gray-600 sm:mx-4 sm:h-12" />
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <button
                                disabled={loading}
                                onClick={() => seekBack(10)}
                                className="background-button-gradient-color-2 flex h-8 w-8 items-center justify-center rounded-md border border-gray-600 hover:bg-dark sm:h-12 sm:w-12"
                            >
                                <PlayerRewindLeft />
                            </button>
                            <div className="text-xs sm:text-sm flex justify-center w-20">
                                <span>{currentTime}</span>
                                <span className="mx-1">/</span>
                                <span>{duration}</span>
                            </div>
                            <button
                                disabled={loading}
                                onClick={() => seekForward(10)}
                                className="background-button-gradient-color-2 flex h-8 w-8 items-center justify-center rounded-md border border-gray-600 hover:bg-dark sm:h-12 sm:w-12"
                            >
                                <PlayerRewindRight />
                            </button>
                            <div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            disabled={loading}
                                            className="background-button-gradient-color-2 flex h-8 w-8 items-center justify-center rounded-md border border-gray-600 text-xs hover:bg-dark sm:h-12 sm:w-12 sm:text-sm"
                                        >
                                            {playbackSpeed}x
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto border border-gray-600 bg-bg-dark p-0">
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
                                                    className="relative flex w-full select-none items-center justify-between gap-2 rounded-sm !bg-bg-dark p-1 text-sm outline-none hover:cursor-pointer hover:!bg-background-lighter focus:bg-background-lighter aria-selected:bg-background-lighter data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                >
                                                    <span>{option.label}</span>
                                                    <Checkbox
                                                        id={option.value}
                                                        checked={
                                                            playbackSpeed.toString() ==
                                                            option.value
                                                        }
                                                        value={option.value}
                                                        onChange={() => {}}
                                                        className="text-content-accent h-4 w-4 bg-bg-dark shadow-sm checked:bg-primary checked:hover:bg-primary focus:border focus:border-primary focus:ring-primary checked:focus:bg-primary"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="relative">
                                <button
                                    disabled={loading}
                                    className="background-button-gradient-color-2 flex h-8 w-8 items-center justify-center rounded-md border border-gray-600 hover:bg-dark sm:h-12 sm:w-12"
                                >
                                    <PlaylistIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayerBar;
