import { useMapContext } from '@/Context/MapContext';
import { useThemeContext } from '@/Context/ThemeContext';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Map, { Layer, Marker, Source } from 'react-map-gl';

// Define the type for map points
interface MapPoint {
    lat: number;
    lng: number;
    label: string;
    icon: string;
}

// Props for the GlobalMap component
interface GlobalMapProps {
    points: MapPoint[];
}

const GlobalMap: React.FC<GlobalMapProps> = ({ points }) => {
    const { config, show3DBuildings } = useMapContext();
    const { theme } = useThemeContext();
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (mapRef.current && points.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            points.forEach((point) => bounds.extend([point.lng, point.lat]));
            mapRef.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
        }
    }, [points]);

    const markers = useMemo(
        () =>
            points.map((point, index) => (
                <Marker key={index} longitude={point.lng} latitude={point.lat}>
                    <img
                        src={point.icon}
                        alt={point.label}
                        className="h-8 w-8"
                    />
                </Marker>
            )),
        [points],
    );

    return (
        <div className={`h-[700px] w-full`}>
            <Map
                ref={(ref) => (mapRef.current = ref?.getMap() ?? null)}
                // 🔑 Basic configuration
                mapboxAccessToken={config.mapboxAccessToken}
                mapStyle={
                    theme == 'dark'
                        ? 'mapbox://styles/mapbox/dark-v9'
                        : 'mapbox://styles/mapbox/light-v9'
                }
                style={{ width: '100%', height: '100%' }}
                // 🔍 View settings
                initialViewState={config.initialViewState}
                latitude={config?.latitude ?? 0.4194} // Center latitude
                longitude={config?.longitude ?? 0.7749} // Center longitude
                zoom={config?.zoom ?? 2} // Zoom level
                minZoom={config?.minZoom ?? 0} // Minimum zoom level
                maxZoom={config?.maxZoom ?? 20} // Maximum zoom level
                bearing={config?.bearing ?? 0} // Camera rotation in degrees
                pitch={config?.pitch ?? 0} // Tilt in degrees
                // 🎛️ Interaction settings
                interactive={config?.interactive ?? true} // Enable/disable user interaction
                dragPan={config?.dragPan ?? true} // Enable dragging to pan the map
                dragRotate={config?.dragRotate ?? true} // Enable dragging to rotate the map
                scrollZoom={config?.scrollZoom ?? true} // Enable scroll wheel zoom
                touchZoomRotate={config?.touchZoomRotate ?? true} // Enable pinch zoom & rotate
                doubleClickZoom={config?.doubleClickZoom ?? true} // Enable double-click zoom
                keyboard={config?.keyboard ?? true} // Enable keyboard shortcuts
                // 🎨 Map appearance & projection
                projection={{ name: 'mercator' }} // Projection (e.g., 'mercator', 'globe')
                preserveDrawingBuffer={config?.preserveDrawingBuffer ?? false} // Preserve canvas buffer for screenshots
                antialias={true} // Improve rendering smoothness
                // 🗺️ Terrain & 3D buildings
                terrain={
                    config?.terrain ?? {
                        source: 'mapbox-dem',
                        exaggeration: 1.5,
                    }
                } // Add 3D terrain
                renderWorldCopies={config?.renderWorldCopies ?? true} // Wraps world map horizontally
                // 📌 Markers & layers
                maxBounds={
                    config?.maxBounds ?? [
                        [-180, -85],
                        [180, 85],
                    ]
                } // Restrict panning outside bounds
                // ⚙️ API configurations
                locale={
                    config?.locale ?? {
                        'AttributionControl.ToggleAttribution': 'Show credits',
                    }
                } // Localization
                // 🎯 Event handlers
                onLoad={() => setIsLoaded(true)}
                // 🔄 Performance optimizations
                trackResize={config?.trackResize ?? true} // Auto-adjust size on window resize
                optimizeForTerrain={true} // Optimize rendering for terrain
            >
                {/* 3D Buildings Layer */}
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
                                'fill-extrusion-color': true ? '#aaa' : '#888',
                                'fill-extrusion-height': ['get', 'height'],
                                'fill-extrusion-opacity': 0.6,
                            }}
                        />
                    </Source>
                )}

                {/* Render Custom Markers */}
                {markers}
            </Map>
        </div>
    );
};

export default GlobalMap;
