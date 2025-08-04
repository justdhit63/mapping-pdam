import React from 'react'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import { FaSearch } from 'react-icons/fa'

const Map = () => {
    return (
        <>
            <Header />
            <div className="bg-gray-200 py-16 px-10">
                <Navbar />

                {/* Map Section */}
                <div className="my-8 bg-white p-8">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.0030172983147!2d107.88916291006747!3d-7.240492671084131!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68b02596639be5%3A0x35ebb1ab630db18!2sPDAM%20Tirta%20Intan%20Garut!5e0!3m2!1sid!2sid!4v1754229997346!5m2!1sid!2sid" className='w-full h-56 sm:h-96 mb-8 rounded-lg' allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                    <form action="" className='flex shadow-md mb-8'>
                        <input type="text" name="" id="" placeholder='Cari..' className='w-full py-2 px-4 rounded-l-xl border border-gray-300' />
                        <button type="submit" className='px-4 py-2 border rounded-r-xl border-gray-300'>
                            <FaSearch />
                        </button>
                    </form>
                    <div className="rounded-lg shadow-md">
                        <h3 className='font-medium sm:text-2xl mb-4'>Daftar Pelanggan</h3>
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

export default Map
