import GlobalMap from '@/Components/GlobalMap';
import { MapProvider } from '@/Context/MapContext';
import React from 'react';
import { MapProps } from 'react-map-gl';

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
                <GlobalMap points={points} height="500px" width="100%" />
            </div>
        </MapProvider>
    );
};

export default MapPage;
