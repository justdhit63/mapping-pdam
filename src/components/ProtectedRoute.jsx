import React, { useEffect, useState } from 'react'
import { isAuthenticated } from '../services/authService.js';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const [authChecked, setAuthChecked] = useState(false);
    const [userAuthenticated, setUserAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const authenticated = isAuthenticated();
            setUserAuthenticated(authenticated);
            setAuthChecked(true);
        };

        checkAuth();
    }, []);

    if (!authChecked) {
        return <div className="">Loading...</div>;
    }

    return userAuthenticated ? <Outlet /> : <Navigate to='/' replace />;
}

export default ProtectedRoute;
