import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaUsers, FaMapPin, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { rayonService, pelangganService } from '../services/supabaseServices';

const RayonManagement = () => {
    const [rayon, setRayon] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRayon, setEditingRayon] = useState(null);
    const [formData, setFormData] = useState({
        nama_rayon: '',
        kode_rayon: '',
        deskripsi: ''
    });

    useEffect(() => {
        fetchRayon();
    }, []);

    const fetchRayon = async () => {
        try {
            setLoading(true);
            const data = await rayonService.getAll();
            
            // Fetch pelanggan data to count by rayon
            const pelangganData = await pelangganService.getAll();
            
            // Add total_pelanggan count to each rayon
            const dataWithCounts = data.map(rayonItem => {
                const count = pelangganData.filter(p => p.rayon_id === rayonItem.id).length;
                return {
                    ...rayonItem,
                    total_pelanggan: count
                };
            });
            
            setRayon(dataWithCounts || []);
            
            // Calculate statistics
            const totalRayon = dataWithCounts.length;
            const activeRayon = dataWithCounts.filter(r => r.is_active).length;
            const inactiveRayon = totalRayon - activeRayon;
            const totalPelangganAssigned = dataWithCounts.reduce((sum, r) => sum + r.total_pelanggan, 0);
            
            setStats({
                total_rayon: totalRayon,
                active_rayon: activeRayon,
                inactive_rayon: inactiveRayon,
                total_pelanggan_assigned: totalPelangganAssigned
            });
        } catch (error) {
            console.error('Error fetching rayon:', error);
            setRayon([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRayon) {
                await rayonService.update(editingRayon.id, formData);
            } else {
                await rayonService.create(formData);
            }
            fetchRayon();
            resetForm();
        } catch (error) {
            console.error('Error saving rayon:', error);
            alert('Error saving rayon: ' + error.message);
        }
    };

    const handleEdit = (rayonItem) => {
        setEditingRayon(rayonItem);
        setFormData({
            nama_rayon: rayonItem.nama_rayon,
            kode_rayon: rayonItem.kode_rayon,
            deskripsi: rayonItem.deskripsi || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this rayon?')) {
            try {
                await rayonService.delete(id);
                fetchRayon();
            } catch (error) {
                console.error('Error deleting rayon:', error);
                alert('Error deleting rayon: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await rayonService.toggleRayonStatus(id);
            fetchRayon();
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Error toggling status: ' + (error.response?.data?.message || error.message));
        }
    };

    const resetForm = () => {
        setFormData({
            nama_rayon: '',
            kode_rayon: '',
            deskripsi: ''
        });
        setEditingRayon(null);
        setShowModal(false);
    };

    if (loading) {
        return <div className="text-center p-4">Loading rayon data...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-100 p-4 rounded-lg">
                        <div className="flex items-center">
                            <FaMapPin className="text-blue-600 text-2xl mr-3" />
                            <div>
                                <p className="text-sm text-blue-600">Total Rayon</p>
                                <p className="text-2xl font-bold text-blue-800">{stats.total_rayon}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-green-100 p-4 rounded-lg">
                        <div className="flex items-center">
                            <FaCheckCircle className="text-green-600 text-2xl mr-3" />
                            <div>
                                <p className="text-sm text-green-600">Active Rayon</p>
                                <p className="text-2xl font-bold text-green-800">{stats.active_rayon}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-red-100 p-4 rounded-lg">
                        <div className="flex items-center">
                            <FaTimesCircle className="text-red-600 text-2xl mr-3" />
                            <div>
                                <p className="text-sm text-red-600">Inactive Rayon</p>
                                <p className="text-2xl font-bold text-red-800">{stats.inactive_rayon}</p>
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
                <h2 className="text-2xl font-bold text-gray-800">Rayon Management</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
                >
                    <FaPlus /> Add Rayon
                </button>
            </div>

            {/* Rayon Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rayon Info
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kode
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Deskripsi
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
                            {rayon.map((rayonItem) => (
                                <tr key={rayonItem.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <FaMapPin className="text-blue-500 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {rayonItem.nama_rayon}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {rayonItem.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {rayonItem.kode_rayon}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate">
                                            {rayonItem.deskripsi || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <FaUsers className="text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-900">
                                                {rayonItem.total_pelanggan} pelanggan
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggleStatus(rayonItem.id)}
                                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition duration-200 ${
                                                rayonItem.is_active
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                            }`}
                                        >
                                            {rayonItem.is_active ? <FaToggleOn /> : <FaToggleOff />}
                                            {rayonItem.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(rayonItem)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rayonItem.id)}
                                                className="text-red-600 hover:text-red-900"
                                                disabled={rayonItem.total_pelanggan > 0}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {rayon.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No rayon found. Add your first rayon to get started.
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {editingRayon ? 'Edit Rayon' : 'Add New Rayon'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Rayon *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nama_rayon}
                                        onChange={(e) => setFormData({...formData, nama_rayon: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter rayon name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kode Rayon *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.kode_rayon}
                                        onChange={(e) => setFormData({...formData, kode_rayon: e.target.value.toUpperCase()})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter rayon code"
                                        maxLength="10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        value={formData.deskripsi}
                                        onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter description (optional)"
                                        rows="3"
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
                                    {editingRayon ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RayonManagement;
