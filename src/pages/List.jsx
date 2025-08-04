import React from 'react'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import { FaSearch } from 'react-icons/fa'

const List = () => {
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
                        <div className="py-4 px-8 mb-4 rounded-lg border border-gray-300 shadow-lg sm:flex items-center gap-8">
                            <img src="./image-break.png" alt="" className='w-20 mx-auto sm:mx-0' />
                            <div className="">
                                <div className="flex gap-2 sm:gap-8 items-center mb-2 justify-center">
                                    <h2 className='font-medium text-xs sm:text-xl'>ID Pelanggan</h2>
                                    <h2 className='font-medium text-xs sm:text-xl'>|</h2>
                                    <h2 className='font-medium text-xs sm:text-xl'>Nama Pelanggan</h2>
                                </div>
                                <h5 className='text-gray-600 text-xs text-center sm:text-left'>Alamat Pelanggan</h5>
                            </div>
                        </div>
                        <div className="py-4 px-8 mb-4 rounded-lg border border-gray-300 shadow-lg sm:flex items-center gap-8">
                            <img src="./image-break.png" alt="" className='w-20 mx-auto sm:mx-0' />
                            <div className="">
                                <div className="flex gap-2 sm:gap-8 items-center mb-2 justify-center">
                                    <h2 className='font-medium text-xs sm:text-xl'>ID Pelanggan</h2>
                                    <h2 className='font-medium text-xs sm:text-xl'>|</h2>
                                    <h2 className='font-medium text-xs sm:text-xl'>Nama Pelanggan</h2>
                                </div>
                                <h5 className='text-gray-600 text-xs text-center sm:text-left'>Alamat Pelanggan</h5>
                            </div>
                        </div>
                        <div className="py-4 px-8 mb-4 rounded-lg border border-gray-300 shadow-lg sm:flex items-center gap-8">
                            <img src="./image-break.png" alt="" className='w-20 mx-auto sm:mx-0' />
                            <div className="">
                                <div className="flex gap-2 sm:gap-8 items-center mb-2 justify-center">
                                    <h2 className='font-medium text-xs sm:text-xl'>ID Pelanggan</h2>
                                    <h2 className='font-medium text-xs sm:text-xl'>|</h2>
                                    <h2 className='font-medium text-xs sm:text-xl'>Nama Pelanggan</h2>
                                </div>
                                <h5 className='text-gray-600 text-xs text-center sm:text-left'>Alamat Pelanggan</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default List
