import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar';
import { FaUser, FaPlus, FaMap, FaChartLine, FaCrown, FaDatabase } from 'react-icons/fa';
import { getCurrentUser, getCurrentUserFromStorage } from '../services/authService.js';
import { getAllPelanggan } from '../services/pelangganService.js';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [pelangganStats, setPelangganStats] = useState({ total: 0, aktif: 0, tidakAktif: 0 });
    const [recentPelanggan, setRecentPelanggan] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
                console.log('Current User:', currentUser);
                
                if (currentUser) {
                    loadPelangganData();
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                // Fallback ke localStorage
                const fallbackUser = getCurrentUserFromStorage();
                setUser(fallbackUser);
                console.log('Fallback User:', fallbackUser);
                
                if (fallbackUser) {
                    loadPelangganData();
                }
            }
        };

        fetchUserData();
    }, []);

    const loadPelangganData = async () => {
        try {
            const { data, error } = await getAllPelanggan();
            if (!error && data) {
                const total = data.length;
                const aktif = data.filter(p => p.status_pelanggan === 'aktif').length;
                const tidakAktif = total - aktif;
                
                setPelangganStats({ total, aktif, tidakAktif });
                setRecentPelanggan(data.slice(0, 5)); // 5 pelanggan terbaru
            }
        } catch (error) {
            console.error('Error loading pelanggan data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {/* Main Content */}
            <div className="bg-gray-200 min-h-screen py-24 px-10 sm:px-16">
                <Navbar />

                <div className="mt-16 mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-black">
                            {user.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {user.role === 'admin' 
                                ? 'Kelola semua aspek sistem PDAM' 
                                : `Selamat datang, ${user.full_name}`
                            }
                        </p>
                    </div>
                    {user.role === 'admin' && (
                        <div className="flex items-center gap-2 bg-teal-100 px-4 py-2 rounded-lg">
                            <FaCrown className="text-teal-600" />
                            <span className="text-teal-800 font-semibold">Administrator</span>
                        </div>
                    )}
                </div>

                {/* Different content based on role */}
                {user.role === 'admin' ? (
                    // Admin Dashboard Content
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* <div className="bg-white p-6 rounded-lg shadow-md border border-teal-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold">Total Sistem</h2>
                                <FaDatabase className="text-2xl text-yellow-600" />
                            </div>
                            <p className="text-2xl font-bold text-teal-700">{pelangganStats.total}</p>
                            <p className="text-sm text-gray-600">Semua Pelanggan</p>
                        </div> */}

                        <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                             onClick={() => navigate('/admin')}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold">Admin Panel</h2>
                                <FaCrown className="text-2xl text-teal-600" />
                            </div>
                            <p className="text-sm text-gray-600">Kelola Users & Data</p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                             onClick={() => navigate('/peta')}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold">Peta Sistem</h2>
                                <FaMap className="text-2xl text-green-600" />
                            </div>
                            <p className="text-sm text-gray-600">Lihat Peta</p>
                        </div>
                    </div>
                ) : (
                    // Regular User Dashboard Content  
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid sm:grid-cols-3 gap-4 mb-8">
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="flex items-center justify-between gap-8 mb-4">
                                        <h2 className="font-semibold mb-2">Total Pelanggan</h2>
                                        <div className="p-2 border border-gray-200 rounded-xl bg-blue-200">
                                            <FaUser size='24' className='text-blue-400' />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold">{pelangganStats.total}</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="flex items-center justify-between gap-8 mb-4">
                                        <h2 className="font-semibold mb-2">Pelanggan Aktif</h2>
                                        <div className="p-2 border border-gray-200 rounded-xl bg-green-200">
                                            <FaUser size='24' className='text-green-400' />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold">{pelangganStats.aktif}</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="flex items-center justify-between gap-8 mb-4">
                                        <h2 className="font-semibold mb-2">Tidak Aktif</h2>
                                        <div className="p-2 border border-gray-200 rounded-xl bg-red-200">
                                            <FaUser size='24' className='text-red-400' />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold">{pelangganStats.tidakAktif}</p>
                                </div>
                            </div>
                            
                            {/* Quick Actions for Users */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
                                <div className="grid sm:grid-cols-3 gap-4">
                                    <button 
                                        onClick={() => navigate('/input-data')}
                                        className="flex items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                        <FaPlus className="text-blue-600" />
                                        <span className="font-medium">Input Data Baru</span>
                                    </button>
                                    <button 
                                        onClick={() => navigate('/peta')}
                                        className="flex items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                    >
                                        <FaMap className="text-green-600" />
                                        <span className="font-medium">Lihat Peta</span>
                                    </button>
                                    <button 
                                        onClick={() => navigate('/daftar-pelanggan')}
                                        className="flex items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                                    >
                                        <FaUser className="text-purple-600" />
                                        <span className="font-medium">Daftar Pelanggan</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Recent Activity */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-4">Pelanggan Terbaru</h3>
                            {loading ? (
                                <p className="text-gray-500">Memuat data...</p>
                            ) : recentPelanggan.length > 0 ? (
                                <div className="space-y-3">
                                    {recentPelanggan.map((pelanggan, index) => (
                                        <div key={index} className="border-b border-gray-200 pb-2">
                                            <p className="font-medium text-sm">{pelanggan.nama_pelanggan}</p>
                                            <p className="text-xs text-gray-500">{pelanggan.alamat}</p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                pelanggan.status_pelanggan === 'aktif' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {pelanggan.status_pelanggan || 'aktif'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">Belum ada data pelanggan</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard
