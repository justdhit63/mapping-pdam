// src/pages/EditForm.jsx

import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { FaFloppyDisk } from 'react-icons/fa6';
import { pelangganService, cabangService, desaService, kecamatanService, rayonService, golonganService, kelompokService } from '../services/supabaseServices.js';
import { storageService } from '../services/storageService.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import MapPicker from '../components/MapPicker';

const EditForm = () => {
    // Mengambil ID pelanggan dari parameter URL
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, profile } = useAuth();

    const handleBack = () => {
        if (profile?.role === 'admin') {
            navigate('/admin');
            setTimeout(() => {
                const dataTab = document.querySelector('[data-tab="data"]');
                if (dataTab) dataTab.click();
            }, 100);
        } else {
            navigate('/daftar-pelanggan');
        }
    };

    // State untuk menampung semua data dari form
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
        foto_rumah_url: '',
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
        kondisi_water_meter: '',
    });

    // State untuk manajemen UI
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [newFile, setNewFile] = useState(null);
    const [cabangList, setCabangList] = useState([]);
    const [desaList, setDesaList] = useState([]);
    const [rayonList, setRayonList] = useState([]);
    const [golonganList, setGolonganList] = useState([]);
    const [kelompokList, setKelompokList] = useState([]);
    const [kecamatanData, setKecamatanData] = useState(null);

    // useEffect untuk mengambil data pelanggan saat halaman pertama kali dimuat
    useEffect(() => {
        const fetchPelangganData = async () => {
            setLoading(true);
            try {
                const data = await pelangganService.getById(parseInt(id));
                
                // Sanitize numeric fields
                const sanitizedData = {
                    ...data,
                    longitude: data.longitude === null || data.longitude === undefined || data.longitude === 99.999999 ? '' : parseFloat(data.longitude),
                    latitude: data.latitude === null || data.latitude === undefined ? '' : parseFloat(data.latitude),
                    jumlah_jiwa: data.jumlah_jiwa === null || data.jumlah_jiwa === undefined ? '' : data.jumlah_jiwa,
                    // Ensure tanggal_pemasangan is in correct format for date input
                    tanggal_pemasangan: data.tanggal_pemasangan ? data.tanggal_pemasangan.split('T')[0] : '',
                    cabang_id: data.cabang_id || '',
                    desa_id: data.desa_id || '',
                    kecamatan_id: data.kecamatan_id || '',
                    rayon_id: data.rayon_id || '',
                    golongan_id: data.golongan_id || '',
                    kelompok_id: data.kelompok_id || '',
                };
                
                setFormData(sanitizedData);
            } catch (error) {
                console.error('Error Fetching Data: ', error);
                alert('Gagal memuat data pelanggan.');
                handleBack();
            } finally {
                setLoading(false);
            }
        };

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
            if (!desaId) return;
            try {
                const { data, error } = await getKecamatanByDesaId(desaId);
                if (error) {
                    console.error('Error loading kecamatan:', error);
                    setKecamatanData(null);
                } else {
                    setKecamatanData(data);
                }
            } catch (error) {
                console.error('Error loading kecamatan by desa:', error);
                setKecamatanData(null);
            }
        };

        fetchPelangganData();
        loadCabangList();
        loadDesaList();
        loadRayonList();
        loadGolonganList();
        loadKelompokList();
    }, [id, navigate]);

    // Load kecamatan when pelanggan data is loaded
    useEffect(() => {
        if (formData.desa_id) {
            const loadKecamatanByDesa = async (desaId) => {
                try {
                    const data = await kecamatanService.getByDesaId(desaId);
                    setKecamatanData(data);
                } catch (error) {
                    console.error('Error loading kecamatan by desa:', error);
                    setKecamatanData(null);
                }
            };
            loadKecamatanByDesa(formData.desa_id);
        }
    }, [formData.desa_id]);

    // Handler untuk perubahan pada input teks, tanggal, dan angka
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const numericFields = ['jumlah_jiwa', 'longitude', 'latitude'];
        let finalValue = value;

        if (type === 'number' && numericFields.includes(name)) {
            if (value === '' || value === null || value === undefined) {
                finalValue = '';
            } else {
                const parsed = parseFloat(value);
                finalValue = isNaN(parsed) ? '' : parsed;
            }
        }
        
        setFormData(prevState => ({ ...prevState, [name]: finalValue }));
        
        // When desa is changed, auto-populate kecamatan
        if (name === 'desa_id' && value) {
            loadKecamatanByDesa(value);
        } else if (name === 'desa_id' && !value) {
            // Reset kecamatan when desa is cleared
            setKecamatanData(null);
            setFormData(prev => ({ ...prev, kecamatan_id: '' }));
        }
    };

    const loadKecamatanByDesa = async (desaId) => {
        try {
            const { data, error } = await getKecamatanByDesaId(desaId);
            if (error) {
                console.error('Error loading kecamatan:', error);
                setKecamatanData(null);
            } else {
                setKecamatanData(data);
                // Auto-populate kecamatan_id in form
                setFormData(prev => ({ ...prev, kecamatan_id: data.id }));
            }
        } catch (error) {
            console.error('Error loading kecamatan by desa:', error);
            setKecamatanData(null);
        }
    };

    // Handler untuk perubahan pada input file foto
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setNewFile(e.target.files[0]);
        }
    };

    // Handler untuk menerima data dari komponen MapPicker saat peta diklik
    const handleLocationSelect = (location) => {
        console.log('Location selected from map:', location);
        setFormData(prevData => ({ 
            ...prevData, 
            latitude: parseFloat(location.latitude), 
            longitude: parseFloat(location.longitude), 
            alamat: location.alamat 
        }));
    };

    // Handler untuk mencari koordinat berdasarkan alamat yang diketik
    const handleAddressSearch = async () => {
        if (!formData.alamat) return alert('Silakan masukkan alamat terlebih dahulu.');
        setIsSearching(true);
        try {
            const query = encodeURIComponent(formData.alamat);
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                setFormData(prevData => ({ ...prevData, latitude: parseFloat(lat), longitude: parseFloat(lon), alamat: display_name }));
            } else {
                alert('Alamat tidak ditemukan.');
            }
        } catch (error) {
            alert('Terjadi kesalahan saat mencari alamat: ' + error.message);
        } finally {
            setIsSearching(false);
        }
    };

    // Handler utama saat form di-submit untuk melakukan UPDATE
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let updatedFotoUrl = formData.foto_rumah_url;

            // Handle foto update if new file exists
            if (newFile) {
                const validation = storageService.validateFile(newFile);
                if (!validation.valid) {
                    throw new Error(validation.error);
                }
                // Update foto (will delete old and upload new)
                updatedFotoUrl = await storageService.updateFoto(newFile, formData.foto_rumah_url);
            }

            // Prepare pelanggan data
            const pelangganData = {
                id_pelanggan: formData.id_pelanggan,
                nama_pelanggan: formData.nama_pelanggan,
                no_telpon: formData.no_telpon,
                alamat: formData.alamat,
                jumlah_jiwa: formData.jumlah_jiwa ? parseInt(formData.jumlah_jiwa) : null,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                status_layanan: formData.status_layanan,
                cabang_id: formData.cabang_id ? parseInt(formData.cabang_id) : null,
                kecamatan_id: formData.kecamatan_id ? parseInt(formData.kecamatan_id) : null,
                desa_id: formData.desa_id ? parseInt(formData.desa_id) : null,
                rayon_id: formData.rayon_id ? parseInt(formData.rayon_id) : null,
                golongan_id: formData.golongan_id ? parseInt(formData.golongan_id) : null,
                kelompok_id: formData.kelompok_id ? parseInt(formData.kelompok_id) : null,
                foto_rumah_url: updatedFotoUrl
            };

            // Update pelanggan via Supabase
            await pelangganService.update(parseInt(id), pelangganData);

            alert('Data pelanggan berhasil diperbarui!');
            handleBack();

        } catch (error) {
            console.error('Error updating pelanggan:', error);
            alert('Error memperbarui data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="bg-gray-200 pt-24 px-8 sm:px-16">
                <Navbar />
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-6">Edit Data Pelanggan</h1>
                    {loading && !formData.id_pelanggan ? <p>Memuat data...</p> : (
                        <form onSubmit={handleUpdate} className="flex flex-col justify-center w-full">
                            <div className="sm:flex gap-4 mb-4">
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>No. ID Pelanggan</h1>
                                    <input type="text" name="id_pelanggan" value={formData.id_pelanggan || ''} onChange={handleChange} className='border w-full border-gray-300 bg-gray-100 px-4 py-2 rounded-lg' readOnly />
                                </div>
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>Nama Pelanggan</h1>
                                    <input type="text" name="nama_pelanggan" value={formData.nama_pelanggan || ''} onChange={handleChange} className='border w-full border-blue-400 px-4 py-2 rounded-lg' required />
                                </div>
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>No. Telpon</h1>
                                    <input type="text" name="no_telpon" value={formData.no_telpon || ''} onChange={handleChange} className='border w-full border-blue-400 px-4 py-2 rounded-lg' required />
                                </div>
                            </div>
                            
                            <MapPicker onLocationSelect={handleLocationSelect} latitude={formData.latitude} longitude={formData.longitude} />
                            
                            <h1 className='mb-2'>Alamat</h1>
                            <div className="flex items-start gap-2 mb-4">
                                <textarea name="alamat" value={formData.alamat || ''} onChange={handleChange} placeholder='Ketik alamat lalu, klik cari alamat' className='border w-full border-blue-400 px-4 py-2 rounded-lg h-24 shadow-md' required></textarea>
                                <button type="button" onClick={handleAddressSearch} disabled={isSearching} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md h-24 disabled:bg-gray-400">
                                    {isSearching ? 'Mencari...' : 'Cari Alamat'}
                                </button>
                            </div>

                            <div className="sm:flex gap-4 mb-4">
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>Jumlah Jiwa</h1>
                                    <input type="number" name="jumlah_jiwa" value={formData.jumlah_jiwa || ''} onChange={handleChange} className='border w-full border-blue-400 px-4 py-2 rounded-lg' required />
                                </div>
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>Status Layanan</h1>
                                    <select 
                                        name="jenis_meter" 
                                        value={formData.jenis_meter || ''} 
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
                                    <input type="date" name="tanggal_pemasangan" value={formData.tanggal_pemasangan || ''} onChange={handleChange} className='border w-full border-blue-400 px-4 py-2 rounded-lg' required />
                                </div>
                            </div>

                            <div className="sm:flex gap-4 mb-4">
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>Cabang</h1>
                                    <select
                                        name="cabang_id"
                                        value={formData.cabang_id || ''}
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
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>Desa</h1>
                                    <select
                                        name="desa_id"
                                        value={formData.desa_id || ''}
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
                                <div className="w-full shadow-md">
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
                                        value={formData.kecamatan_id || ''}
                                    />
                                </div>
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>Rayon *</h1>
                                    <select
                                        name="rayon_id"
                                        value={formData.rayon_id || ''}
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
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>Golongan *</h1>
                                    <select
                                        name="golongan_id"
                                        value={formData.golongan_id || ''}
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
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>Kelompok *</h1>
                                    <select
                                        name="kelompok_id"
                                        value={formData.kelompok_id || ''}
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
                                    <h1 className='mb-2'>Distribusi</h1>
                                    <textarea
                                        name="distribusi"
                                        value={formData.distribusi || ''}
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
                                        value={formData.sumber || ''}
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
                                        value={formData.kondisi_meter || ''}
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
                                        value={formData.kondisi_lingkungan || ''}
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
                                        value={formData.stand_meter || ''}
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
                                        value={formData.nomer_water_meter || ''}
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
                                        value={formData.merk_meter || ''}
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
                                        value={formData.ukuran_water_meter || ''}
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
                                        name="kondisi_water_meter"
                                        value={formData.kondisi_water_meter || ''}
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
                                        value={formData.kategori || ''}
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
                                        value={formData.status_pelanggan || 'aktif'}
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

                            <h1 className="mb-2">Lokasi Pemasangan (Otomatis Terisi)</h1>
                            <div className="sm:flex gap-4 mb-4 p-4 border border-gray-200 shadow-sm rounded-lg">
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>longitude</h1>
                                    <input type="number" step='any' name="longitude" value={formData.longitude || ''} onChange={handleChange} className='border w-full border-gray-300 bg-gray-100 px-4 py-2 rounded-lg' readOnly required />
                                </div>
                                <div className="w-full shadow-md">
                                    <h1 className='mb-2'>Latitude</h1>
                                    <input type="number" step='any' name="latitude" value={formData.latitude || ''} onChange={handleChange} className='border w-full border-gray-300 bg-gray-100 px-4 py-2 rounded-lg' readOnly required />
                                </div>
                            </div>

                            <div className="w-full mb-8">
                                <h1 className="mb-2 font-semibold">Foto Rumah</h1>
                                <div className="p-4 border border-gray-200 shadow-sm rounded-lg">
                                    <h2 className="mb-2 text-sm text-gray-600">Foto Saat Ini:</h2>
                                    {formData.foto_rumah_url ? (<img src={`http://localhost:3001${formData.foto_rumah_url}`} alt="Foto Rumah Pelanggan" className="w-40 h-40 object-cover rounded-md mb-4" />) : (<p className="text-gray-500 mb-4">Tidak ada foto.</p>)}
                                    <h2 className="mb-2 text-sm text-gray-600">Ganti Foto (Opsional):</h2>
                                    <div className="flex items-center gap-4 border rounded-lg border-blue-400">
                                        <input type="file" name="file" id="file" className='hidden' onChange={handleFileChange} accept="image/*" />
                                        <label htmlFor="file" className='cursor-pointer bg-blue-400 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-500 transition text-xs sm:text-base'>Pilih File Baru</label>
                                        <span className="text-gray-500 text-xs sm:text-base">{newFile ? newFile.name : 'Belum ada file baru yang dipilih'}</span>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className='w-full bg-yellow-500 hover:bg-yellow-600 font-bold py-2 px-4 text-white flex justify-center items-center gap-2 rounded-lg cursor-pointer disabled:bg-gray-400'>
                                <FaFloppyDisk /> <span>{loading ? 'Menyimpan...' : 'Update Data'}</span>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};

export default EditForm;