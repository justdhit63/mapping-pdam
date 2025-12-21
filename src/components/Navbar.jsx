import { useEffect, useState } from "react"
import { FaChartPie, FaKeyboard, FaList, FaMap, FaUserCircle, FaCrown, FaHome, FaPlus, FaUsers, FaUserPlus, FaClipboardList, FaFilePdf } from "react-icons/fa";
import { FaArrowRightFromBracket, FaChartSimple, FaPenToSquare } from "react-icons/fa6";
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext.jsx";

const Navbar = () => {
    const [isNavOpen, setIsNavOpen] = useState(true);
    const navigate = useNavigate();
    const { user, profile, signOut } = useAuth();
    const [navItems, setNavItems] = useState([]);

    useEffect(() => {
        if (profile) {
            // Different navigation items based on role
            let items = [];
            
            if (profile.role === 'admin') {
                // Admin navigation
                items = [
                    { name: 'Dashboard', path: '/dashboard', icon: FaHome },
                    { name: 'Admin Panel', path: '/admin', icon: FaCrown },
                    { name: 'Registrasi', path: '/admin/registrations', icon: FaClipboardList },
                    { name: 'Peta', path: '/peta', icon: FaMap },
                    { name: 'Export PDF', path: '/export-pdf', icon: FaFilePdf },
                ];
            } else {
                // Regular user navigation
                items = [
                    { name: 'Dashboard', path: '/dashboard', icon: FaHome },
                    { name: 'Peta', path: '/peta', icon: FaMap },
                    { name: 'Input Data', path: '/input-data', icon: FaPlus },
                    { name: 'Pelanggan', path: '/daftar-pelanggan', icon: FaUsers },
                    { name: 'Export PDF', path: '/export-pdf', icon: FaFilePdf },
                ];
            }

            setNavItems(items);
        }
    }, [profile]);

    const handleLogout = async () => {
        const isConfirm = window.confirm('Apakah anda yakin akan keluar?');
        if (!isConfirm) return;
        
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }


    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    }
    return (
        <>

            <div className="flex justify-center items-center mx-auto z-50">
                <nav className={`flex fixed w-4/5 gap-2 lg:gap-2 lg:justify-between xl:justify-center justify-center xl:gap-20 mx-auto bg-white py-3 lg:py-4 rounded-2xl shadow-lg border ${
                    profile?.role === 'admin' ? 'border-teal-300 bg-gradient-to-r from-teal-50 to-white' : 'border-gray-200'
                } text-base lg:text-lg px-3 lg:px-4 mb-8 z-50`}>
                    {/* Logo */}
                    <div className="flex items-center gap-1 lg:gap-2">
                        <img src="/logo.png" alt="" className="w-12 h-12 lg:w-16 lg:h-16 p-1.5 lg:p-2 rounded-lg border border-gray-200 shadow-md" />
                        <div className="font-bold tracking-wide text-lg lg:text-xl">
                            <h1 className="text-blue-500">PDAM</h1>
                            <h1 className="text-xs lg:text-sm bg-linear-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">Tirta Intan</h1>
                            {profile?.role === 'admin' && (
                                <span className="text-[10px] lg:text-xs bg-teal-100 text-teal-800 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full font-normal">
                                    Admin Mode
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={`border border-gray-200 ${
                        profile?.role === 'admin' ? 'bg-gradient-to-r from-teal-100 to-gray-100' : 'bg-gray-100'
                    } shadow-inner rounded-full flex items-center py-2`}>
                        <button
                            onClick={toggleNav}
                            className="xl:hidden flex items-center justify-center p-1.5 xl:p-2 rounded-full bg-gray-200 shadow-md hover:bg-gray-300 mx-8 xl:mx-10"
                        >
                            <svg className="w-5 h-5 xl:w-6 xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </button>
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <NavLink 
                                    key={item.name} 
                                    to={item.path}
                                    end={item.path === '/admin' || item.path === '/dashboard'}
                                    className={({ isActive }) => `hidden xl:flex justify-center items-center gap-1 xl:gap-2 font-bold mb-4 p-2 xl:p-3 rounded-2xl sm:mb-0 mx-1 xl:mx-2 text-[11px] xl:text-xs transition-all ${
                                        isActive 
                                            ? profile?.role === 'admin' 
                                                ? 'text-white bg-gradient-to-r from-teal-400 to-teale-400 shadow-lg' 
                                                : 'text-white bg-blue-400 shadow-lg'
                                            : profile?.role === 'admin'
                                                ? 'text-teal-700 hover:text-teal-900 hover:bg-teal-200'
                                                : 'text-gray-500 hover:text-blue-300 hover:bg-gray-200'
                                    }`}
                                >
                                    {IconComponent && <IconComponent className="text-sm" />}
                                    <h5>{item.name}</h5>
                                </NavLink>
                            );
                        })}
                    </div>

                    {/* Profile */}
                    <div className="hidden sm:flex gap-2 lg:gap-4 items-center">
                        <button
                            onClick={handleLogout}
                            className="border p-1.5 lg:p-2 rounded-full bg-red-200 cursor-pointer border-gray-200 shadow-md"
                        >
                            <FaArrowRightFromBracket className="text-sm lg:text-base text-red-500" />
                        </button>
                        {profile?.role === 'admin' && (
                            <div className="border p-1.5 lg:p-2 rounded-full bg-teal-200 border-gray-200 shadow-md">
                                <FaCrown className="text-sm lg:text-base text-teal-600" />
                            </div>
                        )}
                        <FaUserCircle className="border-2 rounded-full border-sky-300 p-0.5" size='40' />
                        <div className="font-medium text-[10px] lg:text-xs w-16 lg:w-20 overflow-auto">
                            <h1 className="">{user?.email || 'Loading...'}</h1>
                            {profile?.role && (
                                <span className={`text-[10px] lg:text-xs px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full ${
                                    profile.role === 'admin' ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {profile.role}
                                </span>
                            )}
                        </div>
                    </div>
                </nav>
                <div className={`${isNavOpen ? '-translate-y-40' : 'translate-y-16'} xl:hidden border fixed transition-all ease-in-out border-gray-200 ${
                    profile?.role === 'admin' ? 'bg-gradient-to-r from-teal-100 to-gray-100' : 'bg-gray-100'
                } shadow-inner flex rounded-full items-center py-2`}>
                    {navItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <NavLink 
                                key={item.name} 
                                to={item.path}
                                end={item.path === '/admin' || item.path === '/dashboard'}
                                className={({ isActive }) => `flex justify-center items-center gap-1 font-bold rounded-2xl p-2 sm:mb-0 mx-2 text-xs transition-all ${
                                    isActive 
                                        ? profile?.role === 'admin' 
                                            ? 'text-white bg-gradient-to-r from-teal-400 to-teale-400' 
                                            : 'text-white bg-blue-400'
                                        : profile?.role === 'admin'
                                            ? 'text-teal-700 hover:text-teal-900'
                                            : 'text-gray-500 hover:text-blue-300'
                                }`}
                            >
                                {IconComponent && <IconComponent className="text-xs" />}
                                <h5 className="hidden sm:block">{item.name}</h5>
                            </NavLink>
                        );
                    })}
                    <button 
                        onClick={handleLogout} 
                        className={`sm:hidden flex justify-center items-center gap-1 font-bold rounded-2xl p-2 sm:mb-0 mx-2 text-xs ${
                            profile?.role === 'admin' ? 'text-red-600' : 'text-red-500'
                        }`}
                    >
                        <FaArrowRightFromBracket className="text-xs" />
                        Logout
                    </button>
                </div>
            </div>
        </>
    )
}

export default Navbar
