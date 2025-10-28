// src/pages/List.jsx

import React, { useEffect, useState, useCallback } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import { getAllPelanggan, deletePelanggan, updatePelanggan } from '../services/pelangganService.js';
import { Link } from 'react-router-dom';

const List = () => {
    // State untuk menyimpan data asli dari Supabase
    const [allPelanggan, setAllPelanggan] = useState([]);
    // State untuk data yang akan ditampilkan (hasil filter)
    const [filteredPelanggan, setFilteredPelanggan] = useState([]);
    // State untuk loading
    const [loading, setLoading] = useState(true);
    // State untuk menampung input dari kotak pencarian
    const [searchTerm, setSearchTerm] = useState('');

    // Fungsi untuk mengambil semua data, dibungkus useCallback untuk efisiensi
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        const { data, error } = await getAllPelanggan();

        if (error) {
            console.error('Error Fetching Data: ', error);
        } else {
            setAllPelanggan(data);
            setFilteredPelanggan(data); // Awalnya, data yang ditampilkan sama dengan semua data
        }
        setLoading(false);
    }, []);

    // Mengambil data saat komponen pertama kali dimuat
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // useEffect untuk melakukan filtering setiap kali searchTerm atau data asli berubah
    useEffect(() => {
        if (searchTerm === '') {
            // Jika pencarian kosong, tampilkan semua data
            setFilteredPelanggan(allPelanggan);
        } else {
            // Jika ada teks, filter data dari 'allPelanggan'
            const lowercasedFilter = searchTerm.toLowerCase();
            const filteredData = allPelanggan.filter(item =>
                // Cari kecocokan di nama ATAU id pelanggan
                (item.nama_pelanggan && item.nama_pelanggan.toLowerCase().includes(lowercasedFilter)) ||
                (item.id_pelanggan && item.id_pelanggan.toLowerCase().includes(lowercasedFilter))
            );
            setFilteredPelanggan(filteredData);
        }
    }, [searchTerm, allPelanggan]);

    // Fungsi untuk menghapus pelanggan
    const handleDelete = async (pelangganId) => {
        const isConfirm = window.confirm('Apakah anda yakin ingin menghapus pelanggan ini?');
        if (!isConfirm) return;

        try {
            const { data, error } = await deletePelanggan(pelangganId);

            if (error) throw new Error(error.message);

            // Setelah berhasil menghapus, ambil ulang data terbaru dari server
            fetchAllData();
            alert('Data Pelanggan Berhasil Dihapus!');

        } catch (error) {
            alert('Error menghapus data: ' + error.message);
        }
    };

    // Helper function untuk mendapatkan styling status
    const getStatusStyle = (status) => {
        const statusStyles = {
            'aktif': 'bg-green-100 text-green-800',
            'tidak aktif': 'bg-red-100 text-red-800',
            'bongkar': 'bg-orange-100 text-orange-800',
            'bongkar adm': 'bg-orange-200 text-orange-900',
            'daftar pemasangan': 'bg-blue-100 text-blue-800',
            'penonaktifan': 'bg-gray-100 text-gray-800',
            'penyambungan kembali': 'bg-purple-100 text-purple-800',
            'siap sambung': 'bg-cyan-100 text-cyan-800'
        };
        return statusStyles[status] || 'bg-gray-100 text-gray-800';
    };

    // Daftar status yang tersedia
    const statusOptions = [
        'aktif',
        'tidak aktif',
        'bongkar',
        'bongkar adm',
        'daftar pemasangan',
        'penonaktifan',
        'penyambungan kembali',
        'siap sambung'
    ];

    // Fungsi untuk mengubah status pelanggan
    const handleStatusToggle = async (pelangganId, currentStatus) => {
        // Cycle ke status berikutnya
        const currentIndex = statusOptions.indexOf(currentStatus || 'aktif');
        const nextIndex = (currentIndex + 1) % statusOptions.length;
        const newStatus = statusOptions[nextIndex];
        
        const confirmMessage = `Apakah anda yakin ingin mengubah status menjadi "${newStatus}"?`;

        const isConfirm = window.confirm(confirmMessage);
        if (!isConfirm) return;

        try {
            // Buat FormData untuk update
            const formData = new FormData();
            formData.append('status_pelanggan', newStatus);

            const { data, error } = await updatePelanggan(pelangganId, formData);

            if (error) throw new Error(error.message);

            // Update data lokal untuk UI yang responsive
            setAllPelanggan(prev => prev.map(p =>
                p.id === pelangganId
                    ? { ...p, status_pelanggan: newStatus }
                    : p
            ));

            setFilteredPelanggan(prev => prev.map(p =>
                p.id === pelangganId
                    ? { ...p, status_pelanggan: newStatus }
                    : p
            ));

            alert(`Status pelanggan berhasil diubah menjadi "${newStatus}"!`);

        } catch (error) {
            alert('Error mengubah status: ' + error.message);
        }
    };

    return (
        <>
            <div className="bg-gray-200 pt-20 pb-10 px-8 sm:px-16 min-h-screen">
                <Navbar />

                <div className="my-16">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Daftar Pelanggan</h1>
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <div className="flex w-full justify-between items-center mb-6">
                            {/* --- FORM PENCARIAN --- */}
                            <div className="w-full lg:w-1/3 mt-4 sm:mt-0">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Cari ID atau Nama Pelanggan..."
                                    className='w-full py-2 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>
                        </div>

                        <div className="rounded-lg">
                            {loading ? (
                                <p className="text-center py-8 text-gray-500">Memuat data pelanggan...</p>
                            ) : (
                                // Render data dari state 'filteredPelanggan'
                                filteredPelanggan.length > 0 ? (
                                    filteredPelanggan.map((pelanggan) => (
                                        <div key={pelanggan.id} className="py-4 px-8 mb-4 rounded-lg border border-gray-200 shadow-lg transition hover:shadow-xl">
                                            <Link to={`/daftar-pelanggan/detail/${pelanggan.id}`} className="block">
                                                <div className="sm:flex items-center gap-8 cursor-pointer">
                                                    <img src={pelanggan.foto_rumah_url ? `http://localhost:3001${pelanggan.foto_rumah_url}` : './image-break.png'} alt="Foto Rumah" className='w-20 h-20 object-cover rounded-md mx-auto sm:mx-0' />
                                                    <div className="flex-grow my-4 sm:my-0 text-center sm:text-left">
                                                        <div className="flex gap-2 sm:gap-4 items-center mb-2 justify-center sm:justify-start">
                                                            <h2 className='font-semibold text-lg sm:text-xl text-blue-600'>{pelanggan.id_pelanggan}</h2>
                                                            <h2 className='font-medium text-gray-400'>|</h2>
                                                            <h2 className='font-medium text-lg sm:text-xl text-gray-800'>{pelanggan.nama_pelanggan}</h2>
                                                        </div>
                                                        <h5 className='text-gray-600 text-sm'>{pelanggan.alamat}</h5>
                                                        <div className="mt-2 flex justify-between items-center">
                                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(pelanggan.status_pelanggan || 'aktif')}`}>
                                                                {pelanggan.status_pelanggan || 'aktif'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                            <div className="flex justify-center sm:justify-end items-center gap-4 mt-4 sm:mt-0">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleStatusToggle(pelanggan.id, pelanggan.status_pelanggan || 'aktif');
                                                        }}
                                                        className="px-4 py-2 font-medium rounded-md text-sm transition-all duration-200 bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                        title="Ubah status pelanggan (cycle)"
                                                    >
                                                        Ubah Status
                                                    </button>
                                                <Link to={`/daftar-pelanggan/edit-pelanggan/${pelanggan.id}`}>
                                                    <button
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md text-sm"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Update
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(pelanggan.id);
                                                    }}
                                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-8">Tidak ada data yang ditemukan.</p>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default List;