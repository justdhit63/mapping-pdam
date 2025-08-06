import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { FaFloppyDisk } from 'react-icons/fa6';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

const EditForm = () => {
    const { id } = useParams();

    const [formData, setFormData] = useState({
        id_pelanggan: '',
        nama_pelanggan: '',
        no_telpon: '',
        alamat: '',
        jumlah_jiwa: '',
        jenis_meter: '',
        tanggal_pemasanga: '',
        longtitude: '',
        latitude: '',
    });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [newFile, setNewFile] = useState(null);

    useEffect(() => {
        const fetchPelangganData = async () => {
            const { data, error } = await supabase
                .from('pelanggan')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error Fetching Data: ', error);
                navigate('/daftar-pelanggan');
            }

            if (data) setFormData(data);
        }

        fetchPelangganData();
    }, [id, navigate])


    const handleChange = (e) => {
        const { name, value, type } = e.target;

        // Tentukan field mana saja yang harusnya berupa angka
        const numericFields = ['jumlah_jiwa', 'longtitude', 'latitude'];

        // Jika field termasuk field numerik, konversi nilainya
        let finalValue = value;
        if (type === 'number' && numericFields.includes(name)) {
            // parseFloat akan mengonversi string ke angka desimal.
            // Jika string kosong, set nilainya ke null agar database tidak error.
            finalValue = value === '' ? null : parseFloat(value);
        }

        setFormData(prevState => ({
            ...prevState,
            [name]: finalValue,
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setNewFile(e.target.files[0]);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            let fotoUrl = formData.foto_rumah_url; // Defaultnya adalah URL foto lama
    
            // Langkah 1: Cek apakah ada file baru yang diupload
            if (newFile) {
                // Langkah 1a: Upload file baru
                const newFilePath = `public/${Date.now()}_${newFile.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('foto-rumah')
                    .upload(newFilePath, newFile);
    
                if (uploadError) throw uploadError;
    
                // Langkah 1b: Dapatkan URL publik file baru
                const { data: urlData } = supabase.storage
                    .from('foto-rumah')
                    .getPublicUrl(newFilePath);
                fotoUrl = urlData.publicUrl; // Simpan URL baru untuk diupdate ke database
    
                // Langkah 1c (Penting): Hapus file lama dari storage jika ada
                if (formData.foto_rumah_url) {
                    const oldFilePath = formData.foto_rumah_url.split('/foto-rumah/')[1];
                    const { error: removeError } = await supabase.storage
                        .from('foto-rumah')
                        .remove([oldFilePath]);
    
                    if (removeError) {
                        console.error("Gagal menghapus foto lama:", removeError);
                    }
                }
            }
    
            // Langkah 2: Persiapkan data untuk diupdate ke tabel 'pelanggan'
            const dataToUpdate = {
                ...formData,
                foto_rumah_url: fotoUrl // Gunakan URL baru jika ada, atau URL lama jika tidak ada file baru
            };
    
            // Hapus properti yang tidak perlu dikirim ke fungsi update
            delete dataToUpdate.id;
            delete dataToUpdate.created_at;
    
            // Langkah 3: Lakukan update ke database
            const { error: updateError } = await supabase
                .from('pelanggan')
                .update(dataToUpdate)
                .eq('id', id);
    
            if (updateError) throw updateError;
    
            alert('Data pelanggan berhasil diperbarui!');
            navigate('/daftar-pelanggan');
    
        } catch (error) {
            alert('Error memperbarui data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="bg-gray-200 py-16 px-10">
                <Navbar />

                {/* Form Section */}
                <div className="bg-white p-8">
                    <form onSubmit={handleUpdate} className="flex flex-col justify-center w-full">
                        <div className="sm:flex gap-4 mb-4">
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>No. ID Pelanggan</h1>
                                <input
                                    type="text"
                                    name="id_pelanggan"
                                    value={formData.id_pelanggan}
                                    onChange={handleChange}
                                    className='border w-1/2 lg:w-3/4 border-blue-400 px-4 py-2 rounded-l-lg'
                                    placeholder='ID'
                                    required
                                />
                                <button className='bg-blue-400 w-1/2 lg:w-1/4 border border-blue-400 py-2 px-4 rounded-r-lg text-white'>Generate</button>
                            </div>
                            <div className="w-full shadow-md">
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
                            <div className="w-full shadow-md">
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
                        <h1 className='mb-2'>Alamat</h1>
                        <textarea
                            name="alamat"
                            id="alamat"
                            value={formData.alamat}
                            onChange={handleChange}
                            placeholder='Alamat'
                            className='border w-full border-blue-400 px-4 py-2 rounded-lg h-40 shadow-md mb-4'
                            required
                        ></textarea>
                        <div className="sm:flex gap-4 mb-4">
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Jumlah Jiwa</h1>
                                <input
                                    type="number"
                                    name="jumlah_jiwa"
                                    value={formData.jumlah_jiwa}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    placeholder=''
                                    required />
                            </div>
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Jenis Meter Air</h1>
                                <input
                                    type="text"
                                    name="jenis_meter"
                                    value={formData.jenis_meter}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    placeholder=''
                                    required
                                />
                            </div>
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Tanggal Pemasangan</h1>
                                <input
                                    type="date"
                                    name="tanggal_pemasanga"
                                    value={formData.tanggal_pemasanga}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    required
                                />
                            </div>
                        </div>
                        <h1 className="mb-2">Lokasi Pemasangan</h1>
                        <div className="sm:flex gap-4 mb-4 p-4 border border-gray-200 shadow-sm rounded-lg">
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Longtitude</h1>
                                <input
                                    type="number"
                                    step='any'
                                    name="longtitude"
                                    value={formData.longtitude}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    placeholder=''
                                    required
                                />
                            </div>
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Latitude</h1>
                                <input
                                    type="text"
                                    step='any'
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    className='border w-full border-blue-400 px-4 py-2 rounded-lg'
                                    placeholder=''
                                    required
                                />
                            </div>
                        </div>
                        <div className="w-full mb-8">
                            <h1 className="mb-2 font-semibold">Foto Rumah</h1>
                            <div className="p-4 border border-gray-200 shadow-sm rounded-lg mb-8">
                                <h2 className="mb-2 text-sm text-gray-600">Foto Saat Ini:</h2>
                                {formData.foto_rumah_url ? (
                                    <img src={formData.foto_rumah_url} alt="Foto Rumah Pelanggan" className="w-40 h-40 object-cover rounded-md mb-4" />
                                ) : (
                                    <p className="text-gray-500 mb-4">Tidak ada foto.</p>
                                )}

                                <h2 className="mb-2 text-sm text-gray-600">Ganti Foto (Opsional):</h2>
                                <div className="flex items-center gap-4 border rounded-lg border-blue-400">
                                    <input
                                        type="file"
                                        name="file"
                                        id="file"
                                        className='hidden'
                                        onChange={handleFileChange}
                                        accept="image/*"
                                    />
                                    <label htmlFor="file" className='cursor-pointer bg-blue-400 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-500 transition text-xs sm:text-base'>
                                        Pilih File Baru
                                    </label>
                                    <span id="file-name" className="text-gray-500 text-xs sm:text-base">
                                        {newFile ? newFile.name : 'Belum ada file baru yang dipilih'}
                                    </span>
                                </div>
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

export default EditForm
