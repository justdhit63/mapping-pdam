import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../supabaseClient';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import { FaSearch } from 'react-icons/fa'

function FitBounds({ points }) {
    const map = useMap();
    useEffect(() => {
        // Pastikan ada titik untuk di-render dan library Leaflet sudah siap
        if (points.length > 0 && map) {
            map.fitBounds(points, { padding: [50, 50] }); // Beri sedikit padding
        }
    }, [points, map]);
    return null; // Komponen ini tidak me-render apa pun
}

function FlyToLocation({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            // Terbang ke koordinat dengan level zoom 17 (lebih dekat)
            map.flyTo(position, 17, {
                animate: true,
                duration: 1.5, // Durasi animasi dalam detik
            });
        }
    }, [position, map]);
    return null;
}

const Map = () => {
    const [pelangganList, setPelangganList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchId, setSearchId] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [flyToPosition, setFlyToPosition] = useState(null);

    useEffect(() => {
        const fetchAllPelanggan = async () => {
            setLoading(true);
            // Ambil hanya kolom yang diperlukan untuk efisiensi
            const { data, error } = await supabase
                .from('pelanggan')
                .select('id, id_pelanggan, nama_pelanggan, alamat, latitude, longitude');

            if (error) {
                console.error('Gagal mengambil data pelanggan:', error);
            } else {
                setPelangganList(data);
            }
            setLoading(false);
        };

        fetchAllPelanggan();
    }, []);

    const handleSearch = async () => {
        if (!searchId.trim()) {
            alert('Silakan masukkan ID Pelanggan untuk dicari.');
            return;
        }
        setIsSearching(true);
        setFlyToPosition(null); // Reset posisi terbang sebelumnya

        const { data, error } = await supabase
            .from('pelanggan')
            .select('latitude, longitude')
            .eq('id_pelanggan', searchId.trim())
            .single(); // .single() karena ID seharusnya unik

        if (error || !data) {
            alert('Pelanggan dengan ID tersebut tidak ditemukan.');
            console.error('Search error:', error);
        } else {
            if (data.latitude && data.longitude) {
                // Jika ditemukan, set koordinat tujuan untuk komponen FlyToLocation
                setFlyToPosition([data.latitude, data.longitude]);
            } else {
                alert('Pelanggan ditemukan, tetapi tidak memiliki data lokasi di peta.');
            }
        }
        setIsSearching(false);
    };

    // Siapkan array koordinat untuk komponen FitBounds
    const locations = pelangganList
        .filter(p => p.latitude && p.longitude) // Filter hanya yang punya koordinat valid
        .map(p => [p.latitude, p.longitude]);

    // Opsi: Custom Icon untuk Marker
    const customIcon = new L.Icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41],
    });

    return (
        <>
            <Header />
            <div className="bg-gray-200 py-16 px-10">
                <Navbar />

                {/* Map Section */}
                <div className="my-8 bg-white p-8">
                    <h1 className="text-2xl font-bold mb-4">Peta Sebaran Pelanggan</h1>
                    {loading ? (
                        <p>Memuat data peta...</p>
                    ) : (
                        <div className="w-full h-[60vh] rounded-lg overflow-hidden">
                            <MapContainer
                                center={[-7.2278, 107.9087]} // Posisi awal sebelum auto-fit
                                zoom={10}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />

                                {pelangganList.map(pelanggan => (
                                    // Pastikan pelanggan punya koordinat sebelum dirender
                                    pelanggan.latitude && pelanggan.longitude && (
                                        <Marker
                                            key={pelanggan.id}
                                            position={[pelanggan.latitude, pelanggan.longitude]}
                                            icon={customIcon}
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
                                    )
                                ))}

                                {/* Panggil komponen FitBounds untuk menyesuaikan view */}
                                {locations.length > 0 && <FitBounds points={locations} />}

                                {!flyToPosition && locations.length > 0 && <FitBounds points={locations} />}
                                
                                {flyToPosition && <FlyToLocation position={flyToPosition} />}
                            </MapContainer>
                        </div>
                    )}
                    <div className='flex shadow-md mb-8'>
                        <input
                            type="text"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder='Cari berdasarkan ID Pelanggan..'
                            className='w-full py-2 px-4 rounded-l-xl border border-gray-300'
                        />
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className='px-4 py-2 border rounded-r-xl border-gray-300'
                        >
                            <FaSearch />
                        </button>
                    </div>
                    <div className="rounded-lg shadow-md">
                        <h3 className='font-medium sm:text-2xl mb-4'>Daftar Pelanggan</h3>
                        <div className="py-4 px-8 mb-4 rounded-lg border border-gray-300 shadow-lg sm:flex items-center gap-8">
                            <img src="./image-break.png" alt="" className='w-20 mx-auto sm:mx-0' />
                            <div className="">
                                <div className="flex gap-2 sm:gap-8 items-center mb-2 justify-center">
                                    <h2 className='font-medium text-xs sm:text-xl'>ID Pelanggan</h2>
                                    <h2 className='font-medium text-xs sm:text-xl'>|</h2>
                                    <h2 className='font-medium text-xs sm:text-xl'>Nama Pelanggan</h2>
                                </div>
                                <h5 className='text-gray-600 text-xs text-center sm:text-left'>Alamat Pelanggan</h5>
                            </div>
                        </div>
                        <div className="py-4 px-8 mb-4 rounded-lg border border-gray-300 shadow-lg sm:flex items-center gap-8">
                            <img src="./image-break.png" alt="" className='w-20 mx-auto sm:mx-0' />
                            <div className="">
                                <div className="flex gap-2 sm:gap-8 items-center mb-2 justify-center">
                                    <h2 className='font-medium text-xs sm:text-xl'>ID Pelanggan</h2>
                                    <h2 className='font-medium text-xs sm:text-xl'>|</h2>
                                    <h2 className='font-medium text-xs sm:text-xl'>Nama Pelanggan</h2>
                                </div>
                                <h5 className='text-gray-600 text-xs text-center sm:text-left'>Alamat Pelanggan</h5>
                            </div>
                        </div>
                        <div className="py-4 px-8 mb-4 rounded-lg border border-gray-300 shadow-lg sm:flex items-center gap-8">
                            <img src="./image-break.png" alt="" className='w-20 mx-auto sm:mx-0' />
                            <div className="">
                                <div className="flex gap-2 sm:gap-8 items-center mb-2 justify-center">
                                    <h2 className='font-medium text-xs sm:text-xl'>ID Pelanggan</h2>
                                    <h2 className='font-medium text-xs sm:text-xl'>|</h2>
                                    <h2 className='font-medium text-xs sm:text-xl'>Nama Pelanggan</h2>
                                </div>
                                <h5 className='text-gray-600 text-xs text-center sm:text-left'>Alamat Pelanggan</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Map
