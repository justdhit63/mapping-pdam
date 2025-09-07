import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSave, FaTimes, FaMapMarkedAlt } from 'react-icons/fa';
import {
    getAllKecamatan,
    createKecamatan,
    updateKecamatan,
    deleteKecamatan,
    toggleKecamatanStatus,
    getKecamatanStatistics
} from '../services/kecamatanService.js';

const KecamatanManagement = () => {
    const [kecamatanList, setKecamatanList] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [error, setError] = useState('');

    // Form states
    const [formData, setFormData] = useState({
        nama_kecamatan: '',
        kode_kecamatan: ''
    });

    const [editFormData, setEditFormData] = useState({
        nama_kecamatan: '',
        kode_kecamatan: '',
        is_active: 1
    });

    useEffect(() => {
        loadKecamatanData();
        loadStatistics();
    }, []);

    const loadKecamatanData = async () => {
        setLoading(true);
        setError('');
        
        try {
            const { data, error } = await getAllKecamatan();
            if (error) {
                setError(error);
            } else {
                setKecamatanList(data || []);
            }
        } catch (err) {
            setError('Failed to load kecamatan data');
            console.error('Error loading kecamatan:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const { data, error } = await getKecamatanStatistics();
            if (error) {
                console.error('Error loading statistics:', error);
            } else {
                setStatistics(data || {});
            }
        } catch (err) {
            console.error('Error loading statistics:', err);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const { data, error } = await createKecamatan(formData);
            if (error) {
                setError(error);
            } else {
                setShowCreateForm(false);
                setFormData({ nama_kecamatan: '', kode_kecamatan: '' });
                loadKecamatanData();
                loadStatistics();
                alert('Kecamatan berhasil dibuat!');
            }
        } catch (err) {
            setError('Failed to create kecamatan');
            console.error('Error creating kecamatan:', err);
        }
    };

    const handleEditClick = (kecamatan) => {
        setEditingId(kecamatan.id);
        setEditFormData({
            nama_kecamatan: kecamatan.nama_kecamatan,
            kode_kecamatan: kecamatan.kode_kecamatan || '',
            is_active: kecamatan.is_active
        });
    };

    const handleEditSubmit = async (id) => {
        setError('');
        
        try {
            const { data, error } = await updateKecamatan(id, editFormData);
            if (error) {
                setError(error);
            } else {
                setEditingId(null);
                loadKecamatanData();
                loadStatistics();
                alert('Kecamatan berhasil diupdate!');
            }
        } catch (err) {
            setError('Failed to update kecamatan');
            console.error('Error updating kecamatan:', err);
        }
    };

    const handleDelete = async (id, namaKecamatan) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus kecamatan "${namaKecamatan}"?`)) {
            setError('');
            
            try {
                const { data, error } = await deleteKecamatan(id);
                if (error) {
                    setError(error);
                } else {
                    loadKecamatanData();
                    loadStatistics();
                    alert('Kecamatan berhasil dihapus!');
                }
            } catch (err) {
                setError('Failed to delete kecamatan');
                console.error('Error deleting kecamatan:', err);
            }
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        setError('');
        
        try {
            const { data, error } = await toggleKecamatanStatus(id);
            if (error) {
                setError(error);
            } else {
                loadKecamatanData();
                loadStatistics();
            }
        } catch (err) {
            setError('Failed to toggle kecamatan status');
            console.error('Error toggling status:', err);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditFormData({ nama_kecamatan: '', kode_kecamatan: '', is_active: 1 });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-lg">Loading kecamatan data...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-500 text-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Total Kecamatan</p>
                            <p className="text-2xl font-bold">{statistics.total_kecamatan || 0}</p>
                        </div>
                        <FaMapMarkedAlt className="text-3xl opacity-80" />
                    </div>
                </div>
                
                <div className="bg-green-500 text-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Kecamatan Aktif</p>
                            <p className="text-2xl font-bold">{statistics.active_kecamatan || 0}</p>
                        </div>
                        <FaToggleOn className="text-3xl opacity-80" />
                    </div>
                </div>

                <div className="bg-purple-500 text-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Rata-rata Desa/Kecamatan</p>
                            <p className="text-2xl font-bold">{statistics.avg_desa_per_kecamatan || 0}</p>
                        </div>
                        <FaMapMarkedAlt className="text-3xl opacity-80" />
                    </div>
                </div>

                <div className="bg-orange-500 text-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Rata-rata Pelanggan/Kecamatan</p>
                            <p className="text-2xl font-bold">{statistics.avg_pelanggan_per_kecamatan || 0}</p>
                        </div>
                        <FaMapMarkedAlt className="text-3xl opacity-80" />
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Create New Kecamatan Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Manajemen Kecamatan</h2>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <FaPlus /> {showCreateForm ? 'Batal' : 'Tambah Kecamatan'}
                </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h3 className="text-lg font-semibold mb-4">Tambah Kecamatan Baru</h3>
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nama Kecamatan *</label>
                                <input
                                    type="text"
                                    value={formData.nama_kecamatan}
                                    onChange={(e) => setFormData({...formData, nama_kecamatan: e.target.value})}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Masukkan nama kecamatan"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Kode Kecamatan</label>
                                <input
                                    type="text"
                                    value={formData.kode_kecamatan}
                                    onChange={(e) => setFormData({...formData, kode_kecamatan: e.target.value})}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Masukkan kode kecamatan"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                <FaSave /> Simpan
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setFormData({ nama_kecamatan: '', kode_kecamatan: '' });
                                }}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                <FaTimes /> Batal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Kecamatan Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kecamatan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Desa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Pelanggan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {kecamatanList.map((kecamatan) => (
                                <tr key={kecamatan.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {kecamatan.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === kecamatan.id ? (
                                            <input
                                                type="text"
                                                value={editFormData.nama_kecamatan}
                                                onChange={(e) => setEditFormData({...editFormData, nama_kecamatan: e.target.value})}
                                                className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                                            />
                                        ) : (
                                            <div className="text-sm font-medium text-gray-900">{kecamatan.nama_kecamatan}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === kecamatan.id ? (
                                            <input
                                                type="text"
                                                value={editFormData.kode_kecamatan}
                                                onChange={(e) => setEditFormData({...editFormData, kode_kecamatan: e.target.value})}
                                                className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-900">{kecamatan.kode_kecamatan || '-'}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                            {kecamatan.desa_count || 0} desa
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                            {kecamatan.pelanggan_count || 0} pelanggan
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggleStatus(kecamatan.id, kecamatan.is_active)}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                kecamatan.is_active 
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                            }`}
                                        >
                                            {kecamatan.is_active ? <FaToggleOn /> : <FaToggleOff />}
                                            {kecamatan.is_active ? 'Aktif' : 'Nonaktif'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {editingId === kecamatan.id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditSubmit(kecamatan.id)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Simpan"
                                                >
                                                    <FaSave />
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="text-gray-600 hover:text-gray-900"
                                                    title="Batal"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditClick(kecamatan)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(kecamatan.id, kecamatan.nama_kecamatan)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Hapus"
                                                    disabled={kecamatan.desa_count > 0 || kecamatan.pelanggan_count > 0}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {kecamatanList.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Tidak ada data kecamatan ditemukan.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KecamatanManagement;
