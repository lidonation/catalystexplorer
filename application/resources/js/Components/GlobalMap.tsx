import { useMapContext } from '@/Context/MapContext';
import { useThemeContext } from '@/Context/ThemeContext';
import mapboxgl from 'mapbox-gl';
import { useEffect, useMemo, useRef, useState } from 'react';
import Map, { Layer, Marker, Popup, Source } from 'react-map-gl';

interface MapPoint {
    lat: number;
    lng: number;
    label: string;
    icon: string;
}

export default function GlobalMap({ points }: { points: MapPoint[] }) {
    const { config, show3DBuildings } = useMapContext();
    const { theme } = useThemeContext();
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);

    // Center/zoom when points change
    useEffect(() => {
        if (!mapRef.current || !isLoaded || points.length === 0) return;

        if (points.length === 1) {
            console.log(
                'Centering on single point:',
                points[0].lng,
                points[0].lat,
            );
            mapRef.current.flyTo({
                center: [points[0].lng, points[0].lat],
                zoom: 13,
                essential: true,
            });
        } else {
            const bounds = new mapboxgl.LngLatBounds();
            points.forEach((p) => bounds.extend([p.lng, p.lat]));
            console.log('Fitting bounds:', bounds);
            mapRef.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
        }
    }, [points, isLoaded]);

    const markers = useMemo(
        () =>
            points.map((point, index) => (
                <Marker key={index} longitude={point.lng} latitude={point.lat}>
                    <img
                        src={point.icon}
                        alt={point.label}
                        className="h-8 w-8 cursor-pointer"
                        onClick={() => setSelectedPoint(point)}
                    />
                </Marker>
            )),
        [points],
    );

    return (
        <div className="h-full w-full">
            <Map
                ref={(ref) => (mapRef.current = ref?.getMap() ?? null)}
                mapboxAccessToken={config.mapboxAccessToken}
                mapStyle={
                    theme === 'dark'
                        ? 'mapbox://styles/mapbox/dark-v9'
                        : 'mapbox://styles/mapbox/light-v9'
                }
                style={{ width: '100%', height: '100%' }}
                onLoad={() => setIsLoaded(true)}
            >
                {markers}

                {selectedPoint && (
                    <Popup
                        longitude={selectedPoint.lng}
                        latitude={selectedPoint.lat}
                        anchor="top"
                        onClose={() => setSelectedPoint(null)}
                    >
                        <div className="text-sm font-medium">
                            {selectedPoint.label}
                        </div>
                    </Popup>
                )}

                {isLoaded && show3DBuildings && (
                    <Source
                        id="mapbox-buildings"
                        type="vector"
                        url="mapbox://mapbox.3d-buildings"
                    >
                        <Layer
                            id="3d-buildings"
                            source="mapbox-buildings"
                            source-layer="building"
                            type="fill-extrusion"
                            paint={{
                                'fill-extrusion-color': '#aaa',
                                'fill-extrusion-height': ['get', 'height'],
                                'fill-extrusion-opacity': 0.6,
                            }}
                        />
                    </Source>
                )}
            </Map>
        </div>
    );
}
