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
    console.log('MapPicker props:', { latitude, longitude, latType: typeof latitude, lngType: typeof longitude });
    
    // Convert string values to numbers and provide defaults
    const lat = latitude ? parseFloat(latitude) : -7.2278;
    const lng = longitude ? parseFloat(longitude) : 107.9087;
    
    const initialPosition = [lat, lng];
    const [position, setPosition] = useState(initialPosition);
    
    console.log('MapPicker initialPosition:', initialPosition);

    useEffect(() => {
        if (latitude && longitude) {
            const newLat = parseFloat(latitude);
            const newLng = parseFloat(longitude);
            
            // Only update if the values are valid numbers
            if (!isNaN(newLat) && !isNaN(newLng)) {
                setPosition([newLat, newLng]);
                console.log('Updated position from props:', [newLat, newLng]);
            }
        }
    }, [latitude, longitude]);

    const handleLocationSelect = async (coords) => {
        setPosition([coords.lat, coords.lng]);

        // Call parent callback directly without external API to avoid CORS
        if (onLocationSelect) {
            onLocationSelect({
                latitude: coords.lat,
                longitude: coords.lng,
                alamat: null, // Don't auto-fill address to avoid CORS
            });
        }
    }
    return (
        <>
            <div className="mb-4 z-10">
                <p className="text-sm text-gray-600 mb-2">Klik pada peta untuk memilih lokasi pelanggan:</p>
                <MapContainer center={position} zoom={18} style={{ height: '400px', width: '100%', zIndex: '10' }} className="rounded-lg shadow-md">
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
