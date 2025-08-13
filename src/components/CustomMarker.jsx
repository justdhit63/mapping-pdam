import React, { useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';

// Buat custom icon di sini agar tidak dibuat ulang terus menerus
const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
});

const CustomerMarker = ({ pelanggan, isSelected, onClick }) => {
    const markerRef = useRef(null);

    useEffect(() => {
        if (isSelected && markerRef.current) {
            setTimeout(() => {
                markerRef.current.openPopup();
            }, 100);
        }
    }, [isSelected]);

    return (
        <Marker
            ref={markerRef}
            position={[pelanggan.latitude, pelanggan.longitude]}
            icon={customIcon}
            eventHandlers={{
                click: () => {
                    // Saat marker ini diklik, panggil fungsi dari parent
                    onClick(pelanggan);
                },
            }}
        >
            <Popup>
                <div className="font-sans">
                    <h3 className="font-bold text-base mb-1">{pelanggan.nama_pelanggan}</h3>
                    <p className="text-sm text-gray-700 mb-1"><strong>ID:</strong> {pelanggan.id_pelanggan}</p>
                    <p className="text-sm text-gray-600 mb-2">{pelanggan.alamat}</p>
                    <Link to={`/daftar-pelanggan/edit-pelanggan/${pelanggan.id}`} className="text-blue-600 hover:underline text-sm">
                        Lihat & Edit Detail
                    </Link>
                </div>
            </Popup>
        </Marker>
    );
};

export default CustomerMarker;