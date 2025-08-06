import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
      const checkSession = async () => {
        const {data: {session}} = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      };

      checkSession();

      const {data: authListener} = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
      });
    }, [])

    if (isAuthenticated === null) {
        return <div className="">Loading</div>;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to='/' replace />;
}

export default ProtectedRoute;
