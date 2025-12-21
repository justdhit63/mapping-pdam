import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import UserManagement from '../components/UserManagement';
import PelangganAssignment from '../components/PelangganAssignment';
import CabangManagement from '../components/CabangManagement';
import DesaManagement from '../components/DesaManagement';
import KecamatanManagement from '../components/KecamatanManagement';
import RayonManagement from '../components/RayonManagement';
import GolonganManagement from '../components/GolonganManagement';
import KelompokManagement from '../components/KelompokManagement';
import { pelangganService, usersService } from '../services/supabaseServices';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaUsers, FaCrown, FaUser, FaMapMarkedAlt, FaUserCog, FaChartBar, FaUserPlus, FaBuilding, FaTree, FaMapMarked, FaDatabase, FaTags, FaLayerGroup, FaFileImport, FaClipboardList } from 'react-icons/fa';

const AdminPanel = () => {
    const { isAdmin, profile, loading: authLoading } = useAuth();
    const [allPelanggan, setAllPelanggan] = useState([]);
    const [users, setUsers] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, assign, cabang, data
    const navigate = useNavigate();

    useEffect(() => {
        // Wait for auth to load
        if (authLoading) return;
        
        // Check if user is admin
        if (!isAdmin()) {
            navigate('/dashboard');
            return;
        }

        fetchAdminData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading]); // Only run once when auth finishes loading

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            // Fetch all pelanggan (RLS will allow admin to see all)
            const pelangganData = await pelangganService.getAll();
            setAllPelanggan(pelangganData || []);

            // Fetch user stats
            const statsData = await usersService.getStats();
            setUserStats(statsData.userStats || {});
            setSummary(statsData.summary || {});

            // Fetch all users with pelanggan count
            const usersData = await usersService.getAll();
            
            // Calculate pelanggan count for each user
            const usersWithStats = usersData.map(user => {
                const userPelanggan = pelangganData.filter(p => p.user_id === user.id);
                return {
                    ...user,
                    total_pelanggan: userPelanggan.length
                };
            });
            
            setUsers(usersWithStats);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-200 pt-24 px-8 sm:px-16 min-h-screen">
                <Navbar />
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading admin data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-200 pt-24 min-h-screen px-8 sm:px-16">
            <Navbar />
            
            <div className="mt-16">
                <div className="flex items-center gap-3 mb-8">
                    <FaCrown className="text-yellow-500 text-3xl" />
                    <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                </div>

                {/* Responsive Tab Navigation */}
                <div className="bg-white rounded-lg shadow-md mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`flex-shrink-0 py-4 px-6 text-sm font-medium border-b-2 ${
                                    activeTab === 'overview'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <FaChartBar className="inline mr-2" />
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`flex-shrink-0 py-4 px-6 text-sm font-medium border-b-2 ${
                                    activeTab === 'users'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <FaUserCog className="inline mr-2" />
                                User Management
                            </button>
                            <button
                                onClick={() => setActiveTab('assign')}
                                className={`flex-shrink-0 py-4 px-6 text-sm font-medium border-b-2 ${
                                    activeTab === 'assign'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <FaUserPlus className="inline mr-2" />
                                Assign Pelanggan
                            </button>
                            <button
                                onClick={() => setActiveTab('cabang')}
                                className={`flex-shrink-0 py-4 px-6 text-sm font-medium border-b-2 ${
                                    activeTab === 'cabang'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <FaBuilding className="inline mr-2" />
                                Cabang Management
                            </button>
                            <button
                                onClick={() => setActiveTab('desa')}
                                className={`flex-shrink-0 py-4 px-6 text-sm font-medium border-b-2 ${
                                    activeTab === 'desa'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <FaTree className="inline mr-2" />
                                Desa Management
                            </button>
                            <button
                                onClick={() => setActiveTab('kecamatan')}
                                className={`flex-shrink-0 py-4 px-6 text-sm font-medium border-b-2 ${
                                    activeTab === 'kecamatan'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <FaMapMarked className="inline mr-2" />
                                Kecamatan Management
                            </button>
                            <button
                                onClick={() => setActiveTab('rayon')}
                                className={`flex-shrink-0 py-4 px-6 text-sm font-medium border-b-2 ${
                                    activeTab === 'rayon'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <FaMapMarkedAlt className="inline mr-2" />
                                Rayon Management
                            </button>
                            <button
                                onClick={() => setActiveTab('golongan')}
                                className={`flex-shrink-0 py-4 px-6 text-sm font-medium border-b-2 ${
                                    activeTab === 'golongan'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <FaTags className="inline mr-2" />
                                Golongan Management
                            </button>
                            <button
                                onClick={() => setActiveTab('kelompok')}
                                className={`flex-shrink-0 py-4 px-6 text-sm font-medium border-b-2 ${
                                    activeTab === 'kelompok'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <FaLayerGroup className="inline mr-2" />
                                Kelompok Management
                            </button>
                            <button
                                onClick={() => setActiveTab('data')}
                                data-tab="data"
                                className={`flex-shrink-0 py-4 px-6 text-sm font-medium border-b-2 ${
                                    activeTab === 'data'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <FaDatabase className="inline mr-2" />
                                All Data
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <>
                        {/* Summary Cards */}
                        {summary && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                                            <p className="text-3xl font-bold text-blue-600">{summary.total_users}</p>
                                        </div>
                                        <FaUsers className="text-4xl text-blue-500" />
                                    </div>
                                </div>
                                
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Admins</p>
                                            <p className="text-3xl font-bold text-yellow-600">{summary.total_admins}</p>
                                        </div>
                                        <FaCrown className="text-4xl text-yellow-500" />
                                    </div>
                                </div>
                                
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Regular Users</p>
                                            <p className="text-3xl font-bold text-green-600">{summary.total_regular_users}</p>
                                        </div>
                                        <FaUser className="text-4xl text-green-500" />
                                    </div>
                                </div>
                                
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Pelanggan</p>
                                            <p className="text-3xl font-bold text-purple-600">{summary.total_pelanggan}</p>
                                        </div>
                                        <FaMapMarkedAlt className="text-4xl text-purple-500" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <Link 
                                to="/admin/registrations"
                                className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-white"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Kelola Registrasi</h3>
                                        <p className="text-blue-100 text-sm">Lihat dan kelola data pelanggan yang telah mendaftar</p>
                                    </div>
                                    <FaClipboardList className="text-5xl opacity-80" />
                                </div>
                            </Link>

                            <Link 
                                to="/admin/import-csv"
                                className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-white"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Import Data CSV</h3>
                                        <p className="text-green-100 text-sm">Import data pelanggan dari file CSV secara bulk</p>
                                    </div>
                                    <FaFileImport className="text-5xl opacity-80" />
                                </div>
                            </Link>
                        </div>

                        {/* User Statistics */}
                        <div className="bg-white p-8 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold mb-6">User Statistics</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Email</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Role</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Total Pelanggan</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Joined Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users && users.map((user) => (
                                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3">{user.email}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        user.role === 'admin' 
                                                            ? 'bg-yellow-100 text-yellow-800' 
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {user.role === 'admin' && <FaCrown className="inline mr-1" />}
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-purple-600">{user.total_pelanggan}</span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'users' && (
                    <UserManagement />
                )}

                {activeTab === 'assign' && (
                    <PelangganAssignment />
                )}

                {activeTab === 'cabang' && (
                    <CabangManagement />
                )}

                {activeTab === 'desa' && (
                    <DesaManagement />
                )}

                {activeTab === 'kecamatan' && (
                    <KecamatanManagement />
                )}

                {activeTab === 'rayon' && (
                    <RayonManagement />
                )}

                {activeTab === 'golongan' && (
                    <GolonganManagement />
                )}

                {activeTab === 'kelompok' && (
                    <KelompokManagement />
                )}

                {activeTab === 'data' && (
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-6">All Pelanggan Data</h2>
                        <div className="space-y-4">
                            {allPelanggan.map((pelanggan) => (
                                <div key={pelanggan.id} className="py-4 px-8 mb-4 rounded-lg border border-gray-200 shadow-lg transition hover:shadow-xl">
                                    <div className="sm:flex items-center gap-8">
                                        <img 
                                            src={pelanggan.foto_rumah_url || './image-break.png'} 
                                            alt="Foto Rumah" 
                                            className='w-20 h-20 object-cover rounded-md mx-auto sm:mx-0'
                                            onError={(e) => { e.target.src = './image-break.png' }}
                                        />
                                        <div className="flex-grow my-4 sm:my-0 text-center sm:text-left">
                                            <div className="flex gap-2 sm:gap-4 items-center mb-2 justify-center sm:justify-start">
                                                <h2 className='font-semibold text-lg sm:text-xl text-blue-600'>{pelanggan.id_pelanggan}</h2>
                                                <h2 className='font-medium text-gray-400'>|</h2>
                                                <h2 className='font-medium text-lg sm:text-xl text-gray-800'>{pelanggan.nama_pelanggan}</h2>
                                            </div>
                                            <p className='text-gray-600 mb-2'>{pelanggan.alamat}</p>
                                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                                    {pelanggan.desa?.nama_desa || 'N/A'}
                                                </span>
                                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                    Status: {pelanggan.status_pelanggan || 'aktif'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-center sm:text-right">
                                            <div className="text-sm text-gray-500 space-y-1 mb-3">
                                                <p className="font-medium">Created: {new Date(pelanggan.created_at).toLocaleDateString('id-ID')}</p>
                                                <p>Meter: {pelanggan.jenis_meter || 'bisa di layani'}</p>
                                                <p>Jiwa: {pelanggan.jumlah_jiwa || 1}</p>
                                            </div>
                                            {/* CRUD Buttons */}
                                            <div className="flex gap-2 justify-center sm:justify-end">
                                                <button
                                                    onClick={() => navigate(`/daftar-pelanggan/detail/${pelanggan.id}`)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                                    title="View Detail"
                                                >
                                                    <FaUserCog className="text-xs" /> Detail
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/daftar-pelanggan/edit-pelanggan/${pelanggan.id}`)}
                                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                                    title="Edit"
                                                >
                                                    <FaUserCog className="text-xs" /> Edit
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm(`Apakah Anda yakin ingin menghapus pelanggan ${pelanggan.nama_pelanggan}?`)) {
                                                            try {
                                                                await pelangganService.delete(pelanggan.id);
                                                                alert('Pelanggan berhasil dihapus!');
                                                                fetchAdminData(); // Refresh data
                                                            } catch (error) {
                                                                alert('Error menghapus pelanggan: ' + error.message);
                                                            }
                                                        }
                                                    }}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                                    title="Delete"
                                                >
                                                    <FaUserCog className="text-xs" /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {allPelanggan.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No pelanggan data found.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
