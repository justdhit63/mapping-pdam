import React, { useState, useEffect } from 'react';
import {
    getAllPelangganAdmin,
    getAvailableUsers,
    createPelangganForUser,
    transferPelanggan,
    bulkAssignPelanggan
} from '../services/adminService.js';

const PelangganAssignment = () => {
    const [pelangganList, setPelangganList] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedPelanggan, setSelectedPelanggan] = useState([]);
    const [transferringPelanggan, setTransferringPelanggan] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        user_id: '',
        id_pelanggan: '',
        nama_pelanggan: '',
        no_telpon: '',
        alamat: '',
        jumlah_jiwa: '',
        jenis_meter: '',
        tanggal_pemasangan: '',
        longitude: '',
        latitude: '',
        foto_rumah: null
    });

    const [transferData, setTransferData] = useState({
        new_user_id: ''
    });

    // Load data on component mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        
        // Load pelanggan
        const pelangganResult = await getAllPelangganAdmin();
        if (pelangganResult.error) {
            setError(pelangganResult.error);
        } else {
            setPelangganList(pelangganResult.data);
        }

        // Load available users
        const usersResult = await getAvailableUsers();
        if (usersResult.error) {
            setError(usersResult.error);
        } else {
            setAvailableUsers(usersResult.data);
        }

        setLoading(false);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const result = await createPelangganForUser(formData);
        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(`Pelanggan berhasil dibuat dan ditugaskan ke ${result.data.assignedTo}!`);
            resetCreateForm();
            loadData();
        }
        setLoading(false);
    };

    const handleTransferSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const result = await transferPelanggan(transferringPelanggan.id, transferData.new_user_id);
        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(`Pelanggan ${result.data.pelanggan} berhasil dipindahkan dari ${result.data.from} ke ${result.data.to}!`);
            setShowTransferModal(false);
            setTransferringPelanggan(null);
            setTransferData({ new_user_id: '' });
            loadData();
        }
        setLoading(false);
    };

    const handleBulkAssign = async (userId) => {
        if (selectedPelanggan.length === 0) {
            setError('Pilih pelanggan yang akan ditugaskan');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const result = await bulkAssignPelanggan(userId, selectedPelanggan);
        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(`${result.data.affectedRows} pelanggan berhasil ditugaskan ke ${result.data.assignedTo}!`);
            setSelectedPelanggan([]);
            loadData();
        }
        setLoading(false);
    };

    const resetCreateForm = () => {
        setFormData({
            user_id: '',
            id_pelanggan: '',
            nama_pelanggan: '',
            no_telpon: '',
            alamat: '',
            jumlah_jiwa: '',
            jenis_meter: '',
            tanggal_pemasangan: '',
            longitude: '',
            latitude: '',
            foto_rumah: null
        });
        setShowCreateModal(false);
    };

    const handleSelectPelanggan = (pelangganId) => {
        setSelectedPelanggan(prev => 
            prev.includes(pelangganId) 
                ? prev.filter(id => id !== pelangganId)
                : [...prev, pelangganId]
        );
    };

    const handleSelectAll = () => {
        setSelectedPelanggan(
            selectedPelanggan.length === pelangganList.length 
                ? [] 
                : pelangganList.map(p => p.id)
        );
    };

    const startTransfer = (pelanggan) => {
        setTransferringPelanggan(pelanggan);
        setTransferData({ new_user_id: '' });
        setShowTransferModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Pelanggan Assignment</h2>
                <div className="space-x-2">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Tambah Pelanggan untuk User
                    </button>
                    {selectedPelanggan.length > 0 && (
                        <div className="inline-block">
                            <select
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleBulkAssign(parseInt(e.target.value));
                                        e.target.value = '';
                                    }
                                }}
                                className="bg-green-600 text-white px-4 py-2 rounded-md border-0"
                            >
                                <option value="">Assign Selected ({selectedPelanggan.length}) to...</option>
                                {availableUsers.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.full_name || user.email} ({user.total_pelanggan} pelanggan)
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {success}
                </div>
            )}

            {/* Available Users Summary */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">Available Users ({availableUsers.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableUsers.map(user => (
                        <div key={user.id} className="border rounded-lg p-4">
                            <div className="font-medium">{user.full_name || user.email}</div>
                            <div className="text-sm text-gray-600">{user.position || 'No position'}</div>
                            <div className="text-sm text-blue-600">{user.total_pelanggan} pelanggan</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pelanggan List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-bold mb-4">All Pelanggan Data</h3>
                    {loading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                checked={selectedPelanggan.length === pelangganList.length && pelangganList.length > 0}
                                                onChange={handleSelectAll}
                                                className="rounded"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pelanggan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Assigned To
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pelangganList.map((pelanggan) => (
                                        <tr key={pelanggan.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPelanggan.includes(pelanggan.id)}
                                                    onChange={() => handleSelectPelanggan(pelanggan.id)}
                                                    className="rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img 
                                                        src={pelanggan.foto_rumah_url ? `http://localhost:3001${pelanggan.foto_rumah_url}` : './image-break.png'} 
                                                        alt="Foto Rumah" 
                                                        className="w-10 h-10 object-cover rounded-md mr-3" 
                                                    />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {pelanggan.id_pelanggan}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {pelanggan.nama_pelanggan}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {pelanggan.user_email}
                                                    </div>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        pelanggan.user_role === 'admin' 
                                                            ? 'bg-yellow-100 text-yellow-800' 
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {pelanggan.user_role}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div>{pelanggan.no_telpon || '-'}</div>
                                                <div className="text-xs text-gray-500">
                                                    {pelanggan.jumlah_jiwa} jiwa | {pelanggan.jenis_meter}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="max-w-xs truncate">{pelanggan.alamat}</div>
                                                {pelanggan.latitude && pelanggan.longitude && (
                                                    <div className="text-xs">
                                                        {pelanggan.latitude}, {pelanggan.longitude}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => startTransfer(pelanggan)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Transfer
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {pelangganList.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                No pelanggan found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Pelanggan Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-3/4 max-w-4xl shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Tambah Pelanggan untuk User</h3>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Assign to User *</label>
                                    <select
                                        required
                                        value={formData.user_id}
                                        onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Pilih User</option>
                                        {availableUsers.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.full_name || user.email} ({user.total_pelanggan} pelanggan)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ID Pelanggan *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.id_pelanggan}
                                        onChange={(e) => setFormData({...formData, id_pelanggan: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nama Pelanggan *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nama_pelanggan}
                                        onChange={(e) => setFormData({...formData, nama_pelanggan: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">No. Telepon</label>
                                    <input
                                        type="tel"
                                        value={formData.no_telpon}
                                        onChange={(e) => setFormData({...formData, no_telpon: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Alamat</label>
                                    <textarea
                                        value={formData.alamat}
                                        onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                                        rows="3"
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Jumlah Jiwa</label>
                                    <input
                                        type="number"
                                        value={formData.jumlah_jiwa}
                                        onChange={(e) => setFormData({...formData, jumlah_jiwa: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Jenis Meter</label>
                                    <input
                                        type="text"
                                        value={formData.jenis_meter}
                                        onChange={(e) => setFormData({...formData, jenis_meter: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tanggal Pemasangan</label>
                                    <input
                                        type="date"
                                        value={formData.tanggal_pemasangan}
                                        onChange={(e) => setFormData({...formData, tanggal_pemasangan: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Foto Rumah</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFormData({...formData, foto_rumah: e.target.files[0]})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={resetCreateForm}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create & Assign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transfer Pelanggan Modal */}
            {showTransferModal && transferringPelanggan && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Transfer Pelanggan</h3>
                        <div className="mb-4 p-3 bg-gray-100 rounded">
                            <div className="font-medium">{transferringPelanggan.nama_pelanggan}</div>
                            <div className="text-sm text-gray-600">{transferringPelanggan.id_pelanggan}</div>
                            <div className="text-sm text-gray-600">Current: {transferringPelanggan.user_email}</div>
                        </div>
                        <form onSubmit={handleTransferSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Transfer to User</label>
                                <select
                                    required
                                    value={transferData.new_user_id}
                                    onChange={(e) => setTransferData({...transferData, new_user_id: e.target.value})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Pilih User</option>
                                    {availableUsers.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.full_name || user.email} ({user.total_pelanggan} pelanggan)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowTransferModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {loading ? 'Transferring...' : 'Transfer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PelangganAssignment;
