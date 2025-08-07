import { useEffect, useState } from "react"
import { FaChartPie, FaKeyboard, FaList, FaMap, FaUserCircle } from "react-icons/fa";
import { FaArrowRightFromBracket, FaChartSimple, FaPenToSquare } from "react-icons/fa6";
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from "../supabaseClient";

const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Peta', path: '/peta' },
    { name: 'Input', path: '/input-data' },
    { name: 'Pelanggan', path: '/daftar-pelanggan' },
    { name: 'Analitik', path: '/analitik' },
]

const Navbar = () => {
    const [isNavOpen, setIsNavOpen] = useState(true);
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState('')

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        const isConfirm = window.confirm('Apakah anda yakin akan keluar?');
        const { error } = await supabase.auth.signOut();
        if (!isConfirm) return;

        if (error) {
            console.error('Error Loging Out: ', error.message);
        } else {
            navigate('/');
        }
    }


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
            <div className="w-full flex justify-center items-center mx-auto">
                <nav className={`${isNavOpen ? 'sm:flex' : 'hidden'} fixed justify-center gap-20 mx-auto bg-white py-4 rounded-2xl shadow-lg border border-gray-200 text-lg px-4 mb-8 z-50`}>
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <img src="./logo.png" alt="" className="w-16 h-16 p-2 rounded-lg border border-gray-200 shadow-md" />
                        <div className="font-bold tracking-wide text-xl">
                            <h1 className="text-blue-500">PDAM</h1>
                            <h1 className="text-sm bg-linear-to-r from-green-500 to-yellow-500 bg-clip-text text-transparent">Tirta Intan</h1>
                        </div>
                    </div>

                    <div className=" border border-gray-200 bg-gray-100 shadow-inner rounded-full flex items-center gap-2 py-2">
                        {navItems.map((item) => (
                            <NavLink key={item.name} to={item.path} className={({ isActive }) => `flex justify-center items-center font-bold mb-4 px-4 py-2 rounded-4xl sm:mb-0 mx-4 ${isActive ? 'text-white bg-blue-400' : 'text-gray-500 hover:text-blue-300'}`}>
                                <h5>{item.name}</h5>
                            </NavLink>
                        ))}
                    </div>

                    {/* Profile */}
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={handleLogout}
                            className=" border p-2 rounded-full bg-red-200 cursor-pointer border-gray-200 shadow-md"
                        >
                            <FaArrowRightFromBracket className="text-red-500" />
                        </button>
                        <FaUserCircle className="border-2 rounded-full border-sky-300 p-0.5" size='50' />
                        <div className="font-medium text-xs w-20 overflow-auto">
                            <h1 className="">{userEmail ? userEmail : 'Loading...'}</h1>
                        </div>
                    </div>
                </nav>
            </div>
        </>
    )
}

export default Navbar
