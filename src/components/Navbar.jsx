import { useState } from "react"
import { FaChartPie, FaKeyboard, FaList, FaMap } from "react-icons/fa";
import { FaChartSimple, FaPenToSquare } from "react-icons/fa6";
import { NavLink } from 'react-router-dom';

const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaChartPie /> },
    { name: 'Peta', path: '/peta', icon: <FaMap />},
    { name: 'Input Data', path: '/input-data', icon: <FaKeyboard /> },
    { name: 'Daftar Pelanggan', path: '/daftar-pelanggan', icon: <FaList /> },
    { name: 'Analitik', path: '/analitik', icon: <FaChartSimple /> },
    { name: 'Edit Profile', path: '/edit-profile', icon: <FaPenToSquare /> }
]

const Navbar = () => {
    const [isNavOpen, setIsNavOpen] = useState(true);


    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    }
    return (
        <>

            <button
                onClick={toggleNav}
                className={` rounded-md hover:bg-blue-300 focus:outline-none ${isNavOpen ? 'sm:hidden' : 'inline-block'}`}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </button>
            <nav className={`${isNavOpen ? 'sm:flex' : 'hidden'} justify-center gap-4 lg:gap-16 bg-white py-4 rounded-lg shadow-md text-lg px-4 mb-8`}>
                {navItems.map((item) => (
                    <NavLink key={item.name} to={item.path} className={({ isActive }) => `flex gap-2 justify-center items-center mb-4 sm:mb-0 ${isActive ? 'text-black font-bold' : 'text-gray-500 hover:text-blue-300'}`}>
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>
        </>
    )
}

export default Navbar
