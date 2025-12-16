// src/pages/AdminRegistrations.jsx
import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye, FaUser, FaClock, FaUserPlus, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { registrationsService } from '../services/supabaseServices';
import Navbar from '../components/Navbar';

const AdminRegistrations = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState(''); // 'approve', 'reject', or 'view'
    const [formData, setFormData] = useState({
        id_pelanggan: '',
        cabang_id: '',
        rayon_id: '',
        golongan_id: '',
        kelompok_id: '',
        jenis_meter: '',
        tanggal_pemasangan: '',
        distribusi: '',
        sumber: '',
        kondisi_lingkungan: 'bersih',
        kategori: 'jadwal harian',
        rejected_reason: ''
    });
    const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

    useEffect(() => {
        loadRegistrations();
    }, []);

    const loadRegistrations = async () => {
        try {
            setLoading(true);
            const data = await registrationsService.getAll();
            setRegistrations(data || []);
        } catch (error) {
            console.error('Error loading registrations:', error);
            alert('Error loading registrations: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!formData.id_pelanggan.trim()) {
            alert('No SL (ID Pelanggan) wajib diisi!');
            return;
        }

        try {
            const approvalData = {
                id_pelanggan: formData.id_pelanggan,
                cabang_id: formData.cabang_id || null,
                rayon_id: formData.rayon_id || null,
                golongan_id: formData.golongan_id || null,
                kelompok_id: formData.kelompok_id || null,
                jenis_meter: formData.jenis_meter || null,
                tanggal_pemasangan: formData.tanggal_pemasangan || null,
                distribusi: formData.distribusi || null,
                sumber: formData.sumber || null,
                kondisi_lingkungan: formData.kondisi_lingkungan || 'bersih',
                kategori: formData.kategori || 'jadwal harian'
            };

            await registrationsService.approve(selectedRegistration.id, approvalData);
            alert('Registrasi berhasil disetujui dan pelanggan telah aktif!');
            loadRegistrations();
            closeModal();
        } catch (error) {
            alert('Error approving registration: ' + error.message);
        }
    };

    const handleReject = async () => {
        if (!formData.rejected_reason.trim()) {
            alert('Alasan penolakan wajib diisi!');
            return;
        }

        try {
            await registrationsService.reject(selectedRegistration.id, formData.rejected_reason);
            alert('Registrasi berhasil ditolak!');
            loadRegistrations();
            closeModal();
        } catch (error) {
            alert('Error rejecting registration: ' + error.message);
        }
    };

    const openModal = (registration, type) => {
        setSelectedRegistration(registration);
        setActionType(type);
        setShowModal(true);
        
        // Reset form data
        setFormData({
            id_pelanggan: '',
            cabang_id: '',
            rayon_id: '',
            golongan_id: '',
            kelompok_id: '',
            jenis_meter: '',
            tanggal_pemasangan: '',
            distribusi: '',
            sumber: '',
            kondisi_lingkungan: 'bersih',
            kategori: 'jadwal harian',
            rejected_reason: ''
        });
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedRegistration(null);
        setActionType('');
    };

    const filteredRegistrations = registrations.filter(reg => {
        if (filter === 'all') return true;
        return reg.status === filter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusCount = (status) => {
        return registrations.filter(r => r.status === status).length;
    };

    return (
        <div className="min-h-screen bg-gray-100 pt-24 pb-10 px-4 sm:px-16">
            <Navbar />
            <div className="container mx-auto px-4 py-8 pt-24">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        📋 Kelola Registrasi Pelanggan
                    </h1>
                    <p className="text-gray-600">
                        Review dan kelola registrasi pelanggan baru yang masuk
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <div className="flex items-center">
                            <FaUserPlus className="text-blue-600 text-2xl mr-4" />
                            <div>
                                <h3 className="text-lg font-semibold text-blue-900">Total</h3>
                                <p className="text-2xl font-bold text-blue-700">{registrations.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                        <div className="flex items-center">
                            <FaClock className="text-yellow-600 text-2xl mr-4" />
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-900">Pending</h3>
                                <p className="text-2xl font-bold text-yellow-700">{getStatusCount('pending')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <div className="flex items-center">
                            <FaCheck className="text-green-600 text-2xl mr-4" />
                            <div>
                                <h3 className="text-lg font-semibold text-green-900">Approved</h3>
                                <p className="text-2xl font-bold text-green-700">{getStatusCount('approved')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                        <div className="flex items-center">
                            <FaTimes className="text-red-600 text-2xl mr-4" />
                            <div>
                                <h3 className="text-lg font-semibold text-red-900">Rejected</h3>
                                <p className="text-2xl font-bold text-red-700">{getStatusCount('rejected')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Semua ({registrations.length})
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Pending ({getStatusCount('pending')})
                        </button>
                        <button
                            onClick={() => setFilter('approved')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Approved ({getStatusCount('approved')})
                        </button>
                        <button
                            onClick={() => setFilter('rejected')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Rejected ({getStatusCount('rejected')})
                        </button>
                    </div>
                </div>

                {/* Registrations List */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-6">Daftar Registrasi</h2>
                    
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-2">Memuat data registrasi...</p>
                        </div>
                    ) : filteredRegistrations.length === 0 ? (
                        <div className="text-center py-8">
                            <FaUser className="text-gray-400 text-4xl mx-auto mb-4" />
                            <p className="text-gray-600">Tidak ada registrasi ditemukan</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredRegistrations.map((registration) => (
                                <div key={registration.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-3">
                                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                                    {registration.no_registrasi}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(registration.status_registrasi)}`}>
                                                    {registration.status_registrasi?.toUpperCase()}
                                                </span>
                                                {registration.id_pelanggan && (
                                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                                        No SL: {registration.id_pelanggan}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {registration.nama_pelanggan}
                                            </h3>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <FaEnvelope className="text-gray-400" />
                                                    {registration.email}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FaPhone className="text-gray-400" />
                                                    {registration.no_telpon}
                                                </div>
                                                <div className="flex items-center gap-2 md:col-span-2">
                                                    <FaMapMarkerAlt className="text-gray-400" />
                                                    {registration.alamat}
                                                </div>
                                            </div>
                                            
                                            <div className="mt-2 text-xs text-gray-400">
                                                Tanggal: {new Date(registration.tanggal_registrasi).toLocaleDateString('id-ID', {
                                                    year: 'numeric', month: 'long', day: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                            
                                            {registration.user?.full_name && (
                                                <div className="mt-1 text-xs text-gray-500">
                                                    Disubmit oleh: {registration.user.full_name}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="mt-4 lg:mt-0 lg:ml-6">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openModal(registration, 'view')}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
                                                >
                                                    <FaEye /> Detail
                                                </button>
                                                {registration.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => openModal(registration, 'approve')}
                                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
                                                        >
                                                            <FaCheck /> Setujui
                                                        </button>
                                                        <button
                                                            onClick={() => openModal(registration, 'reject')}
                                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
                                                        >
                                                            <FaTimes /> Tolak
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Actions */}
            {showModal && selectedRegistration && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                {actionType === 'approve' ? '✅ Setujui Registrasi' :
                                 actionType === 'reject' ? '❌ Tolak Registrasi' : '👁️ Detail Registrasi'}
                            </h2>
                            
                            {/* Registration Details */}
                            <div className="bg-gray-50 p-6 rounded-lg mb-6">
                                <h3 className="font-medium text-gray-900 mb-4">📋 Informasi Registrasi</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><strong>No Registrasi:</strong> {selectedRegistration.no_registrasi}</div>
                                    <div><strong>Status:</strong> 
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedRegistration.status_registrasi)}`}>
                                            {selectedRegistration.status_registrasi?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div><strong>Nama:</strong> {selectedRegistration.nama_pelanggan}</div>
                                    <div><strong>Email:</strong> {selectedRegistration.email}</div>
                                    <div><strong>Telepon:</strong> {selectedRegistration.no_telpon}</div>
                                    <div><strong>Jumlah Jiwa:</strong> {selectedRegistration.jumlah_jiwa}</div>
                                    <div className="md:col-span-2"><strong>Alamat:</strong> {selectedRegistration.alamat}</div>
                                    <div><strong>Latitude:</strong> {selectedRegistration.latitude}</div>
                                    <div><strong>Longitude:</strong> {selectedRegistration.longitude}</div>
                                    <div><strong>Tanggal Registrasi:</strong> {new Date(selectedRegistration.created_at).toLocaleDateString('id-ID')}</div>
                                    <div><strong>Disubmit oleh:</strong> {selectedRegistration.user?.full_name || 'Unknown'}</div>
                                    {selectedRegistration.catatan_registrasi && (
                                        <div className="md:col-span-2"><strong>Catatan:</strong> {selectedRegistration.catatan_registrasi}</div>
                                    )}
                                </div>
                                
                                {/* Document Links */}
                                <div className="mt-4">
                                    <h4 className="font-medium text-gray-900 mb-2">📄 Dokumen</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {selectedRegistration.foto_rumah_url && (
                                            <div>
                                                <strong>Foto Rumah:</strong>
                                                <a href={`http://localhost:3001${selectedRegistration.foto_rumah_url}`} 
                                                   target="_blank" rel="noopener noreferrer"
                                                   className="block text-blue-600 hover:text-blue-800 underline">
                                                    Lihat Foto
                                                </a>
                                            </div>
                                        )}
                                        {selectedRegistration.foto_ktp_url && (
                                            <div>
                                                <strong>Foto KTP:</strong>
                                                <a href={`http://localhost:3001${selectedRegistration.foto_ktp_url}`} 
                                                   target="_blank" rel="noopener noreferrer"
                                                   className="block text-blue-600 hover:text-blue-800 underline">
                                                    Lihat Foto
                                                </a>
                                            </div>
                                        )}
                                        {selectedRegistration.foto_kk_url && (
                                            <div>
                                                <strong>Foto KK:</strong>
                                                <a href={`http://localhost:3001${selectedRegistration.foto_kk_url}`} 
                                                   target="_blank" rel="noopener noreferrer"
                                                   className="block text-blue-600 hover:text-blue-800 underline">
                                                    Lihat Foto
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Approval Form */}
                            {actionType === 'approve' && (
                                <div className="mb-6">
                                    <h3 className="font-medium text-gray-900 mb-4">📝 Data Pelanggan</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                No SL (ID Pelanggan) *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.id_pelanggan}
                                                onChange={(e) => setFormData({...formData, id_pelanggan: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Masukkan No SL"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status Layanan *
                                            </label>
                                            <select
                                                value={formData.jenis_meter}
                                                onChange={(e) => setFormData({...formData, jenis_meter: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                <option value="">Pilih Status Layanan</option>
                                                <option value="bisa di layani">Bisa Di Layani</option>
                                                <option value="daftar tunggu">Daftar Tunggu</option>
                                                <option value="tidak bisa dilayani">Tidak Bisa Dilayani</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tanggal Pemasangan
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.tanggal_pemasangan}
                                                onChange={(e) => setFormData({...formData, tanggal_pemasangan: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Kondisi Lingkungan
                                            </label>
                                            <select
                                                value={formData.kondisi_lingkungan}
                                                onChange={(e) => setFormData({...formData, kondisi_lingkungan: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="bersih">Bersih</option>
                                                <option value="kotor">Kotor</option>
                                                <option value="bermasalah">Bermasalah</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Kategori
                                            </label>
                                            <select
                                                value={formData.kategori}
                                                onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="jadwal harian">Jadwal Harian</option>
                                                <option value="jadwal mingguan">Jadwal Mingguan</option>
                                                <option value="jadwal bulanan">Jadwal Bulanan</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Rejection Form */}
                            {actionType === 'reject' && (
                                <div className="mb-6">
                                    <h3 className="font-medium text-gray-900 mb-4">❌ Penolakan</h3>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Alasan Penolakan *
                                    </label>
                                    <textarea
                                        value={formData.rejected_reason}
                                        onChange={(e) => setFormData({...formData, rejected_reason: e.target.value})}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Masukkan alasan penolakan registrasi..."
                                    />
                                </div>
                            )}

                            {/* Modal Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    onClick={closeModal}
                                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Tutup
                                </button>
                                {actionType === 'approve' && (
                                    <button
                                        onClick={handleApprove}
                                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                                    >
                                        <FaCheck /> Setujui Registrasi
                                    </button>
                                )}
                                {actionType === 'reject' && (
                                    <button
                                        onClick={handleReject}
                                        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                                    >
                                        <FaTimes /> Tolak Registrasi
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRegistrations;