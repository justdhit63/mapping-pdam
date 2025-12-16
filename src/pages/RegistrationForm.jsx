// src/pages/RegistrationForm.jsx
import React, { useState, useEffect } from 'react';
import { FaUser, FaPhone, FaHome, FaMapMarkerAlt, FaEnvelope, FaIdCard, FaUsers, FaCamera } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../components/MapPicker';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { registrationsService, desaService, kecamatanService } from '../services/supabaseServices';

const RegistrationForm = () => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nama_pelanggan: '',
        email: '',
        no_telpon: '',
        alamat: '',
        latitude: '',
        longitude: '',
        jumlah_jiwa: 1,
        catatan_registrasi: '',
        desa_id: '',
        kecamatan_id: ''
    });

    const [files, setFiles] = useState({
        foto_rumah: null,
        foto_ktp: null,
        foto_kk: null
    });

    const [previews, setPreviews] = useState({
        foto_rumah: null,
        foto_ktp: null,
        foto_kk: null
    });

    const [loading, setLoading] = useState(false);
    const [desaList, setDesaList] = useState([]);
    const [kecamatanData, setKecamatanData] = useState(null);

    useEffect(() => {
        const loadDesaList = async () => {
            try {
                const data = await desaService.getAll();
                setDesaList(data || []);
            } catch (error) {
                console.error('Error loading desa list:', error);
            }
        };
        
        loadDesaList();
    }, []);

    const loadKecamatanByDesa = async (desaId) => {
        try {
            const data = await kecamatanService.getByDesaId(desaId);
            setKecamatanData(data);
            // Auto-populate kecamatan_id in form
            setFormData(prev => ({ ...prev, kecamatan_id: data.id }));
        } catch (error) {
            console.error('Error loading kecamatan by desa:', error);
            setKecamatanData(null);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // When desa is changed, auto-populate kecamatan
        if (name === 'desa_id' && value) {
            loadKecamatanByDesa(value);
        } else if (name === 'desa_id' && !value) {
            // Reset kecamatan when desa is cleared
            setKecamatanData(null);
            setFormData(prev => ({ ...prev, kecamatan_id: '' }));
        }
    };

    const handleFileChange = (e, fileType) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                alert('Hanya file gambar (JPG, PNG) yang diperbolehkan');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Ukuran file maksimal 5MB');
                return;
            }

            setFiles(prev => ({
                ...prev,
                [fileType]: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviews(prev => ({
                    ...prev,
                    [fileType]: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLocationSelect = async (locationData) => {
        // MapPicker sends object: { latitude, longitude, alamat }
        const { latitude, longitude, alamat } = locationData || {};
        
        // Validate lat and lng are valid numbers
        if (latitude != null && longitude != null && !isNaN(latitude) && !isNaN(longitude)) {
            setFormData(prev => ({
                ...prev,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                // Don't update alamat automatically since we disabled reverse geocoding
                // User can manually input their address
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.nama_pelanggan || !formData.email || !formData.no_telpon || !formData.alamat) {
                throw new Error('Mohon lengkapi semua field yang wajib diisi');
            }

            if (!formData.desa_id || !formData.kecamatan_id) {
                throw new Error('Mohon pilih desa dan kecamatan');
            }

            if (!formData.latitude || !formData.longitude) {
                throw new Error('Mohon pilih lokasi di peta');
            }

            if (!files.foto_rumah) {
                throw new Error('Foto rumah wajib diupload');
            }

            if (!files.foto_ktp) {
                throw new Error('Foto KTP wajib diupload');
            }

            if (!files.foto_kk) {
                throw new Error('Foto KK wajib diupload');
            }

            // Create registration data object for Supabase
            const registrationData = {
                ...formData,
                user_id: profile.id,
                status: 'pending'
            };

            // Upload files to storage if needed
            // For now, we'll just submit without files or handle file upload separately
            const result = await registrationsService.create(registrationData);
            
            alert(`Registrasi berhasil! Nomor registrasi Anda: ${result.no_registrasi || result.id}. Mohon tunggu konfirmasi dari admin.`);
            navigate('/dashboard');
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const removeFile = (fileType) => {
        setFiles(prev => ({
            ...prev,
            [fileType]: null
        }));
        setPreviews(prev => ({
            ...prev,
            [fileType]: null
        }));
    };

    return (
        <div className="min-h-screen bg-gray-100 pt-24 pb-10 px-4 sm:px-16">
            <Navbar />
            <div className="container mx-auto px-4 py-8 pt-24">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                📝 Registrasi Pelanggan Baru
                            </h1>
                            <p className="text-gray-600">
                                Formulir pendaftaran pelanggan baru PDAM. Setelah submit, Anda akan mendapat nomor registrasi dan menunggu persetujuan admin.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Personal Information Section */}
                            <div className="bg-blue-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                    <FaUser className="mr-2" />
                                    Informasi Pribadi
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nama Lengkap *
                                        </label>
                                        <input
                                            type="text"
                                            name="nama_pelanggan"
                                            required
                                            value={formData.nama_pelanggan}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Masukkan nama lengkap"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="contoh@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            No. Telepon *
                                        </label>
                                        <input
                                            type="tel"
                                            name="no_telpon"
                                            required
                                            value={formData.no_telpon}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="08xxxxxxxxxx"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Jumlah Jiwa *
                                        </label>
                                        <input
                                            type="number"
                                            name="jumlah_jiwa"
                                            min="1"
                                            required
                                            value={formData.jumlah_jiwa}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Desa *
                                        </label>
                                        <select
                                            name="desa_id"
                                            required
                                            value={formData.desa_id}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Pilih Desa...</option>
                                            {desaList.map(desa => (
                                                <option key={desa.id} value={desa.id}>
                                                    {desa.nama_desa}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Kecamatan *
                                        </label>
                                        <input
                                            type="text"
                                            value={kecamatanData ? kecamatanData.nama_kecamatan : 'Pilih desa terlebih dahulu'}
                                            className="w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg"
                                            readOnly
                                            placeholder="Akan terisi otomatis setelah pilih desa"
                                        />
                                        <input
                                            type="hidden"
                                            name="kecamatan_id"
                                            value={formData.kecamatan_id}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="bg-green-50 p-6 rounded-lg z-10">
                                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                                    <FaMapMarkerAlt className="mr-2" />
                                    Informasi Lokasi
                                </h3>
                                
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Alamat Lengkap *
                                    </label>
                                    <textarea
                                        name="alamat"
                                        required
                                        rows={3}
                                        value={formData.alamat}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Masukkan alamat lengkap..."
                                    />
                                </div>

                                {/* Map Picker */}
                                <div className="mb-6 z-10">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pilih Lokasi di Peta *
                                    </label>
                                    <div className="border border-gray-300 z-10 rounded-lg overflow-hidden" style={{ zIndex: '10' }}>
                                        <MapPicker
                                            latitude={formData.latitude}
                                            longitude={formData.longitude}
                                            onLocationSelect={handleLocationSelect}
                                            style={{ zIndex: '10'}}
                                        />
                                    </div>
                                </div>

                                {/* Coordinates Display */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Latitude
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.latitude}
                                            readOnly
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                                            placeholder="Pilih di peta"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Longitude
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.longitude}
                                            readOnly
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                                            placeholder="Pilih di peta"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Document Upload Section */}
                            <div className="bg-yellow-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
                                    <FaCamera className="mr-2" />
                                    Upload Dokumen
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Foto Rumah */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Foto Rumah *
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                            {previews.foto_rumah ? (
                                                <div className="relative">
                                                    <img 
                                                        src={previews.foto_rumah} 
                                                        alt="Preview Foto Rumah" 
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile('foto_rumah')}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <FaHome className="mx-auto text-3xl text-gray-400 mb-2" />
                                                    <p className="text-sm text-gray-600">Klik untuk upload foto rumah</p>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, 'foto_rumah')}
                                                className="inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    {/* Foto KTP */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Foto KTP *
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
                                            {previews.foto_ktp ? (
                                                <div className="relative">
                                                    <img 
                                                        src={previews.foto_ktp} 
                                                        alt="Preview Foto KTP" 
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile('foto_ktp')}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <FaIdCard className="mx-auto text-3xl text-gray-400 mb-2" />
                                                    <p className="text-sm text-gray-600">Klik untuk upload foto KTP</p>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, 'foto_ktp')}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    {/* Foto KK */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Foto KK *
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
                                            {previews.foto_kk ? (
                                                <div className="relative">
                                                    <img 
                                                        src={previews.foto_kk} 
                                                        alt="Preview Foto KK" 
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile('foto_kk')}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <FaUsers className="mx-auto text-3xl text-gray-400 mb-2" />
                                                    <p className="text-sm text-gray-600">Klik untuk upload foto KK</p>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, 'foto_kk')}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 mt-4">
                                    * Format file: JPG, PNG. Maksimal ukuran file 5MB per file.
                                </p>
                            </div>

                            {/* Additional Notes */}
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Catatan Tambahan
                                </h3>
                                <textarea
                                    name="catatan_registrasi"
                                    rows={3}
                                    value={formData.catatan_registrasi}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Catatan atau informasi tambahan (opsional)..."
                                />
                            </div>

                            {/* Submit Section */}
                            <div className="bg-blue-50 p-6 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Submit Registrasi</h4>
                                        <p className="text-sm text-gray-600">
                                            Data akan dikirim ke admin untuk ditinjau dan disetujui. Anda akan mendapat nomor registrasi.
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Mengirim...
                                            </>
                                        ) : (
                                            <>
                                                📤 Submit Registrasi
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationForm;