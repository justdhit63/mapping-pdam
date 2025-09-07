import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// import L from 'leaflet';
import { getAllPelanggan } from '../services/pelangganService.js';
import { getAllPelangganAdmin } from '../services/adminService.js';
import { getCurrentUser } from '../services/authService.js';
import apiClient from '../services/apiClient.js';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import { FaSearch, FaTimes, FaCrown, FaFilter, FaSpinner, FaUsers } from 'react-icons/fa'
import CustomerMarker from '../components/CustomMarker';

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
    const [selectedPelanggan, setSelectedPelanggan] = useState(null);
    const [user, setUser] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'aktif', 'tidak aktif'

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error('Error fetching current user:', error);
                // Fallback ke localStorage jika gagal
                const { getCurrentUserFromStorage } = await import('../services/authService.js');
                const fallbackUser = getCurrentUserFromStorage();
                setUser(fallbackUser);
            }
        };

        fetchCurrentUser();
    }, []);

    const fetchAllPelanggan = useCallback(async () => {
        setLoading(true);
        try {
            let data, error;

            if (user?.role === 'admin') {
                // Admin dapat melihat semua pelanggan dari semua user
                const adminResult = await getAllPelangganAdmin();
                data = adminResult.data;
                error = adminResult.error;
            } else {
                // User biasa hanya melihat pelanggan mereka sendiri
                const userResult = await getAllPelanggan();
                data = userResult.data;
                error = userResult.error;
            }

            if (error) {
                console.error('Gagal mengambil data pelanggan:', error);
            } else {
                setPelangganList(data || []);
            }
        } catch (error) {
            console.error('Error fetching pelanggan:', error);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchAllPelanggan();
        }
    }, [fetchAllPelanggan, user]);

    const handleSearch = async () => {
        if (!searchId.trim()) {
            alert('Silakan masukkan ID Pelanggan untuk dicari.');
            return;
        }
        setIsSearching(true);
        setFlyToPosition(null); // Reset posisi terbang sebelumnya

        try {
            // Cari pelanggan berdasarkan id_pelanggan dari data yang sudah ada
            const pelanggan = pelangganList.find(p => p.id_pelanggan === searchId.trim());

            if (!pelanggan) {
                alert('Pelanggan dengan ID tersebut tidak ditemukan.');
            } else {
                setSelectedPelanggan(pelanggan);
                if (pelanggan.latitude && pelanggan.longitude) {
                    // Jika ditemukan, set koordinat tujuan untuk komponen FlyToLocation
                    setFlyToPosition([pelanggan.latitude, pelanggan.longitude]);
                } else {
                    alert('Pelanggan ditemukan, tetapi tidak memiliki data lokasi di peta.');
                }
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Terjadi kesalahan saat mencari pelanggan.');
        } finally {
            setIsSearching(false);
        }
    };

    // Siapkan array koordinat untuk komponen FitBounds
    const locations = pelangganList
        .filter(p => p.latitude && p.longitude) // Filter hanya yang punya koordinat valid
        .map(p => [p.latitude, p.longitude]);

    // Opsi: Custom Icon untuk Marker
    // const customIcon = new L.Icon({
    //     iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    //     iconSize: [25, 41],
    //     iconAnchor: [12, 41],
    //     popupAnchor: [1, -34],
    //     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    //     shadowSize: [41, 41],
    // });

    const handleMarkerClick = (pelanggan) => {
        // Mengisi state di komponen induk ini
        setSelectedPelanggan(pelanggan);
        // Jika ada lokasi, atur posisi untuk 'terbang' ke sana
        if (pelanggan.latitude && pelanggan.longitude) {
            setFlyToPosition([pelanggan.latitude, pelanggan.longitude]);
        }
    };

    const filterPelangganByStatus = (pelanggan) => {
        if (statusFilter === 'all') return true;
        return pelanggan.status_pelanggan === statusFilter;
    };

    const filteredPelangganList = pelangganList.filter(filterPelangganByStatus);

    const activeCount = pelangganList.filter(p => p.status_pelanggan === 'aktif').length;
    const inactiveCount = pelangganList.filter(p => p.status_pelanggan === 'tidak aktif').length;

    return (
        <>
            <div className="bg-gray-200 pt-24 pb-10 px-4 sm:px-16">
                <Navbar />

                {/* Map Section */}
                <div className="my-10 p-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-medium">
                            Peta Sebaran Pelanggan
                            {user?.role === 'admin' && (
                                <span className="ml-2 text-yellow-600">
                                    <FaCrown className="inline ml-1" />
                                    Admin View
                                </span>
                            )}
                        </h1>
                    </div>

                    {/* Statistics Card for All Users */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        {user?.role === 'admin' ? 'Total Pelanggan' : 'Total Pelanggan Saya'}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-800">{pelangganList.length}</p>
                                </div>
                                <FaUsers className="text-3xl text-blue-500" />
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pelanggan Aktif</p>
                                    <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                                </div>
                                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pelanggan Tidak Aktif</p>
                                    <p className="text-2xl font-bold text-red-600">{inactiveCount}</p>
                                </div>
                                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    <div className='flex shadow-md mb-8'>
                        <input
                            type="text"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder='Cari berdasarkan ID Pelanggan..'
                            className='w-full py-2 px-4 rounded-l-xl border border-gray-300 bg-white'
                        />
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className='px-4 py-2 border rounded-r-xl border-gray-300 bg-blue-200'
                        >
                            <FaSearch />
                        </button>
                    </div>

                    {/* Filter for All Users */}
                    <div className="flex items-center gap-4 mb-6">
                        <FaFilter className="text-gray-600" />
                        <span className="text-gray-700 font-medium">Filter Status:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-md bg-white"
                        >
                            <option value="all">Semua Status</option>
                            <option value="aktif">Aktif ({activeCount})</option>
                            <option value="tidak aktif">Tidak Aktif ({inactiveCount})</option>
                        </select>

                        {/* Legend */}
                        <div className="flex items-center gap-4 ml-4">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-gray-600">Aktif</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-xs text-gray-600">Tidak Aktif</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:flex gap-8 z-10">

                        {loading ? (
                            <div className="flex items-center justify-center min-h-[60vh]">
                                <div className="text-center">
                                    <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
                                    <p className="text-gray-600">Memuat data peta...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-[60vh] rounded-lg overflow-hidden my-4 z-10 border border-gray-400 shadow-lg">
                                <MapContainer
                                    center={[-7.2278, 107.9087]} // Posisi awal sebelum auto-fit
                                    zoom={10}
                                    style={{ height: '100%', width: '100%', zIndex: '10', }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        className='z-10'
                                    />

                                    {filteredPelangganList.map(pelanggan => (
                                        pelanggan.latitude && pelanggan.longitude && (
                                            <CustomerMarker
                                                key={pelanggan.id}
                                                pelanggan={pelanggan}
                                                isSelected={selectedPelanggan?.id === pelanggan.id}
                                                onClick={handleMarkerClick}
                                                isAdminView={user?.role === 'admin'}
                                                showStatusColors={true}
                                            />
                                        )
                                    ))}
                                    {/* ----------------------------- */}

                                    {!flyToPosition && filteredPelangganList.filter(p => p.latitude && p.longitude).length > 0 &&
                                        <FitBounds points={filteredPelangganList.filter(p => p.latitude && p.longitude).map(p => [p.latitude, p.longitude])} />}
                                    {flyToPosition && <FlyToLocation position={flyToPosition} />}
                                </MapContainer>
                            </div>
                        )}

                        <div className="rounded-lg lg:w-2/5 border p-4 bg-white border-gray-300 shadow-lg my-4">
                            {selectedPelanggan ? (
                                // Tampilan jika ada pelanggan yang dipilih
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-bold text-gray-800">Rincian Pelanggan</h2>
                                        <button onClick={() => setSelectedPelanggan(null)} className="p-1 rounded-full hover:bg-gray-200">
                                            <FaTimes className="text-gray-500" />
                                        </button>
                                    </div>
                                    <img src={selectedPelanggan.foto_rumah_url || '/image-break.png'} alt="Foto Rumah" className="w-full h-48 object-cover rounded-md mb-4" />
                                    <div className="space-y-2 text-sm">
                                        <p><strong>ID Pelanggan:</strong> <span className="text-blue-600 font-semibold">{selectedPelanggan.id_pelanggan}</span></p>
                                        <p><strong>Nama:</strong> {selectedPelanggan.nama_pelanggan}</p>
                                        <p><strong>No. Telepon:</strong> {selectedPelanggan.no_telpon}</p>
                                        <p><strong>Alamat:</strong> {selectedPelanggan.alamat}</p>
                                        <p><strong>Tanggal Pasang:</strong> {new Date(selectedPelanggan.tanggal_pemasangan).toLocaleDateString('id-ID')}</p>
                                    </div>
                                    {user?.role !== 'admin' && (
                                        <Link to={`/daftar-pelanggan/edit-pelanggan/${selectedPelanggan.id}`} className="mt-4 block w-full text-center bg-yellow-500 text-white font-bold py-2 px-4 rounded-md hover:bg-yellow-600">
                                            Edit Detail Pelanggan
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                // Tampilan default jika tidak ada pelanggan yang dipilih
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                    <img src="./select-on-map.svg" alt="Pilih di Peta" className="w-32 h-32 mb-4" />
                                    <h3 className="text-lg font-semibold">Belum Ada Pelanggan Terpilih</h3>
                                    <p>Klik salah satu pin di peta untuk melihat rinciannya di sini.</p>
                                </div>
                            )}
                        </div>


                        {/* <div className="rounded-lg lg:w-2/5 border p-4 bg-white border-gray-300 shadow-lg">
                            <h1 className="text-xl font-medium">List Pelanggan</h1>
                            <div className="p-4">
                                <div className="border py-2 px-4 rounded-2xl bg-gray-100 border-gray-200 shadow-inner mb-4">
                                    <div className="flex items-center gap-2 font-bold text-black">
                                        <h5 className="">ID</h5>
                                        <h5 className="">|</h5>
                                        <h5 className="">Nama</h5>
                                    </div>
                                    <h5 className="text-gray-600">Alamat</h5>
                                </div>
                                <div className="border py-2 px-4 rounded-2xl bg-gray-100 border-gray-200 shadow-inner mb-4">
                                    <div className="flex items-center gap-2 font-bold text-black">
                                        <h5 className="">ID</h5>
                                        <h5 className="">|</h5>
                                        <h5 className="">Nama</h5>
                                    </div>
                                    <h5 className="text-gray-600">Alamat</h5>
                                </div>
                            </div>
                        </div> */}
                    </div>

                </div>
            </div>
        </>
    )
}

export default Map
