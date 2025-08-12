import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';

function ChangeMapView({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.setView(coords, 18); // Pindahkan view dan zoom ke lokasi baru
        }
    }, [coords, map]);
    return null;
}

function LocationMarker({ position, onLocationSelect }) {
    const map = useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            onLocationSelect({ lat, lng });
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : <Marker position={position}></Marker>
}

const MapPicker = ({ onLocationSelect, latitude, longitude }) => {
    const initialPosition = [latitude || -7.2278, longitude || 107.9087];
    const [position, setPosition] = useState(initialPosition);

    useEffect(() => {
        if (latitude && longitude) {
            setPosition([latitude, longitude]);
        }
    }, [latitude, longitude]);

    const handleLocationSelect = async (coords) => {
        setPosition([coords.lat, coords.lng]);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
            );

            const data = await response.json();

            onLocationSelect({
                latitude: coords.lat,
                longitude: coords.lng,
                alamat: data.display_name || 'Alamat tidak ditemukan',
            });
        } catch (error) {
            console.error("Error fetching address: ", error);
            onLocationSelect({
                latitude: coords.lat,
                longitude: coords.lng,
                alamat: 'Gagal mendapatkan alamat',
            });
        }
    }
    return (
        <>
            <div className="mb-4 z-10">
                <p className="text-sm text-gray-600 mb-2">Klik pada peta untuk memilih lokasi pelanggan:</p>
                <MapContainer center={position} zoom={18} style={{ height: '400px', width: '100%' }} className="rounded-lg shadow-md">
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <LocationMarker position={position} onLocationSelect={handleLocationSelect} />
                    <ChangeMapView coords={position} />
                </MapContainer>
            </div>
        </>
    )
}

export default MapPicker
