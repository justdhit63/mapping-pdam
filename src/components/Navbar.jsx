import { useEffect, useState } from "react"
import { FaChartPie, FaKeyboard, FaList, FaMap, FaUserCircle, FaCrown, FaHome, FaPlus, FaUsers, FaUserPlus, FaClipboardList } from "react-icons/fa";
import { FaArrowRightFromBracket, FaChartSimple, FaPenToSquare } from "react-icons/fa6";
import { NavLink, useNavigate } from 'react-router-dom';
import { logout, getCurrentUser, getCurrentUserFromStorage, isAdmin } from "../services/authService.js";

const Navbar = () => {
    const [isNavOpen, setIsNavOpen] = useState(true);
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState('');
    const [userRole, setUserRole] = useState('');
    const [navItems, setNavItems] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = await getCurrentUser();
                if (user) {
                    setUserEmail(user.email);
                    setUserRole(user.role);
                    
                    // Different navigation items based on role
                    let items = [];
                    
                    if (user.role === 'admin') {
                        // Admin navigation
                        items = [
                            { name: 'Dashboard', path: '/dashboard', icon: FaHome },
                            { name: 'Admin Panel', path: '/admin', icon: FaCrown },
                            { name: 'Registrasi', path: '/admin/registrations', icon: FaClipboardList },
                            { name: 'Peta', path: '/peta', icon: FaMap },
                        ];
                    } else {
                        // Regular user navigation
                        items = [
                            { name: 'Dashboard', path: '/dashboard', icon: FaHome },
                            { name: 'Peta', path: '/peta', icon: FaMap },
                            { name: 'Input Data', path: '/input-data', icon: FaPlus },
                            { name: 'Pelanggan', path: '/daftar-pelanggan', icon: FaUsers },
                        ];
                    }

                    setNavItems(items);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                // Fallback ke localStorage
                const fallbackUser = getCurrentUserFromStorage();
                if (fallbackUser) {
                    setUserEmail(fallbackUser.email);
                    setUserRole(fallbackUser.role);
                }
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = () => {
        const isConfirm = window.confirm('Apakah anda yakin akan keluar?');
        if (!isConfirm) return;
        
        logout();
        navigate('/');
    }


    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    }
    return (
        <>

            <div className="flex justify-center items-center mx-auto z-50">
                <nav className={`flex fixed w-4/5 gap-4 lg:gap-2 justify-center xl:gap-20 mx-auto bg-white py-4 rounded-2xl shadow-lg border ${
                    userRole === 'admin' ? 'border-teal-300 bg-gradient-to-r from-teal-50 to-white' : 'border-gray-200'
                } text-lg px-4 mb-8 z-50`}>
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="" className="w-16 h-16 p-2 rounded-lg border border-gray-200 shadow-md" />
                        <div className="font-bold tracking-wide text-xl">
                            <h1 className="text-blue-500">PDAM</h1>
                            <h1 className="text-sm bg-linear-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">Tirta Intan</h1>
                            {userRole === 'admin' && (
                                <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full font-normal">
                                    Admin Mode
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={`border border-gray-200 ${
                        userRole === 'admin' ? 'bg-gradient-to-r from-teal-100 to-gray-100' : 'bg-gray-100'
                    } shadow-inner rounded-full flex items-center py-2`}>
                        <button
                            onClick={toggleNav}
                            className="lg:hidden flex items-center justify-center p-2 rounded-full bg-gray-200 shadow-md hover:bg-gray-300 mx-10"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </button>
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <NavLink 
                                    key={item.name} 
                                    to={item.path} 
                                    className={({ isActive }) => `hidden lg:flex justify-center items-center gap-2 font-bold mb-4 p-3 rounded-2xl sm:mb-0 mx-2 text-xs transition-all ${
                                        isActive 
                                            ? userRole === 'admin' 
                                                ? 'text-white bg-gradient-to-r from-teal-400 to-teale-400 shadow-lg' 
                                                : 'text-white bg-blue-400 shadow-lg'
                                            : userRole === 'admin'
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
                    <div className="hidden sm:flex gap-4 items-center">
                        <button
                            onClick={handleLogout}
                            className=" border p-2 rounded-full bg-red-200 cursor-pointer border-gray-200 shadow-md"
                        >
                            <FaArrowRightFromBracket className="text-red-500" />
                        </button>
                        {userRole === 'admin' && (
                            <div className="border p-2 rounded-full bg-teal-200 border-gray-200 shadow-md">
                                <FaCrown className="text-teal-600" />
                            </div>
                        )}
                        <FaUserCircle className="border-2 rounded-full border-sky-300 p-0.5" size='50' />
                        <div className="font-medium text-xs w-20 overflow-auto">
                            <h1 className="">{userEmail ? userEmail : 'Loading...'}</h1>
                            {userRole && (
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    userRole === 'admin' ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {userRole}
                                </span>
                            )}
                        </div>
                    </div>
                </nav>
                <div className={`${isNavOpen ? '-translate-y-40' : 'translate-y-16'} lg:hidden border fixed transition-all ease-in-out border-gray-200 ${
                    userRole === 'admin' ? 'bg-gradient-to-r from-teal-100 to-gray-100' : 'bg-gray-100'
                } shadow-inner flex rounded-full items-center py-2`}>
                    {navItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <NavLink 
                                key={item.name} 
                                to={item.path} 
                                className={({ isActive }) => `flex justify-center items-center gap-1 font-bold rounded-2xl p-2 sm:mb-0 mx-2 text-xs transition-all ${
                                    isActive 
                                        ? userRole === 'admin' 
                                            ? 'text-white bg-gradient-to-r from-teal-400 to-teale-400' 
                                            : 'text-white bg-blue-400'
                                        : userRole === 'admin'
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
                            userRole === 'admin' ? 'text-red-600' : 'text-red-500'
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
