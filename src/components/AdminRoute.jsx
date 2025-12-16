import React from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Navigate } from 'react-router-dom'

const AdminRoute = ({ children }) => {
    const { user, profile, loading, isAdmin } = useAuth()

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

    if (!user) {
        return <Navigate to='/' replace />
    }

    if (!isAdmin()) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    return children
}

export default AdminRoute
