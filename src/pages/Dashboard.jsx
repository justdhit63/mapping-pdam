import React from 'react'
import Navbar from '../components/Navbar';
import Header from '../components/Header';

const Dashboard = () => {
    return (
        <div>
            <>
                <Header />

                {/* Main Content */}
                <div className="bg-gray-200 py-16 px-10">
                    <Navbar />

                    <h1 className="text-3xl font-bold mb-8 text-gray-600">Dashboard</h1>
                    {/* Card */}
                    <div className="grid sm:grid-cols-4 gap-4 text-white mb-8">
                        <div className="bg-blue-300 p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-2">Total Pelanggan</h2>
                            <p className="text-3xl font-bold">1,234</p>
                        </div>
                        <div className="bg-green-300 p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-2">Pelanggan Aktif</h2>
                            <p className="text-3xl font-bold">1,000</p>
                        </div>
                        <div className="bg-indigo-300 p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-2">Pelanggan Tidak Aktif</h2>
                            <p className="text-3xl font-bold">234</p>
                        </div>
                        <div className="bg-orange-300 p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-2">Pelanggan</h2>
                            <p className="text-3xl font-bold">234</p>
                        </div>
                    </div>
                    <div className="bg-white p-10 rounded-lg shadow-md">
                        <h3 className='font-medium text-2xl mb-4'>Pelanggan Terbaru</h3>
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
            </>
        </div>
    )
}

export default Dashboard
