import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { pelangganService } from '../services/supabaseServices.js';
import { FaArrowLeft, FaMapMarkerAlt, FaEdit, FaCalendar, FaPhone, FaHome, FaUsers, FaTint, FaBuilding, FaMapPin } from 'react-icons/fa';

const Detail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pelanggan, setPelanggan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPelangganDetail = async () => {
            setLoading(true);
            try {
                const data = await pelangganService.getById(parseInt(id));
                setPelanggan(data);
            } catch (error) {
                console.error('Error fetching pelanggan detail:', error);
                alert('Error: ' + error.message);
                navigate('/daftar-pelanggan');
            } finally {
                setLoading(false);
            }
        };

        fetchPelangganDetail();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="bg-gray-200 pt-24 pb-10 px-8 sm:px-16 min-h-screen">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat detail pelanggan...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!pelanggan) {
        return (
            <div className="bg-gray-200 pt-24 pb-10 px-8 sm:px-16 min-h-screen">
                <Navbar />
                <div className="text-center py-16">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Pelanggan Tidak Ditemukan</h1>
                    <Link to="/daftar-pelanggan" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg">
                        Kembali ke Daftar Pelanggan
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-200 pt-24 pb-10 px-8 sm:px-16 min-h-screen">
            <Navbar />
            
            {/* Header */}
            <div className="mb-8 mt-16">
                <div className="flex items-center gap-4 mb-4">
                    <button 
                        onClick={() => navigate('/daftar-pelanggan')}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                        <FaArrowLeft /> Kembali ke Daftar
                    </button>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Detail Pelanggan</h1>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-semibold text-blue-600">{pelanggan.id_pelanggan}</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-2xl font-medium text-gray-800">{pelanggan.nama_pelanggan}</span>
                        </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                            pelanggan.status_pelanggan === 'aktif' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                            Status: {pelanggan.status_pelanggan || 'aktif'}
                        </span>
                        
                        <Link to={`/daftar-pelanggan/edit-pelanggan/${pelanggan.id}`}>
                            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                <FaEdit /> Edit
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column - Photo & Basic Info */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Foto Rumah</h2>
                        <div className="mb-6">
                            <img 
                                src={pelanggan.foto_rumah_url ? `http://localhost:3001${pelanggan.foto_rumah_url}` : '/image-break.png'} 
                                alt="Foto Rumah" 
                                className="w-full h-64 object-cover rounded-lg border border-gray-200"
                            />
                        </div>
                        
                        {/* Quick Info */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <FaPhone className="text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-600">No. Telepon</p>
                                    <p className="font-medium">{pelanggan.no_telpon || '-'}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <FaUsers className="text-green-500" />
                                <div>
                                    <p className="text-sm text-gray-600">Jumlah Jiwa</p>
                                    <p className="font-medium">{pelanggan.jumlah_jiwa || '-'} orang</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <FaCalendar className="text-purple-500" />
                                <div>
                                    <p className="text-sm text-gray-600">Tanggal Pemasangan</p>
                                    <p className="font-medium">
                                        {pelanggan.tanggal_pemasangan 
                                            ? new Date(pelanggan.tanggal_pemasangan).toLocaleDateString('id-ID')
                                            : '-'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Detailed Info */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Informasi Dasar */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FaHome className="text-blue-500" />
                            Informasi Dasar
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">ID Pelanggan</label>
                                <p className="text-lg font-semibold text-blue-600">{pelanggan.id_pelanggan}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Nama Pelanggan</label>
                                <p className="text-lg font-medium text-gray-800">{pelanggan.nama_pelanggan}</p>
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Alamat</label>
                                <p className="text-gray-800 leading-relaxed">{pelanggan.alamat || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Informasi Teknis */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FaTint className="text-blue-500" />
                            Informasi Teknis
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Status Layanan</label>
                                <p className="text-gray-800">{pelanggan.jenis_meter || '-'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Kategori</label>
                                <p className="text-gray-800 capitalize">{pelanggan.kategori || '-'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Kondisi Meter</label>
                                <p className="text-gray-800">{pelanggan.kondisi_meter || '-'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Kondisi Lingkungan</label>
                                <p className="text-gray-800">{pelanggan.kondisi_lingkungan || '-'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Distribusi</label>
                                <p className="text-gray-800">{pelanggan.distribusi || '-'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Sumber</label>
                                <p className="text-gray-800">{pelanggan.sumber || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Informasi Water Meter */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-blue-500" />
                            Informasi Water Meter
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Stand Meter</label>
                                <p className="text-gray-800">{pelanggan.stand_meter || '-'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Nomer Water Meter</label>
                                <p className="text-gray-800">{pelanggan.nomer_water_meter || '-'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Merk Meter</label>
                                <p className="text-gray-800">{pelanggan.merk_meter || '-'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Ukuran Water Meter</label>
                                <p className="text-gray-800">{pelanggan.ukuran_water_meter || '-'}</p>
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Kondisi Water Meter</label>
                                <p className="text-gray-800">{pelanggan.kondisi_water_meter || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Informasi Wilayah */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FaBuilding className="text-blue-500" />
                            Informasi Wilayah
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Cabang</label>
                                <p className="text-gray-800">{pelanggan.cabang_nama || '-'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Desa</label>
                                <p className="text-gray-800">{pelanggan.nama_desa || '-'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Kecamatan</label>
                                <p className="text-gray-800">{pelanggan.nama_kecamatan || '-'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Rayon</label>
                                <p className="text-gray-800">{pelanggan.nama_rayon || '-'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Golongan</label>
                                <p className="text-gray-800">{pelanggan.nama_golongan || '-'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Kelompok</label>
                                <p className="text-gray-800">{pelanggan.nama_kelompok || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Informasi Lokasi */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FaMapPin className="text-blue-500" />
                            Informasi Lokasi
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Latitude</label>
                                <p className="text-gray-800 font-mono">{pelanggan.latitude || '-'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Longitude</label>
                                <p className="text-gray-800 font-mono">{pelanggan.longitude || '-'}</p>
                            </div>
                        </div>
                        
                        {pelanggan.latitude && pelanggan.longitude && (
                            <div className="mt-4">
                                <a 
                                    href={`https://www.google.com/maps?q=${pelanggan.latitude},${pelanggan.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <FaMapMarkerAlt />
                                    Lihat di Google Maps
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Detail;
