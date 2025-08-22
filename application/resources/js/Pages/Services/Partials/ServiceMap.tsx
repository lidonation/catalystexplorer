import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

interface ServiceMapProps {
    cities: string[];
}

interface CityCoord {
    city: string;
    lat: number;
    lon: number;
}

const ServiceMap: React.FC<ServiceMapProps> = ({ cities }) => {
    const [coords, setCoords] = useState<CityCoord[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!cities || cities.length === 0) return;

        const fetchCoords = async () => {
            try {
                const results: CityCoord[] = [];

                for (const city of cities) {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                            city,
                        )}`,
                        {
                            headers: {
                                'User-Agent':
                                    'MyReactApp/1.0 (contact@myapp.com)',
                                'Accept-Language': 'en',
                            },
                        },
                    );

                    if (!res.ok)
                        throw new Error(
                            `Failed to fetch coordinates for ${city}`,
                        );

                    const data = await res.json();

                    if (data && data.length > 0) {
                        results.push({
                            city,
                            lat: parseFloat(data[0].lat),
                            lon: parseFloat(data[0].lon),
                        });
                    }
                }

                if (results.length > 0) {
                    setCoords(results);
                } else {
                    setCoords([
                        { city: 'Nairobi', lat: -1.2921, lon: 36.8219 },
                    ]);
                }
            } catch (err) {
                setCoords([{ city: 'Nairobi', lat: -1.2921, lon: 36.8219 }]);
            }
        };

        fetchCoords();
    }, [cities]);

    if (coords.length === 0) {
        return <div>Loading map...</div>;
    }

    return (
        <div className="h-full w-full">
            {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
            <MapContainer
                center={[coords[0].lat, coords[0].lon]}
                zoom={13}
                className="h-full w-full rounded-lg"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                {coords.map((c, i) => (
                    <Marker key={i} position={[c.lat, c.lon]}>
                        <Popup>{c.city}</Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default ServiceMap;
