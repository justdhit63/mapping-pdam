import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaUsers, FaTags, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import kelompokService from '../services/kelompokService';

const KelompokManagement = () => {
    const [kelompok, setKelompok] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingKelompok, setEditingKelompok] = useState(null);
    const [formData, setFormData] = useState({
        kode_kelompok: '',
        nama_kelompok: ''
    });

    useEffect(() => {
        fetchKelompok();
        fetchStats();
    }, []);

    const fetchKelompok = async () => {
        try {
            setLoading(true);
            const response = await kelompokService.getAllKelompok();
            if (response.success) {
                setKelompok(response.data);
            }
        } catch (error) {
            console.error('Error fetching kelompok:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await kelompokService.getKelompokStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingKelompok) {
                await kelompokService.updateKelompok(editingKelompok.id, formData);
            } else {
                await kelompokService.createKelompok(formData);
            }
            await fetchKelompok();
            await fetchStats();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving kelompok:', error);
            alert('Error saving kelompok: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (kelompokItem) => {
        setEditingKelompok(kelompokItem);
        setFormData({
            kode_kelompok: kelompokItem.kode_kelompok,
            nama_kelompok: kelompokItem.nama_kelompok
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this kelompok?')) {
            try {
                await kelompokService.deleteKelompok(id);
                await fetchKelompok();
                await fetchStats();
            } catch (error) {
                console.error('Error deleting kelompok:', error);
                alert('Error deleting kelompok: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await kelompokService.toggleKelompokStatus(id);
            await fetchKelompok();
            await fetchStats();
        } catch (error) {
            console.error('Error toggling kelompok status:', error);
            alert('Error toggling kelompok status: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingKelompok(null);
        setFormData({
            kode_kelompok: '',
            nama_kelompok: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Kelompok Management</h2>
                
                {/* Statistics Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                            <div className="flex items-center">
                                <FaTags className="text-blue-500 text-xl mr-3" />
                                <div>
                                    <p className="text-sm text-gray-600">Total Kelompok</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.kelompok?.total || 0}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-green-100 p-4 rounded-lg border-l-4 border-green-500">
                            <div className="flex items-center">
                                <FaCheckCircle className="text-green-500 text-xl mr-3" />
                                <div>
                                    <p className="text-sm text-gray-600">Aktif</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.kelompok?.active || 0}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-red-100 p-4 rounded-lg border-l-4 border-red-500">
                            <div className="flex items-center">
                                <FaTimesCircle className="text-red-500 text-xl mr-3" />
                                <div>
                                    <p className="text-sm text-gray-600">Tidak Aktif</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.kelompok?.inactive || 0}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-yellow-100 p-4 rounded-lg border-l-4 border-yellow-500">
                            <div className="flex items-center">
                                <FaUsers className="text-yellow-500 text-xl mr-3" />
                                <div>
                                    <p className="text-sm text-gray-600">Total Pelanggan</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pelanggan?.total_pelanggan_assigned || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <FaPlus /> Add New Kelompok
                </button>
            </div>

            {/* Kelompok Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kode
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nama Kelompok
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Jumlah Pelanggan
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {kelompok.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.kode_kelompok}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.nama_kelompok}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        item.is_active 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {item.is_active ? 'Aktif' : 'Tidak Aktif'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="flex items-center">
                                        <FaUsers className="text-gray-400 mr-2" />
                                        {item.total_pelanggan || 0}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-blue-600 hover:text-blue-900 p-1"
                                            title="Edit"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(item.id)}
                                            className={`p-1 ${item.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                            title={item.is_active ? 'Deactivate' : 'Activate'}
                                        >
                                            {item.is_active ? <FaToggleOff /> : <FaToggleOn />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-600 hover:text-red-900 p-1"
                                            title="Delete"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {kelompok.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No kelompok found. Click "Add New Kelompok" to create one.
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingKelompok ? 'Edit Kelompok' : 'Add New Kelompok'}
                            </h3>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Kode Kelompok *
                                    </label>
                                    <input
                                        type="text"
                                        name="kode_kelompok"
                                        value={formData.kode_kelompok}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                        placeholder="e.g., K1"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nama Kelompok *
                                    </label>
                                    <input
                                        type="text"
                                        name="nama_kelompok"
                                        value={formData.nama_kelompok}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                        placeholder="e.g., Kelompok 1 - Domestik Rendah"
                                    />
                                </div>
                                
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                    >
                                        {editingKelompok ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KelompokManagement;
