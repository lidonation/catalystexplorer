import { useEcho } from '@laravel/echo-react';
import { useEffect, useState, useCallback, useRef } from 'react';

export interface StreamedItem {
    item: any;
    index: number;
    total: number;
}

export interface StreamState {
    isConnected: boolean;
    isStreaming: boolean;
    items: any[];
    totalItems: number;
    streamedCount: number;
    error?: string;
}

export function useBookmarkStream(
    bookmarkCollectionId: string,
    enabled: boolean = false
) {
    const echo = useEcho();
    const isStartingRef = useRef(false);
    const processedItemsRef = useRef<Set<number>>(new Set());
    const [state, setState] = useState<StreamState>({
        isConnected: false,
        isStreaming: false,
        items: [],
        totalItems: 0,
        streamedCount: 0,
    });

    const startStream = useCallback(async () => {
        console.log('🎆 startStream called with bookmarkCollectionId:', bookmarkCollectionId);

        if (!bookmarkCollectionId || isStartingRef.current) {
            if (!bookmarkCollectionId) {
                console.error('❌ startStream: No bookmarkCollectionId provided');
            } else {
                console.log('⏸️ startStream: Already starting, skipping duplicate call');
            }
            return;
        }

        isStartingRef.current = true;

        try {
            const streamUrl = `/en/lists/${bookmarkCollectionId}/stream/proposals`;

            const response = await fetch(streamUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            setState(prev => ({
                ...prev,
                isStreaming: true,
                items: [],
                streamedCount: 0,
                error: undefined
            }));
        } catch (error) {
            console.error('Failed to start stream:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Unknown error',
                isStreaming: false
            }));
        } finally {
            isStartingRef.current = false;
        }
    }, [bookmarkCollectionId]);

    // Event handlers for stream events
    const handleStreamStarted = useCallback((data: { totalItems: number }) => {
        console.log('🎬 Stream started event received:', data);
        // Reset processed items for new stream
        processedItemsRef.current.clear();
        setState(prev => ({
            ...prev,
            isConnected: true,
            isStreaming: true,
            totalItems: data.totalItems,
            items: [],
            streamedCount: 0,
        }));
    }, []);

    const handleItemStreamed = useCallback((data: StreamedItem) => {
        // Check if we've already processed this item index
        if (processedItemsRef.current.has(data.index)) {
            console.log('🔄 Duplicate item ignored:', data.index);
            return;
        }
        
        console.log('📦 Item streamed:', data);
        processedItemsRef.current.add(data.index);
        
        setState(prev => ({
            ...prev,
            items: [...prev.items, data.item],
            streamedCount: data.index + 1,
        }));
    }, []);

    const handleStreamCompleted = useCallback((data: { totalStreamed: number }) => {
        console.log('🏁 Stream completed:', data);
        setState(prev => ({
            ...prev,
            isStreaming: false,
            streamedCount: data.totalStreamed,
        }));
    }, []);

    const handleChannelError = useCallback((error: any) => {
        console.error('❌ Channel error:', error);
        setState(prev => ({
            ...prev,
            error: 'Connection error',
            isStreaming: false,
            isConnected: false,
        }));
    }, []);


    useEffect(() => {
        if (!echo || !bookmarkCollectionId || !enabled) {
            console.log('❌ Early return from useEffect:', {
                echo: !!echo,
                bookmarkCollectionId,
                enabled
            });
            return;
        }

        const channelName = `bookmark-collection.${bookmarkCollectionId}.stream`;

        // @ts-ignore
        const channel = window.echo.channel(channelName);

        // Set up event listeners - only one set to prevent duplicates
        channel
            .listen('stream.started', handleStreamStarted)
            .listen('item.streamed', handleItemStreamed)
            .listen('stream.completed', handleStreamCompleted)
            .error(handleChannelError);

        console.log('✅ Successfully subscribed to channel:', channelName);

        return () => {
            console.log('📴 Leaving channel:', channelName);
            try {
                // @ts-ignore
                echo.leaveChannel(channelName);
                console.log('✅ Successfully left channel:', channelName);
            } catch (error) {
                console.error('❌ Error leaving channel:', error);
            }
        };
    }, [echo, bookmarkCollectionId, enabled]); // Remove callback dependencies to prevent reconnections

    return {
        ...state,
        startStream,
    };
}
