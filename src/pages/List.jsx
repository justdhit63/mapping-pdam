import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import { FaSearch } from 'react-icons/fa'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

const List = () => {
    const [pelangganList, setPelangganList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPelanggan = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('pelanggan')
                .select('*');

            if (error) {
                console.error('Error Fetching Data: ', error);
            } else {
                setPelangganList(data);
            }
            setLoading(false);
        };

        fetchPelanggan();
    }, [])

    const handleDelete = async (pelangganId) => {
        const isConfirm = window.confirm('Apakah anda yakin ingin menghapus pelanggan ini?');
        if (!isConfirm) return;

        try {
            const { error } = await supabase
                .from('pelanggan')
                .delete()
                .eq('id', pelangganId);

            if (error) throw error;

            setPelangganList(pelangganList.filter(p => p.id !== pelangganId));
            alert('Data Pelanggan Berhasil Dihapus!')
        } catch (error) {
            alert('Error menghapus data: ' + error.message);
        }
    }


    return (
        <>
            <Header />
            <div className="bg-gray-200 py-16 px-10">
                <Navbar />

                {/* Map Section */}
                <div className="my-8 bg-white p-8">
                    <form action="" className='flex shadow-md mb-8'>
                        <input type="text" name="" id="" placeholder='Cari..' className='w-full py-2 px-4 rounded-l-xl border border-gray-300' />
                        <button type="submit" className='px-4 py-2 border rounded-r-xl border-gray-300'>
                            <FaSearch />
                        </button>
                    </form>
                    <div className="rounded-lg shadow-md">
                        {loading ? (
                            <p className="">Loading</p>
                        ) : (
                            pelangganList.map((pelanggan) => (
                                <div key={pelanggan.id} className="py-4 px-8 mb-4 rounded-lg border border-gray-300 shadow-lg sm:flex items-center gap-8">
                                    <img src={pelanggan.foto_rumah_url || './image-break.png'} alt="Foto Rumah" className='w-20 mx-auto sm:mx-0' />
                                    <div className="">
                                        <div className="flex gap-2 sm:gap-8 items-center mb-2 justify-center">
                                            <h2 className='font-medium text-xs sm:text-xl'>{pelanggan.id_pelanggan}</h2>
                                            <h2 className='font-medium text-xs sm:text-xl'>|</h2>
                                            <h2 className='font-medium text-xs sm:text-xl'>{pelanggan.nama_pelanggan}</h2>
                                        </div>
                                        <h5 className='text-gray-600 text-xs text-center sm:text-left'>{pelanggan.alamat}</h5>
                                    </div>
                                    <div className="flex justify-center sm:justify-end gap-4 mt-4 sm:mt-0">
                                        <Link to={`/edit-pelanggan/${pelanggan.id}`}>
                                            <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">
                                                Update
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(pelanggan.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default List
