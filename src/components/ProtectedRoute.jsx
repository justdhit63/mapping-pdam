import React from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = () => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    return user ? <Outlet /> : <Navigate to='/' replace />
}

export default ProtectedRoute
