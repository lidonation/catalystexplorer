import GlobalMap from '@/Components/GlobalMap';
import { MapProvider } from '@/Context/MapContext';
import React from 'react';
import { MapProps } from 'react-map-gl';

const MAPBOX_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN';

const points = [
    {
        lat: -1.286389, // Nairobi, Kenya
        lng: 36.817223,
        label: 'Nairobi',
        icon: 'https://cdn-icons-png.flaticon.com/128/684/684908.png',
    },
    {
        lat: 51.5074, // London, UK
        lng: -0.1278,
        label: 'London',
        icon: 'https://cdn-icons-png.flaticon.com/128/684/684908.png',
    },
    {
        lat: 40.7128, // New York, USA
        lng: -74.006,
        label: 'New York',
        icon: 'https://cdn-icons-png.flaticon.com/128/684/684908.png',
    },
];

const customConfig: Partial<MapProps> = {
    initialViewState: {
        longitude: 88.7749,
        latitude: 88.4194,
        zoom: 10,
    },
    pitch: 4,
    zoom: 2,
};

const Map: React.FC = () => {
    return (
        <MapProvider customConfig={customConfig} show3DBuildings={true}>
            <div className="min-h-screen bg-gray-100 p-4 dark:bg-gray-800">
                <GlobalMap points={points} />
            </div>
        </MapProvider>
    );
};

export default Map;
