import React from 'react'
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { FaFloppyDisk } from 'react-icons/fa6';

const Form = () => {
    return (
        <>
            <Header />
            <div className="bg-gray-200 py-16 px-10">
                <Navbar />

                {/* Form Section */}
                <div className="bg-white p-8">
                    <form action="" className="flex flex-col justify-center w-full">
                        <div className="sm:flex gap-4 mb-4">
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>No. ID Pelanggan</h1>
                                <input type="text" name="id" id="id" className='border w-1/2 lg:w-3/4 border-blue-400 px-4 py-2 rounded-l-lg' placeholder='ID' />
                                <button className='bg-blue-400 w-1/2 lg:w-1/4 border border-blue-400 py-2 px-4 rounded-r-lg text-white'>Generate</button>
                            </div>
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Nama Pelanggan</h1>
                                <input type="text" name="id" id="id" className='border w-full border-blue-400 px-4 py-2 rounded-lg' placeholder='Nama' />
                            </div>
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>No. Telpon</h1>
                                <input type="text" name="id" id="id" className='border w-full border-blue-400 px-4 py-2 rounded-lg' placeholder='08xxxxxxxxxx' />
                            </div>
                        </div>
                        <h1 className='mb-2'>No. ID Pelanggan</h1>
                        <textarea name="" id="" placeholder='Alamat' className='border w-full border-blue-400 px-4 py-2 rounded-lg h-40 shadow-md mb-4'></textarea>
                        <div className="sm:flex gap-4 mb-4">
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Jumlah Jiwa</h1>
                                <input type="text" name="id" id="id" className='border w-full border-blue-400 px-4 py-2 rounded-lg' placeholder='' />
                            </div>
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Jenis Meter Air</h1>
                                <input type="text" name="id" id="id" className='border w-full border-blue-400 px-4 py-2 rounded-lg' placeholder='' />
                            </div>
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Tanggal Pemasangan</h1>
                                <input type="date" name="id" id="id" className='border w-full border-blue-400 px-4 py-2 rounded-lg' placeholder='08xxxxxxxxxx' />
                            </div>
                        </div>
                        <h1 className="mb-2">Lokasi Pemasangan</h1>
                        <div className="sm:flex gap-4 mb-4 p-4 border border-gray-200 shadow-sm rounded-lg">
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Longtitude</h1>
                                <input type="text" name="id" id="id" className='border w-full border-blue-400 px-4 py-2 rounded-lg' placeholder='' />
                            </div>
                            <div className="w-full shadow-md">
                                <h1 className='mb-2'>Latitude</h1>
                                <input type="text" name="id" id="id" className='border w-full border-blue-400 px-4 py-2 rounded-lg' placeholder='' />
                            </div>
                        </div>
                        <div className="w-full mb-8">
                            <h1 className="mb-2">Foto Rumah</h1>
                            <div className="flex items-center gap-4 border rounded-lg border-blue-400">
                                <input type="file" name="file" id="file" className='hidden' />
                                <label htmlFor="file" className='cursor-pointer bg-blue-400 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-500 transition text-xs sm:text-base'>
                                    Pilih File
                                </label>
                                <span id="file-name" className="text-gray-500 text-xs sm:text-base">Belum ada file yang dipilih</span>
                            </div>
                        </div>
                        <button type="submit" className='w-full bg-blue-400 font-bold py-2 text-white flex justify-center items-center gap-2 rounded-lg cursor-pointer'><FaFloppyDisk/> <span>Simpan</span></button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Form
