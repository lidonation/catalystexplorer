import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import ProposalData = App.DataTransferObjects.ProposalData;

export interface Playlist {
    title: string | null;
    quickpitch?: string;
    provider?: {}, // Plyr.Provider;
    hash: string | null;
}

interface PlayerContextType {
    playlist?: Playlist[];
    setPlaylist: React.Dispatch<React.SetStateAction<Playlist[] | undefined>>;
    currentTrackIndex: number;
    setCurrentTrackIndex: React.Dispatch<React.SetStateAction<number>>;
    isPlaying: boolean;
    playCurrentTrack: () => void;
    pauseCurrentTrack: () => void;
    stopCurrentTrack: () => void;
    nextTrack: () => void;
    prevTrack: () => void;
    seekForward: (time: number) => void;
    seekBack: (time: number) => void;
    changeSpeed: (speed: number) => void;
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    playbackSpeed: number;
    loading: boolean;
    currentTime: string;
    duration: string;
    createProposalPlaylist: (proposals?: ProposalData[]) => void;
    progress: number;
    setProgress: React.Dispatch<React.SetStateAction<number>>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const formattedSeconds = Math.floor(seconds % 60);
    return `${minutes}:${formattedSeconds < 10 ? '0' : ''}${formattedSeconds}`;
};

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
    const [playlist, setPlaylist] = useState<Playlist[] | undefined>(undefined);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [currentTime, setCurrentTime] = useState('0:00');
    const [duration, setDuration] = useState('0:00');
    const plyrInstanceRef = useRef<any>(null);
    const playerContainerRef = useRef<HTMLVideoElement | null>(null);
    const [progress, setProgress] = useState(0);
    const [initialLoad, setInitialLoad] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const [PlyrClass, setPlyrClass] = useState<any>(null);

    useEffect(() => {
        setIsClient(true);
        import('plyr').then(module => {
            setPlyrClass(() => module.default);
        });
    }, []);

    const currentTrack =
        playlist && playlist[currentTrackIndex]
            ? playlist[currentTrackIndex]
            : null;

    useEffect(() => {
        if (
            !isClient ||
            !PlyrClass ||
            !playlist ||
            playlist.length === 0 ||
            !playerContainerRef.current ||
            plyrInstanceRef.current
        ) {
            return;
        }

        plyrInstanceRef.current = new PlyrClass(playerContainerRef.current, {
            controls: [
            'play',
            'progress',
            'current-time',
            'mute',
            'volume',
            'settings',
            'fullscreen',
            ],
            settings: ['speed'],
            speed: {
            selected: playbackSpeed,
            options: [0.5, 1, 1.5, 2],
            },
        });

        plyrInstanceRef.current.on('play', () => setIsPlaying(true));
        plyrInstanceRef.current.on('pause', () => setIsPlaying(false));
        plyrInstanceRef.current.on('ended', () => nextTrack());
        plyrInstanceRef.current.on('ready', () => {
            setLoading(false);
            if (isPlaying) plyrInstanceRef.current?.play();
        });

        const timeout = setTimeout(() => setInitialLoad(false), 1000);

        return () => {
            clearTimeout(timeout);
            if (plyrInstanceRef.current) {
                plyrInstanceRef.current.destroy();
                plyrInstanceRef.current = null;
            }
        };
    }, [plyrInstanceRef, playlist, isClient, PlyrClass]);

    useEffect(() => {
        if (!isClient || !plyrInstanceRef.current || !playlist || playlist.length === 0) {
            return;
        }
        
        const firstTrack = playlist[0];
        if (firstTrack && firstTrack.quickpitch) {
            setLoading(true);
            plyrInstanceRef.current.source = {
                type: 'video',
                sources: [
                    {
                        src: firstTrack.quickpitch,
                        provider: firstTrack.provider,
                    },
                ],
            };
        }
    }, [playlist, isClient]);

    // Update video source whenever the track changes
    useEffect(() => {
        if (
            !isClient ||
            !plyrInstanceRef.current ||
            !currentTrack ||
            !currentTrack.quickpitch
        ) {
            return;
        }
        
        setLoading(true);
        plyrInstanceRef.current.source = {
            type: 'video',
            sources: [
                {
                    src: currentTrack.quickpitch,
                    provider: currentTrack.provider,
                },
            ],
        };
    }, [currentTrack, isClient]);

    // Update current time and duration every second
    useEffect(() => {
        if (!isClient) return;
        
        const interval = setInterval(() => {
            if (plyrInstanceRef.current) {
                   setCurrentTime(formatTime(plyrInstanceRef.current.currentTime));
                   setDuration(formatTime(plyrInstanceRef.current.duration));
                   setPlaybackSpeed(plyrInstanceRef.current.speed);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isClient]);

    const playCurrentTrack = () => {
         if (!loading) plyrInstanceRef.current?.play();
    };

     const pauseCurrentTrack = () => plyrInstanceRef.current?.pause();

    const stopCurrentTrack = () => {
          if (plyrInstanceRef.current) {
               plyrInstanceRef.current.stop();
               plyrInstanceRef.current.source = { type: 'video', sources:[] };
          }
          setIsPlaying(false);
          setPlaylist(undefined);
          setCurrentTrackIndex(0);
          setCurrentTime('0:00');
          setDuration('0:00');
          setProgress(0);
    };

    const nextTrack = () => {
        if (playlist && plyrInstanceRef.current) {
            setIsPlaying(false);
            plyrInstanceRef.current.autoplay = true;
            const nextIndex =
                currentTrackIndex < playlist.length - 1
                    ? currentTrackIndex + 1
                    : 0;
            setCurrentTrackIndex(nextIndex);
            setTimeout(() => {
                playCurrentTrack();
            }, 0);
        }
    };

    const prevTrack = () => {
        if (playlist && plyrInstanceRef.current) {
            setIsPlaying(false);
             plyrInstanceRef.current.autoplay = true;
            const prevIndex =
                currentTrackIndex > 0
                    ? currentTrackIndex - 1
                    : playlist.length - 1;
            setCurrentTrackIndex(prevIndex);
            setTimeout(() => {
                playCurrentTrack();
            }, 0);
        }
    };

    const seekForward = (time: number) => {
        if (!loading && plyrInstanceRef.current) {
            plyrInstanceRef.current.currentTime += time;
        }
    };

    const seekBack = (time: number) => {
        if (!loading && plyrInstanceRef.current) {
            plyrInstanceRef.current.currentTime -= time;
        }
    };

    const changeSpeed = (speed: number) => {
        if (plyrInstanceRef.current) {
            plyrInstanceRef.current.speed = speed;
        }
        setPlaybackSpeed(speed);
    };

    const createProposalPlaylist = (proposals?: ProposalData[]) => {
        const regex = /[a-zA-Z]/g;
        const playlist = proposals
            ?.filter((item) => item.quickpitch)
            .map((item): Playlist => {
                const { title, quickpitch, hash } = item;
                const provider = quickpitch?.match(regex) ? 'youtube' : 'vimeo';
                return { title, quickpitch, provider, hash: hash ? hash : null };
            });

        setPlaylist(playlist);
    };

    useEffect(() => {
        if (!isClient) return;
        
        const interval = setInterval(() => {
            if (plyrInstanceRef.current) {
                const current = plyrInstanceRef.current.currentTime;
                const total = plyrInstanceRef.current.duration;
                setCurrentTime(formatTime(current));
                setDuration(formatTime(total));

                if (total > 0) {
                    setProgress((current / total) * 100); // Calculate progress as percentage
                } else {
                    setProgress(0);
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isClient]);


    return (
        <PlayerContext.Provider
            value={{
            playlist,
            setPlaylist,
            currentTrackIndex,
            setCurrentTrackIndex,
            setIsPlaying,
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
            loading,
            currentTime,
            duration,
            createProposalPlaylist,
            progress,
            setProgress,
            }}
        >
            {children}
            {isClient && (
                <div className="player-wrapper clip-rect(0_0_0_0) absolute m-[-1px] h-[1px] w-[1px] overflow-hidden border-0 p-0">
                    <video
                        ref={playerContainerRef}
                        className="plyr"
                        style={{ pointerEvents: loading ? 'none' : 'auto' }}
                    />
                </div>
            )}
        </PlayerContext.Provider>
    );
};

export const usePlayer = (): PlayerContextType => {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};
