import React, { useState, useEffect } from 'react';
import { desaService, kecamatanService, pelangganService } from '../services/supabaseServices';
import { FaToggleOn, FaToggleOff } from 'react-icons/fa';

const DesaManagement = () => {
    const [desaData, setDesaData] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingDesa, setEditingDesa] = useState(null);
    const [kecamatanList, setKecamatanList] = useState([]);

    // Form states
    const [formData, setFormData] = useState({
        nama_desa: '',
        kecamatan_id: ''
    });

    // Load data on component mount
    useEffect(() => {
        loadDesaData();
        loadStatistics();
        loadKecamatanList();
    }, []);

    const loadDesaData = async () => {
        try {
            setLoading(true);
            const data = await desaService.getAll();
            
            // Fetch all pelanggan to count by desa
            const pelangganData = await pelangganService.getAll();
            
            // Add total_pelanggan count to each desa
            const dataWithCounts = data.map(desa => {
                const count = pelangganData.filter(p => p.desa_id === desa.id).length;
                return {
                    ...desa,
                    total_pelanggan: count,
                    kecamatan_nama: desa.kecamatan?.nama_kecamatan || 'N/A'
                };
            });
            
            setDesaData(dataWithCounts || []);
        } catch (error) {
            console.error('Error loading desa data:', error);
            setDesaData([]);
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const data = await desaService.getStatistics();
            setStatistics(data);
        } catch (error) {
            console.error('Error loading statistics:', error);
            setStatistics(null);
        }
    };

    const loadKecamatanList = async () => {
        try {
            const data = await kecamatanService.getAll();
            setKecamatanList(data || []);
        } catch (error) {
            console.error('Error loading kecamatan list:', error);
            setKecamatanList([]);
        }
    };

    // Handle create desa
    const handleCreateDesa = async (e) => {
        e.preventDefault();
        try {
            await desaService.create(formData);
            setShowCreateForm(false);
            setFormData({ nama_desa: '', kecamatan_id: '' });
            loadDesaData();
            loadStatistics();
            alert('Desa created successfully!');
        } catch (error) {
            console.error('Error creating desa:', error);
            alert('Error creating desa: ' + error.message);
        }
    };

    // Handle edit desa
    const handleEditDesa = (desa) => {
        setEditingDesa(desa);
        setFormData({ 
            nama_desa: desa.nama_desa,
            kecamatan_id: desa.kecamatan_id || ''
        });
        setShowEditForm(true);
    };

    const handleUpdateDesa = async (e) => {
        e.preventDefault();
        try {
            await desaService.update(editingDesa.id, formData);
            setShowEditForm(false);
            setEditingDesa(null);
            setFormData({ nama_desa: '', kecamatan_id: '' });
            loadDesaData();
            alert('Desa updated successfully!');
        } catch (error) {
            console.error('Error updating desa:', error);
            alert('Error updating desa: ' + error.message);
        }
    };

    // Handle toggle desa status
    const handleToggleStatus = async (desaId) => {
        try {
            await desaService.toggleStatus(desaId);
            loadDesaData();
            alert('Desa status updated!');
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Error updating status: ' + error.message);
        }
    };

    // Handle delete desa
    const handleDeleteDesa = async (desaId, desaName) => {
        if (window.confirm(`Are you sure you want to delete "${desaName}"? This will remove desa assignment from all pelanggan in this desa.`)) {
            try {
                await desaService.delete(desaId);
                loadDesaData();
                loadStatistics();
                alert('Desa deleted successfully!');
            } catch (error) {
                console.error('Error deleting desa:', error);
                alert('Error deleting desa: ' + error.message);
            }
        }
    };

    // Cancel edit
    const cancelEdit = () => {
        setShowEditForm(false);
        setEditingDesa(null);
        setFormData({ nama_desa: '' });
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Desa Management</h2>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {showCreateForm ? 'Cancel' : 'Add New Desa'}
                </button>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Desa</p>
                                <p className="text-3xl font-bold text-blue-600">{statistics.summary.total_desa}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Desa</p>
                                <p className="text-3xl font-bold text-green-600">{statistics.summary.active_desa}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Pelanggan</p>
                                <p className="text-3xl font-bold text-purple-600">{statistics.summary.total_pelanggan}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg per Desa</p>
                                <p className="text-3xl font-bold text-orange-600">{Math.round(statistics.summary.avg_pelanggan_per_desa || 0)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Desa Form */}
            {(showCreateForm || showEditForm) && (
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="text-lg font-semibold mb-4">
                        {showEditForm ? 'Edit Desa' : 'Create New Desa'}
                    </h3>
                    <form onSubmit={showEditForm ? handleUpdateDesa : handleCreateDesa} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Desa *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.nama_desa}
                                onChange={(e) => setFormData({ ...formData, nama_desa: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., Desa Sumber Makmur"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kecamatan *
                            </label>
                            <select
                                required
                                value={formData.kecamatan_id}
                                onChange={(e) => setFormData({ ...formData, kecamatan_id: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Pilih Kecamatan...</option>
                                {kecamatanList.map(kecamatan => (
                                    <option key={kecamatan.id} value={kecamatan.id}>
                                        {kecamatan.nama_kecamatan} {kecamatan.kode_kecamatan && `(${kecamatan.kode_kecamatan})`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {showEditForm ? 'Update Desa' : 'Create Desa'}
                            </button>
                            {showEditForm && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* Top Desa by Pelanggan */}
            {statistics && statistics.topDesa && statistics.topDesa.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Top Desa by Pelanggan Count</h3>
                    <div className="space-y-2">
                        {statistics.topDesa.map((desa, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="font-medium">{desa.nama_desa}</span>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                    {desa.total_pelanggan} pelanggan
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Desa List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Desa List ({desaData.length})</h3>
                </div>

                {desaData.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        No desa found. Create your first desa to get started.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nama Desa
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kecamatan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Pelanggan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {desaData.map((desa) => (
                                    <tr key={desa.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {desa.nama_desa}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                                                {desa.kecamatan_nama || 'Belum di-assign'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                {desa.total_pelanggan} pelanggan
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleStatus(desa.id)}
                                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                    desa.is_active 
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                }`}
                                            >
                                                {desa.is_active ? <FaToggleOn /> : <FaToggleOff />}
                                                {desa.is_active ? 'Aktif' : 'Nonaktif'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(desa.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditDesa(desa)}
                                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDesa(desa.id, desa.nama_desa)}
                                                    className="bg-red-100 text-red-800 px-3 py-1 rounded text-xs hover:bg-red-200 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DesaManagement;
