import { createContext, ReactNode, useContext } from 'react';
import { MapProps } from 'react-map-gl';

interface PointsType {
    lat: number;
    lng: number;
    label: string;
    icon: string;
}

interface MapConfig {
    config: Partial<MapProps>;
    show3DBuildings: boolean;
}

// define default configuration
const defaultConfig: MapConfig = {
    config: {
        mapboxAccessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
        initialViewState: {
            longitude: 0.7749,
            latitude: 0.4194,
            zoom: 2,
            bearing: 0,
        },
    },
    show3DBuildings: true,
};

// Create the context
const MapContext = createContext<MapConfig | undefined>(undefined);

// Provider component
export function MapProvider({
    children,
    customConfig,
    show3DBuildings = true,
}: {
    children: ReactNode;
    customConfig?: Partial<MapConfig>;
    show3DBuildings?: boolean;
}) {
    const config = {
        ...defaultConfig.config,
        ...customConfig,
    } as Partial<MapProps>;

    return (
        <MapContext.Provider
            value={{
                config,
                show3DBuildings,
            }}
        >
            {children}
        </MapContext.Provider>
    );
}

// Custom hook for easy access
export const useMapContext = () => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMapContext must be used within a MapProvider');
    }
    return context;
};
