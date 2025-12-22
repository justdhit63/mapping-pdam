import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { pelangganService, cabangService, desaService, kecamatanService, rayonService, golonganService, kelompokService } from '../services/supabaseServices.js';
import { storageService } from '../services/storageService.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../components/MapPicker';
import { FaFloppyDisk } from 'react-icons/fa6';
import { FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';

const Form = () => {
    const [formData, setFormData] = useState({
        id_pelanggan: '',
        nama_pelanggan: '',
        no_telpon: '',
        alamat: '',
        jumlah_jiwa: '',
        jenis_meter: '',
        tanggal_pemasangan: '',
        longitude: '',
        latitude: '',
        cabang_id: '',
        desa_id: '',
        kecamatan_id: '',
        rayon_id: '',
        golongan_id: '',
        kelompok_id: '',
        distribusi: '',
        sumber: '',
        kondisi_meter: '',
        kondisi_lingkungan: '',
        kategori: '',
        status_pelanggan: 'aktif',
        stand_meter: '',
        nomer_water_meter: '',
        merk_meter: '',
        ukuran_water_meter: '',
        kondisi_meter: '',
    });

    const [isSearching, setIsSearching] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cabangList, setCabangList] = useState([]);
    const [desaList, setDesaList] = useState([]);
    const [rayonList, setRayonList] = useState([]);
    const [golonganList, setGolonganList] = useState([]);
    const [kelompokList, setKelompokList] = useState([]);
    const [kecamatanData, setKecamatanData] = useState(null);
    const navigate = useNavigate();
    const { user, profile } = useAuth();

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        loadCabangList();
        loadDesaList();
        loadRayonList();
        loadGolonganList();
        loadKelompokList();
    }, [user, navigate]);

    const loadCabangList = async () => {
        try {
            const data = await cabangService.getAll();
            setCabangList(data || []);
        } catch (error) {
            console.error('Error loading cabang:', error);
        }
    };

    const loadDesaList = async () => {
        try {
            const data = await desaService.getAll();
            setDesaList(data || []);
        } catch (error) {
            console.error('Error loading desa:', error);
        }
    };

    const loadRayonList = async () => {
        try {
            const data = await rayonService.getAll();
            setRayonList(data || []);
        } catch (error) {
            console.error('Error loading rayon:', error);
        }
    };

    const loadGolonganList = async () => {
        try {
            const data = await golonganService.getAll();
            setGolonganList(data || []);
        } catch (error) {
            console.error('Error loading golongan:', error);
        }
    };

    const loadKelompokList = async () => {
        try {
            const data = await kelompokService.getAll();
            setKelompokList(data || []);
        } catch (error) {
            console.error('Error loading kelompok:', error);
        }
    };

    const loadKecamatanByDesa = async (desaId) => {
        try {
            const desa = desaList.find(d => d.id === parseInt(desaId));
            if (desa && desa.kecamatan) {
                setKecamatanData(desa.kecamatan);
                // Auto-populate kecamatan_id in form
                setFormData(prev => ({ ...prev, kecamatan_id: desa.kecamatan.id }));
            } else {
                setKecamatanData(null);
                setFormData(prev => ({ ...prev, kecamatan_id: '' }));
            }
        } catch (error) {
            console.error('Error loading kecamatan by desa:', error);
            setKecamatanData(null);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Handle number conversion for coordinates
        let processedValue = value;
        if (name === 'latitude' || name === 'longitude') {
            // Keep the raw string value but ensure it's a valid number format
            processedValue = value;
        }
        
        setFormData({ ...formData, [name]: processedValue });
        
        // When desa is changed, auto-populate kecamatan
        if (name === 'desa_id' && value) {
            loadKecamatanByDesa(value);
        } else if (name === 'desa_id' && !value) {
            // Reset kecamatan when desa is cleared
            setKecamatanData(null);
            setFormData(prev => ({ ...prev, kecamatan_id: '' }));
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('Silakan pilih file foto rumah terlebih dahulu.');
            return;
        }

        setLoading(true);

        try {
            // Validate profile.id with detailed logging
            console.log('🔍 Checking profile:', profile);
            console.log('🔍 Profile ID:', profile?.id);
            console.log('🔍 Profile ID type:', typeof profile?.id);
            
            if (!profile || !profile.id) {
                console.error('❌ Profile validation failed:', { profile, id: profile?.id });
                alert('Error: User profile tidak ditemukan. Silakan logout dan login kembali.');
                setLoading(false);
                return;
            }

            console.log('✅ Profile validation passed, user_id:', profile.id);

            // Validate file first
            const validation = storageService.validateFile(file);
            if (!validation.valid) {
                alert(validation.error);
                setLoading(false);
                return;
            }

            // Upload foto to Supabase Storage
            const fotoUrl = await storageService.uploadFotoRumah(file);

            // Create pelanggan with uploaded foto URL
            const pelangganData = {
                ...formData,
                user_id: profile.id, // From AuthContext
                foto_rumah_url: fotoUrl,
                // Convert numeric fields
                jumlah_jiwa: formData.jumlah_jiwa ? parseInt(formData.jumlah_jiwa) : null,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            };

            await pelangganService.create(pelangganData);

            alert('Data Berhasil Disimpan!');
            
            // Reset form
            setFormData({
                id_pelanggan: '',
                nama_pelanggan: '',
                no_telpon: '',
                alamat: '',
                jumlah_jiwa: '',
                jenis_meter: '',
                tanggal_pemasangan: '',
                longitude: '',
                latitude: '',
                cabang_id: '',
                desa_id: '',
                kecamatan_id: '',
                rayon_id: '',
                golongan_id: '',
                kelompok_id: '',
                distribusi: '',
                sumber: '',
                kondisi_meter: '',
                kondisi_lingkungan: '',
                kategori: '',
                status_pelanggan: 'aktif',
                stand_meter: '',
                nomer_water_meter: '',
                merk_meter: '',
                ukuran_water_meter: '',
                kondisi_meter: '',
            });

            setFile(null);
            setKecamatanData(null);
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleLocationSelect = (location) => {
        setFormData(prevData => ({
            ...prevData,
            latitude: location.latitude,
            longitude: location.longitude,
            alamat: location.alamat
        }));
    };

    const handleAddressSearch = async () => {
        if (!formData.alamat) {
            alert('Silakan masukkan alamat terlebih dahulu.');
            return;
        }
        setIsSearching(true);
        try {
            // Gunakan encodeURIComponent untuk menangani spasi dan karakter khusus
            const query = encodeURIComponent(formData.alamat);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                setFormData(prevData => ({
                    ...prevData,
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lon),
                    alamat: display_name, // Update alamat dengan hasil dari API agar lebih standar
                }));
            } else {
                alert('Alamat tidak ditemukan. Coba gunakan kata kunci yang lebih spesifik.');
            }
        } catch (error) {
            console.error('Gagal mencari alamat:', error);
            alert('Terjadi kesalahan saat mencari alamat.');
        } finally {
            setIsSearching(false);
        }
    };

    const validateCoordinates = async () => {
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        
        if (isNaN(lat) || isNaN(lng)) {
            alert('Koordinat tidak valid. Pastikan format angka sudah benar.');
            return false;
        }
        
        if (lat < -90 || lat > 90) {
            alert('Latitude harus antara -90 dan 90 derajat.');
            return false;
        }
        
        if (lng < -180 || lng > 180) {
            alert('Longitude harus antara -180 dan 180 derajat.');
            return false;
        }
        
        setIsValidating(true);
        
        // Jika koordinat valid, lakukan reverse geocoding untuk mendapatkan alamat
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            
            if (data && data.display_name) {
                // Update alamat dengan hasil reverse geocoding
                setFormData(prevData => ({
                    ...prevData,
                    alamat: data.display_name
                }));
                
                alert(`Koordinat valid dan alamat berhasil diperbarui!\n\nLatitude: ${lat}\nLongitude: ${lng}\n\nAlamat: ${data.display_name}`);
            } else {
                alert(`Koordinat valid!\n\nLatitude: ${lat}\nLongitude: ${lng}\n\nNamun alamat tidak dapat ditemukan untuk koordinat ini.`);
            }
        } catch (error) {
            console.error('Error fetching address:', error);
            alert(`Koordinat valid!\n\nLatitude: ${lat}\nLongitude: ${lng}\n\nNamun terjadi kesalahan saat mengambil alamat.`);
        } finally {
            setIsValidating(false);
        }
        
        return true;
    };

    return (
        <>
            <div className="bg-gray-200 pt-24 px-8 sm:px-16">
                <Navbar />

                {/* Form Section */}
                <div className="pt-16 pb-8">
                    <h1 className="font-semibold text-2xl">Input Data Pelanggan Lama</h1>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-gray-300 shadow-lg">
                    <form onSubmit={handleSubmit} className="flex flex-col justify-center w-full">
                        <div className="sm:flex gap-4 mb-4">
                            <div className="w-full">
                                <h1 className='mb-2'>No SL</h1>
                                <input
                                    type="text"
                                    name="id_pelanggan"
                                    value={formData.id_pelanggan}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    placeholder='No SL'
                                    required
                                />
                            </div>
                            <div className="w-full">
                                <h1 className='mb-2'>Nama Pelanggan</h1>
                                <input
                                    type="text"
                                    name="nama_pelanggan"
                                    value={formData.nama_pelanggan}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    placeholder='Nama'
                                    required
                                />
                            </div>
                            <div className="w-full">
                                <h1 className='mb-2'>No. Telpon</h1>
                                <input
                                    type="text"
                                    name="no_telpon"
                                    value={formData.no_telpon}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    placeholder='08xxxxxxxxxx'
                                    required
                                />
                            </div>
                        </div>
                        <MapPicker
                            onLocationSelect={handleLocationSelect}
                            latitude={formData.latitude}
                            longitude={formData.longitude}
                        />
                        <h1 className='mb-2'>Alamat</h1>
                        <textarea
                            name="alamat"
                            id="alamat"
                            value={formData.alamat}
                            onChange={handleChange}
                            placeholder='Ketik alamat lalu, klik cari alamat'
                            className='border w-full border-blue-400 px-4 py-2 rounded-lg h-40 shadow-md mb-4'
                            required
                        ></textarea>
                        <button
                            type="button"
                            onClick={handleAddressSearch}
                            disabled={isSearching}
                            className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 mb-8 px-4 rounded-lg shadow-md disabled:bg-gray-400"
                        >
                            {isSearching ? 'Mencari...' : 'Cari Alamat'}
                        </button>
                        <div className="sm:flex gap-4 mb-6">
                            
                            <div className="w-full ">
                                <h1 className='mb-2'>Cabang</h1>
                                <select
                                    name="cabang_id"
                                    value={formData.cabang_id}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    required
                                >
                                    <option value="">Pilih Cabang...</option>
                                    {cabangList.map(cabang => (
                                        <option key={cabang.id} value={cabang.id}>
                                            {cabang.kode_unit} - {cabang.nama_unit}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full ">
                                <h1 className='mb-2'>Desa</h1>
                                <select
                                    name="desa_id"
                                    value={formData.desa_id}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    required
                                >
                                    <option value="">Pilih Desa...</option>
                                    {desaList.map(desa => (
                                        <option key={desa.id} value={desa.id}>
                                            {desa.nama_desa}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full ">
                                <h1 className='mb-2'>Kecamatan</h1>
                                <input
                                    type="text"
                                    value={kecamatanData ? kecamatanData.nama_kecamatan : 'Pilih desa terlebih dahulu'}
                                    className='border w-full border-gray-300 bg-gray-100 px-4 py-2 rounded-lg'
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
                        <div className="sm:flex gap-4 mb-4">
                            <div className="w-full ">
                                <h1 className='mb-2'>Rayon *</h1>
                                <select
                                    name="rayon_id"
                                    value={formData.rayon_id}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    required
                                >
                                    <option value="">Pilih Rayon...</option>
                                    {rayonList.map(rayon => (
                                        <option key={rayon.id} value={rayon.id}>
                                            {rayon.nama_rayon} ({rayon.kode_rayon})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full ">
                                <h1 className='mb-2'>Golongan *</h1>
                                <select
                                    name="golongan_id"
                                    value={formData.golongan_id}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    required
                                >
                                    <option value="">Pilih Golongan...</option>
                                    {golonganList.map(golongan => (
                                        <option key={golongan.id} value={golongan.id}>
                                            {golongan.kode_golongan} - {golongan.nama_golongan}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full ">
                                <h1 className='mb-2'>Kelompok *</h1>
                                <select
                                    name="kelompok_id"
                                    value={formData.kelompok_id}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    required
                                >
                                    <option value="">Pilih Kelompok...</option>
                                    {kelompokList.map(kelompok => (
                                        <option key={kelompok.id} value={kelompok.id}>
                                            {kelompok.kode_kelompok} - {kelompok.nama_kelompok}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Additional Fields Section */}
                        <h1 className="mb-2">Informasi Tambahan</h1>
                        <div className="sm:flex gap-4 mb-4 p-4 border border-gray-200 shadow-sm rounded-lg">
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Jumlah Jiwa</h1>
                                <input
                                    type="text"
                                    name="jumlah_jiwa"
                                    value={formData.jumlah_jiwa}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    placeholder=''
                                    required />
                            </div>
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Status Layanan *</h1>
                                <select
                                    name="jenis_meter"
                                    value={formData.jenis_meter}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    required
                                >
                                    <option value="">Pilih Status Layanan</option>
                                    <option value="bisa di layani">Bisa Di Layani</option>
                                    <option value="daftar tunggu">Daftar Tunggu</option>
                                    <option value="tidak bisa dilayani">Tidak Bisa Dilayani</option>
                                </select>
                            </div>
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Tanggal Pemasangan</h1>
                                <input
                                    type="date"
                                    name="tanggal_pemasangan"
                                    value={formData.tanggal_pemasangan}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    required
                                />
                            </div>
                        </div>
                        <div className="sm:flex gap-4 mb-4 p-4 border border-gray-200 shadow-sm rounded-lg">
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Distribusi</h1>
                                <textarea
                                    name="distribusi"
                                    value={formData.distribusi}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    rows="3"
                                    placeholder="Masukkan informasi distribusi..."
                                />
                            </div>
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Sumber</h1>
                                <textarea
                                    name="sumber"
                                    value={formData.sumber}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    rows="3"
                                    placeholder="Masukkan informasi sumber..."
                                />
                            </div>
                        </div>
                        
                        <div className="sm:flex gap-4 mb-4 p-4 border border-gray-200 shadow-sm rounded-lg">
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Kondisi Meter</h1>
                                <textarea
                                    name="kondisi_meter"
                                    value={formData.kondisi_meter}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    rows="3"
                                    placeholder="Masukkan kondisi meter..."
                                />
                            </div>
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Kondisi Lingkungan</h1>
                                <textarea
                                    name="kondisi_lingkungan"
                                    value={formData.kondisi_lingkungan}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    rows="3"
                                    placeholder="Masukkan kondisi lingkungan..."
                                />
                            </div>
                        </div>

                        {/* Water Meter Information */}
                        <h1 className="mb-2 font-semibold text-lg">Informasi Water Meter</h1>
                        <div className="sm:flex gap-4 mb-4 p-4 border border-gray-200 shadow-sm rounded-lg">
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Stand Meter</h1>
                                <input
                                    type="text"
                                    name="stand_meter"
                                    value={formData.stand_meter}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    placeholder="Masukkan stand meter..."
                                />
                            </div>
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Nomer Water Meter</h1>
                                <input
                                    type="text"
                                    name="nomer_water_meter"
                                    value={formData.nomer_water_meter}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    placeholder="Masukkan nomer water meter..."
                                />
                            </div>
                        </div>

                        <div className="sm:flex gap-4 mb-4 p-4 border border-gray-200 shadow-sm rounded-lg">
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Merk Meter</h1>
                                <select
                                    name="merk_meter"
                                    value={formData.merk_meter}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                >
                                    <option value="">Pilih Merk Meter</option>
                                    <option value="Aktari">Aktari</option>
                                    <option value="Onda">Onda</option>
                                    <option value="Linflow">Linflow</option>
                                    <option value="Pameterindo">Pameterindo</option>
                                    <option value="Barindo">Barindo</option>
                                    <option value="Itron">Itron</option>
                                    <option value="Century">Century</option>
                                    <option value="IVZ">IVZ</option>
                                    <option value="WESTCHAUST">WESTCHAUST</option>
                                    <option value="AIR INDO">AIR INDO</option>
                                    <option value="NB">NB</option>
                                    <option value="AMICO">AMICO</option>
                                    <option value="RVT">RVT</option>
                                    <option value="PUJI">PUJI</option>
                                    <option value="LOUIS VICTOR">LOUIS VICTOR</option>
                                    <option value="ISOA">ISOA</option>
                                </select>
                            </div>
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Ukuran Water Meter</h1>
                                <select
                                    name="ukuran_water_meter"
                                    value={formData.ukuran_water_meter}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                >
                                    <option value="">Pilih Ukuran</option>
                                    <option value="1/2 inch">1/2 inch</option>
                                    <option value="3/4 inch">3/4 inch</option>
                                    <option value="1 inch">1 inch</option>
                                    <option value="2 inch">2 inch</option>
                                </select>
                            </div>
                        </div>

                        <div className="sm:flex gap-4 mb-4 p-4 border border-gray-200 shadow-sm rounded-lg">
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Kondisi Water Meter</h1>
                                <textarea
                                    name="kondisi_meter"
                                    value={formData.kondisi_meter}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    rows="3"
                                    placeholder="Masukkan kondisi water meter..."
                                />
                            </div>
                        </div>

                        <div className="sm:flex gap-4 mb-4 p-4 border border-gray-200 shadow-sm rounded-lg">
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Kategori *</h1>
                                <select
                                    name="kategori"
                                    value={formData.kategori}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    required
                                >
                                    <option value="">Pilih Kategori...</option>
                                    <option value="jadwal harian">Jadwal Harian</option>
                                    <option value="jadwal mingguan">Jadwal Mingguan</option>
                                </select>
                            </div>
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Status *</h1>
                                <select
                                    name="status_pelanggan"
                                    value={formData.status_pelanggan}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    required
                                >
                                    <option value="aktif">Aktif</option>
                                    <option value="tidak aktif">Tidak Aktif</option>
                                    <option value="bongkar">Bongkar</option>
                                    <option value="bongkar adm">Bongkar ADM</option>
                                    <option value="daftar pemasangan">Daftar Pemasangan</option>
                                    <option value="penonaktifan">Penonaktifan</option>
                                    <option value="penyambungan kembali">Penyambungan Kembali</option>
                                    <option value="siap sambung">Siap Sambung</option>
                                </select>
                            </div>
                        </div>

                        <h1 className="mb-2">Lokasi Pemasangan</h1>
                        <p className="text-sm text-gray-600 mb-2">
                            Anda dapat mengisi koordinat secara manual atau klik pada peta di atas untuk memilih lokasi.
                            Marker akan bergerak otomatis saat Anda mengubah nilai koordinat.
                            <br />
                            <span className="font-medium text-green-600">
                                Tip: Setelah mengisi koordinat manual, klik "Validasi Koordinat & Cari Alamat" untuk mengisi alamat otomatis.
                            </span>
                        </p>
                        <div className="sm:flex gap-4 mb-4 p-4 border border-gray-200 shadow-sm rounded-lg">
                            <div className="w-full shadow-md p-4 rounded-lg">
                                <h1 className='mb-2'>Longitude</h1>
                                <input
                                    type="number"
                                    step="any"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    placeholder='Contoh: 107.6098'
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Format: angka desimal (misal: 107.6098)</p>
                            </div>
                            <div className="w-full shadow-md p-4 rounded-lg">
                                <h1 className='mb-2'>Latitude</h1>
                                <input
                                    type="number"
                                    step="any"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    placeholder='Contoh: -6.9175'
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Format: angka desimal (misal: -6.9175)</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={validateCoordinates}
                            disabled={isValidating || !formData.latitude || !formData.longitude}
                            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg shadow-md mb-4 flex items-center gap-2 justify-center"
                        >
                            {isValidating ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Memvalidasi & Mencari Alamat...
                                </>
                            ) : (
                                <>
                                    <FaMapMarkerAlt />
                                    Validasi Koordinat & Cari Alamat
                                </>
                            )}
                        </button>
                        <div className="w-full mb-8">
                            <h1 className="mb-2">Foto Rumah</h1>
                            <div className="flex items-center gap-4 border rounded-lg border-blue-400">
                                <input
                                    type="file"
                                    name="file"
                                    id="file"
                                    className='hidden'
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    required
                                />
                                <label htmlFor="file" className='cursor-pointer bg-blue-400 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-500 transition text-xs sm:text-base'>
                                    Pilih File
                                </label>
                                <span id="file-name" className="text-gray-500 text-xs sm:text-base">
                                    {file ? file.name : 'Belum ada file yang dipilih'}
                                </span>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className='w-full bg-blue-400 font-bold py-2 text-white flex justify-center items-center gap-2 rounded-lg cursor-pointer'>
                            <FaFloppyDisk /> <span>{loading ? 'Menyimpan...' : 'Simpan'}</span>
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Form
