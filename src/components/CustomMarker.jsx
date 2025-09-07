import React, { useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';

// Custom icons untuk status yang berbeda
const createStatusIcon = (status) => {
    const isActive = status === 'aktif';
    const color = isActive ? '#10b981' : '#ef4444'; // Green for active, Red for inactive
    
    const svgIcon = `
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 20.4 12.5 41 12.5 41S25 20.4 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${color}"/>
            <circle cx="12.5" cy="12.5" r="6" fill="white"/>
            <circle cx="12.5" cy="12.5" r="3" fill="${color}"/>
        </svg>
    `;
    
    return new L.DivIcon({
        html: svgIcon,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        className: 'custom-status-marker'
    });
};

// Default icon untuk user biasa
const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
});

const CustomerMarker = ({ pelanggan, isSelected, onClick, isAdminView = false, showStatusColors = false }) => {
    const markerRef = useRef(null);

    useEffect(() => {
        if (isSelected && markerRef.current) {
            setTimeout(() => {
                markerRef.current.openPopup();
            }, 100);
        }
    }, [isSelected]);

    // Pilih icon berdasarkan showStatusColors atau mode admin
    const markerIcon = (showStatusColors || isAdminView) 
        ? createStatusIcon(pelanggan.status_pelanggan || 'aktif')
        : customIcon;

    return (
        <Marker
            ref={markerRef}
            position={[pelanggan.latitude, pelanggan.longitude]}
            icon={markerIcon}
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
                    
                    {/* Status badge untuk semua user (jika showStatusColors aktif) */}
                    {(showStatusColors || isAdminView) && (
                        <div className="mb-2">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                pelanggan.status_pelanggan === 'aktif' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                Status: {pelanggan.status_pelanggan || 'aktif'}
                            </span>
                        </div>
                    )}
                    
                    <p className="text-sm text-gray-600 mb-2">{pelanggan.alamat}</p>
                    
                    {/* Tampilkan email petugas hanya untuk admin */}
                    {isAdminView && pelanggan.user_email && (
                        <p className="text-xs text-gray-500 mb-2">
                            <strong>Petugas:</strong> {pelanggan.user_email}
                        </p>
                    )}
                    
                    {!isAdminView ? (
                        <Link to={`/daftar-pelanggan/edit-pelanggan/${pelanggan.id}`} className="text-blue-600 hover:underline text-sm">
                            Lihat & Edit Detail
                        </Link>
                    ) : (
                        <p className="text-xs text-gray-500 italic">
                            Klik marker untuk melihat detail
                        </p>
                    )}
                </div>
            </Popup>
        </Marker>
    );
};

export default CustomerMarker;