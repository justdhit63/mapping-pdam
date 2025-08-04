import React from 'react'
import { FaUserCircle } from 'react-icons/fa'

const Header = () => {
    return (
        <>
            <header className="grid grid-cols-2 sm:grid-cols-3 items-center w-full py-4 px-8 bg-[#7da7db]">
                <img src="./logo.png" alt="" className='w-20' />
                <div className="mx-auto text-center hidden sm:block">
                    <h1 className='text-white font-bold text-2xl'>PDAM Tirta Intan</h1>
                    <h5 className='text-white text-xl'>Sistem Mapping Data Pelanggan</h5>
                </div>
                <div className="flex justify-end items-center text-white space-x-2">
                    <span>User</span>
                    <FaUserCircle size={32} />
                </div>
            </header>
        </>
    )
}

export default Header
