import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useState } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';

interface Point {
    id: number;
    latitude: number;
    longitude: number;
    title: string;
    description?: string;
}

interface GlobalMapProps {
    points: Point[];
    initialZoom?: number;
    height?: string;
    width?: string;
    mapStyle?: string;
}

const GlobalMap: React.FC<GlobalMapProps> = ({
    points,
    initialZoom = 2,
    height = '500px',
    width = '100%',
    mapStyle = 'mapbox://styles/mapbox/streets-v11',
}) => {
    const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);


    const initialViewport = {
        latitude: points[0]?.latitude || 0,
        longitude: points[0]?.longitude || 0,
        zoom: initialZoom,
    };

    if (!points || points.length === 0) {
        return (
            <div
                style={{ width, height }}
                className="flex items-center justify-center bg-gray-100 text-gray-500"
            >
                No locations to display
            </div>
        );
    }

    return (
        <div style={{ width, height }} className="relative">
            <ReactMapGL
                initialViewState={initialViewport}
                mapStyle={mapStyle}
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                onClick={() => setSelectedPoint(null)}
                onError={(err) => console.error('Map error:', err)}
                style={{ width: '100%', height: '100%' }}
            >
                {points.map((point) => (
                    <Marker
                        key={point.id}
                        latitude={point.latitude}
                        longitude={point.longitude}
                        color="red"
                        onClick={(e) => {
                            e.originalEvent.stopPropagation();
                            setSelectedPoint(point);
                        }}
                    />
                ))}

                {selectedPoint && (
                    <Popup
                        latitude={selectedPoint.latitude}
                        longitude={selectedPoint.longitude}
                        onClose={() => setSelectedPoint(null)}
                        closeOnClick={false}
                        anchor="top"
                    >
                        <div className="p-3">
                            <h3 className="mb-1 text-lg font-semibold">
                                {selectedPoint.title}
                            </h3>
                            {selectedPoint.description && (
                                <p className="text-sm text-gray-600">
                                    {selectedPoint.description}
                                </p>
                            )}
                            <div className="mt-2 text-xs text-gray-400">
                                {selectedPoint.latitude.toFixed(4)},{' '}
                                {selectedPoint.longitude.toFixed(4)}
                            </div>
                        </div>
                    </Popup>
                )}
            </ReactMapGL>
        </div>
    );
};

export default GlobalMap;
