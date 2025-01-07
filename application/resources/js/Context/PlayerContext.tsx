import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

const PlayerContext = createContext({
    
});

const LOCAL_STORAGE_KEY = 'playerState';

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
    const [playlist, setPlaylist] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const playerRef = useRef(null);

    // Load state from localStorage on initial render
    useEffect(() => {
        let _savedState = localStorage.getItem(LOCAL_STORAGE_KEY);

        if (_savedState) {
            let savedState = JSON.parse(_savedState);
            setPlaylist(savedState.playlist || []);
            setCurrentTrackIndex(savedState.currentTrackIndex || 0);
            setIsPlaying(savedState.isPlaying || false);
            setCurrentTime(savedState.currentTime || 0);
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify({
                playlist,
                currentTrackIndex,
                isPlaying,
                currentTime,
            }),
        );
    }, [playlist, currentTrackIndex, isPlaying, currentTime]);

    // Getters
    const getCurrentTrack = () => playlist[currentTrackIndex] ;

    // Setters
    const setPlaylistWithStart = (
        newPlaylist: React.SetStateAction<never[]>,
        startIndex = 0,
    ) => {
        setPlaylist(newPlaylist);
        setCurrentTrackIndex(startIndex);
        setIsPlaying(false);
        setCurrentTime(0);
    };

    // Playback controls
    const play = () => {
        if (playerRef.current) {
            playerRef.current.playVideo();
            setIsPlaying(true);
        }
    };

    const pause = () => {
        if (playerRef.current) {
            playerRef.current.pauseVideo();
            setIsPlaying(false);
        }
    };

    const stop = () => {
        if (playerRef.current) {
            playerRef.current.stopVideo();
            setIsPlaying(false);
            setCurrentTime(0);
        }
    };

    const next = () => {
        if (currentTrackIndex < playlist.length - 1) {
            setCurrentTrackIndex((prev) => prev + 1);
            setCurrentTime(0);
            setIsPlaying(true);
        }
    };

    const prev = () => {
        if (currentTrackIndex > 0) {
            setCurrentTrackIndex((prev) => prev - 1);
            setCurrentTime(0);
            setIsPlaying(true);
        }
    };

    return (
        <PlayerContext.Provider
            value={{
                playlist,
                currentTrackIndex,
                getCurrentTrack,
                setPlaylistWithStart,
                play,
                pause,
                stop,
                next,
                prev,
                isPlaying,
                currentTime,
                setCurrentTime,
                playerRef,
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => useContext(PlayerContext);
