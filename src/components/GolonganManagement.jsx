import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaUsers, FaTags, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { golonganService } from '../services/supabaseServices';

const GolonganManagement = () => {
    const [golongan, setGolongan] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingGolongan, setEditingGolongan] = useState(null);
    const [formData, setFormData] = useState({
        kode_golongan: '',
        nama_golongan: ''
    });

    useEffect(() => {
        fetchGolongan();
        fetchStats();
    }, []);

    const fetchGolongan = async () => {
        try {
            setLoading(true);
            const data = await golonganService.getAll();
            setGolongan(data || []);
        } catch (error) {
            console.error('Error fetching golongan:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await golonganService.getStatistics();
            setStats(data || {});
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingGolongan) {
                await golonganService.update(editingGolongan.id, formData);
            } else {
                await golonganService.create(formData);
            }
            fetchGolongan();
            fetchStats();
            resetForm();
        } catch (error) {
            console.error('Error saving golongan:', error);
            alert('Error saving golongan: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (golonganItem) => {
        setEditingGolongan(golonganItem);
        setFormData({
            kode_golongan: golonganItem.kode_golongan,
            nama_golongan: golonganItem.nama_golongan
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this golongan?')) {
            try {
                await golonganService.delete(id);
                fetchGolongan();
                fetchStats();
            } catch (error) {
                console.error('Error deleting golongan:', error);
                alert('Error deleting golongan: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await golonganService.toggleGolonganStatus(id);
            fetchGolongan();
            fetchStats();
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Error toggling status: ' + (error.response?.data?.message || error.message));
        }
    };

    const resetForm = () => {
        setFormData({
            kode_golongan: '',
            nama_golongan: ''
        });
        setEditingGolongan(null);
        setShowModal(false);
    };

    if (loading) {
        return <div className="text-center p-4">Loading golongan data...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-100 p-4 rounded-lg">
                        <div className="flex items-center">
                            <FaTags className="text-blue-600 text-2xl mr-3" />
                            <div>
                                <p className="text-sm text-blue-600">Total Golongan</p>
                                <p className="text-2xl font-bold text-blue-800">{stats.total_golongan}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-green-100 p-4 rounded-lg">
                        <div className="flex items-center">
                            <FaCheckCircle className="text-green-600 text-2xl mr-3" />
                            <div>
                                <p className="text-sm text-green-600">Active Golongan</p>
                                <p className="text-2xl font-bold text-green-800">{stats.active_golongan}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-red-100 p-4 rounded-lg">
                        <div className="flex items-center">
                            <FaTimesCircle className="text-red-600 text-2xl mr-3" />
                            <div>
                                <p className="text-sm text-red-600">Inactive Golongan</p>
                                <p className="text-2xl font-bold text-red-800">{stats.inactive_golongan}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-purple-100 p-4 rounded-lg">
                        <div className="flex items-center">
                            <FaUsers className="text-purple-600 text-2xl mr-3" />
                            <div>
                                <p className="text-sm text-purple-600">Assigned Pelanggan</p>
                                <p className="text-2xl font-bold text-purple-800">{stats.total_pelanggan_assigned}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Golongan Management</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
                >
                    <FaPlus /> Add Golongan
                </button>
            </div>

            {/* Golongan Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kode
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nama Golongan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pelanggan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {golongan.map((golonganItem) => (
                                <tr key={golonganItem.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <FaTags className="text-blue-500 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {golonganItem.kode_golongan}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {golonganItem.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {golonganItem.nama_golongan}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <FaUsers className="text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-900">
                                                {golonganItem.total_pelanggan} pelanggan
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggleStatus(golonganItem.id)}
                                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition duration-200 ${
                                                golonganItem.is_active
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                            }`}
                                        >
                                            {golonganItem.is_active ? <FaToggleOn /> : <FaToggleOff />}
                                            {golonganItem.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(golonganItem)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(golonganItem.id)}
                                                className="text-red-600 hover:text-red-900"
                                                disabled={golonganItem.total_pelanggan > 0}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {golongan.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No golongan found. Add your first golongan to get started.
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {editingGolongan ? 'Edit Golongan' : 'Add New Golongan'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kode Golongan *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.kode_golongan}
                                        onChange={(e) => setFormData({...formData, kode_golongan: e.target.value.toUpperCase()})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., G1"
                                        maxLength="10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Golongan *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nama_golongan}
                                        onChange={(e) => setFormData({...formData, nama_golongan: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter golongan name"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                                >
                                    {editingGolongan ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GolonganManagement;
