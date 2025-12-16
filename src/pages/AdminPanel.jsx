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
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCrown, FaUser, FaMapMarkedAlt, FaUserCog, FaChartBar, FaUserPlus, FaBuilding, FaTree, FaMapMarked, FaDatabase, FaTags, FaLayerGroup } from 'react-icons/fa';

const AdminPanel = () => {
    const { isAdmin } = useAuth();
    const [allPelanggan, setAllPelanggan] = useState([]);
    const [users, setUsers] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, assign, cabang, data
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is admin
        if (!isAdmin()) {
            navigate('/dashboard');
            return;
        }

        fetchAdminData();
    }, [navigate, isAdmin]);

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
                                <div key={pelanggan.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <img 
                                                src={pelanggan.foto_rumah_url ? `http://localhost:3001${pelanggan.foto_rumah_url}` : './image-break.png'} 
                                                alt="Foto Rumah" 
                                                className='w-16 h-16 object-cover rounded-md' 
                                            />
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className='font-semibold text-lg text-blue-600'>{pelanggan.id_pelanggan}</h3>
                                                    <span className="text-gray-400">|</span>
                                                    <h3 className='font-medium text-lg text-gray-800'>{pelanggan.nama_pelanggan}</h3>
                                                </div>
                                                <p className='text-gray-600 text-sm'>{pelanggan.alamat}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                                        Owner: {pelanggan.user_email}
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded ${
                                                        pelanggan.user_role === 'admin' 
                                                            ? 'bg-yellow-100 text-yellow-800' 
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {pelanggan.user_role === 'admin' && <FaCrown className="inline mr-1" />}
                                                        {pelanggan.user_role}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right text-sm text-gray-500">
                                            <p>Created: {new Date(pelanggan.created_at).toLocaleDateString('id-ID')}</p>
                                            <p>Meter: {pelanggan.jenis_meter}</p>
                                            <p>Jiwa: {pelanggan.jumlah_jiwa}</p>
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
