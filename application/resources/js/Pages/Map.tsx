import ClientOnly from '@/Components/ClientOnly';
import { MapProvider } from '@/Context/MapContext';
import React, { Suspense, lazy } from 'react';
import { MapProps } from 'react-map-gl';

// Dynamic import with lazy loading for GlobalMap (no SSR)
const GlobalMap = lazy(() => import('@/Components/GlobalMap'));

interface Point {
    id: number;
    latitude: number;
    longitude: number;
    title: string;
    description?: string;
}

const points: Point[] = [
    {
        id: 1,
        latitude: -1.286389, // Nairobi, Kenya
        longitude: 36.817223,
        title: 'Nairobi',
        description: 'Marker for Nairobi',
    },
    {
        id: 2,
        latitude: 51.5074, // London, UK
        longitude: -0.1278,
        title: 'London',
        description: 'Marker for London',
    },
    {
        id: 3,
        latitude: 40.7128, // New York, USA
        longitude: -74.006,
        title: 'New York',
        description: 'Marker for New York',
    },
];

const customConfig: Partial<MapProps> = {
    initialViewState: {
        longitude: 36.817223,
        latitude: -1.286389,
        zoom: 2,
    },
    pitch: 0,
};

const MapPage: React.FC = () => {
    return (
        <MapProvider customConfig={customConfig} show3DBuildings={true}>
            <div className="min-h-screen bg-gray-100 p-4 dark:bg-gray-800">
                <ClientOnly
                    fallback={
                        <div
                            className="flex items-center justify-center bg-gray-100 text-gray-500"
                            style={{ height: '500px', width: '100%' }}
                        >
                            Map loading on client...
                        </div>
                    }
                >
                    <Suspense
                        fallback={
                            <div
                                className="flex items-center justify-center bg-gray-100 text-gray-500"
                                style={{ height: '500px', width: '100%' }}
                            >
                                Loading map...
                            </div>
                        }
                    >
                        <GlobalMap points={points} height="500px" width="100%" />
                    </Suspense>
                </ClientOnly>
            </div>
        </MapProvider>
    );
};

export default MapPage;
