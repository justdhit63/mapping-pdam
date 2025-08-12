import React from 'react'
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { FaUser, FaUserAlt } from 'react-icons/fa';

const Dashboard = () => {
    return (
        <div>
            <>

                {/* Main Content */}
                <div className="bg-gray-200 py-24 px-10 sm:px-16">
                    <Navbar />

                    <h1 className="text-3xl font-bold mt-16 mb-8 text-black">Dashboard</h1>
                    {/* Card */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid sm:grid-cols-3 gap-4 mb-8">
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="flex items-center justify-between gap-8 mb-4">
                                        <h2 className="font-semibold mb-2">Total Pelanggan</h2>
                                        <div className=" p-2 border border-gray-200 rounded-xl bg-blue-200">
                                            <FaUser size='24' className='text-blue-400' />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold">1,234</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="flex items-center justify-between gap-8 mb-4">
                                        <h2 className="font-semibold mb-2">Pelanggan Aktif</h2>
                                        <div className=" p-2 border border-gray-200 rounded-xl bg-green-200">
                                            <FaUser size='24' className='text-green-400' />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold">1,234</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="flex items-center justify-between gap-8 mb-4">
                                        <h2 className="font-semibold mb-2">Pelanggan Tidak Aktif</h2>
                                        <div className=" p-2 border border-gray-200 rounded-xl bg-red-200">
                                            <FaUser size='24' className='text-red-400' />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold">1,234</p>
                                </div>
                            </div>
                            <div className="border w-full h-96 rounded-2xl bg-white shadow-lg mb-8 border-gray-300"></div>
                        </div>
                        <div className="border w-full h-96 rounded-2xl bg-white border-gray-300 shadow-md p-8">
                            <h1 className="font-medium text-xl mb-4">Pelanggan Terbaru</h1>
                            <div className="border py-2 px-4 rounded-2xl bg-gray-100 border-gray-200 shadow-inner mb-4">
                                <div className="flex items-center gap-2 font-bold text-black">
                                    <h5 className="">ID</h5>
                                    <h5 className="">|</h5>
                                    <h5 className="">Nama</h5>
                                </div>
                                <h5 className="text-gray-600">Alamat</h5>
                            </div>
                            <div className="border py-2 px-4 rounded-2xl bg-gray-100 border-gray-200 shadow-inner mb-4">
                                <div className="flex items-center gap-2 font-bold text-black">
                                    <h5 className="">ID</h5>
                                    <h5 className="">|</h5>
                                    <h5 className="">Nama</h5>
                                </div>
                                <h5 className="text-gray-600">Alamat</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        </div>
    )
}

export default Dashboard
