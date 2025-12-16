import React, { useState, useEffect } from 'react';
import { cabangService, usersService } from '../services/supabaseServices';

const CabangManagement = () => {
    const [cabangData, setCabangData] = useState([]);
    const [usersWithoutCabang, setUsersWithoutCabang] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [selectedCabang, setSelectedCabang] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Form states
    const [formData, setFormData] = useState({
        kode_unit: '',
        nama_unit: '',
        alamat: '',
        telepon: ''
    });

    const [assignData, setAssignData] = useState({
        user_id: '',
        cabang_id: ''
    });

    // Load data on component mount
    useEffect(() => {
        loadCabangData();
        loadUsersWithoutCabang();
    }, []);

    const loadCabangData = async () => {
        try {
            setLoading(true);
            const data = await cabangService.getAll();
            setCabangData(data || []);
        } catch (error) {
            console.error('Error loading cabang data:', error);
            setCabangData([]);
        } finally {
            setLoading(false);
        }
    };

    const loadUsersWithoutCabang = async () => {
        try {
            const data = await usersService.getUsersWithoutCabang();
            setUsersWithoutCabang(data || []);
        } catch (error) {
            console.error('Error loading unassigned users:', error);
            setUsersWithoutCabang([]);
        }
    };

    // Handle create cabang
    const handleCreateCabang = async (e) => {
        e.preventDefault();
        try {
            await cabangService.create(formData);
            setShowCreateForm(false);
            setFormData({ kode_unit: '', nama_unit: '', alamat: '', telepon: '' });
            loadCabangData();
            alert('Cabang created successfully!');
        } catch (error) {
            console.error('Error creating cabang:', error);
            alert('Error creating cabang: ' + error.message);
        }
    };

    // Handle assign user to cabang
    const handleAssignUser = async (e) => {
        e.preventDefault();
        try {
            await usersService.assignUserToCabang(assignData.user_id, assignData.cabang_id);
            setShowAssignForm(false);
            setAssignData({ user_id: '', cabang_id: '' });
            loadCabangData();
            loadUsersWithoutCabang();
            alert('User assigned successfully!');
        } catch (error) {
            console.error('Error assigning user:', error);
            alert('Error assigning user: ' + error.message);
        }
    };

    // Handle bulk assign
    const handleBulkAssign = async () => {
        if (selectedUsers.length === 0 || !assignData.cabang_id) {
            alert('Please select users and a cabang');
            return;
        }

        try {
            await usersService.bulkAssignUsersToCabang(selectedUsers, assignData.cabang_id);
            setSelectedUsers([]);
            setAssignData({ user_id: '', cabang_id: '' });
            loadCabangData();
            loadUsersWithoutCabang();
            alert('Users assigned successfully!');
        } catch (error) {
            console.error('Error bulk assigning users:', error);
            alert('Error bulk assigning users: ' + error.message);
        }
    };

    // Handle toggle cabang status
    const handleToggleStatus = async (cabangId) => {
        try {
            await cabangService.toggleStatus(cabangId);
            loadCabangData();
            alert('Cabang status updated!');
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Error updating status: ' + error.message);
        }
    };

    // Handle delete cabang
    const handleDeleteCabang = async (cabangId, cabangName) => {
        if (window.confirm(`Are you sure you want to delete "${cabangName}"? This will remove cabang assignment from all users in this cabang.`)) {
            try {
                await cabangService.delete(cabangId);
                loadCabangData();
                loadUsersWithoutCabang();
                alert('Cabang deleted successfully!');
            } catch (error) {
                console.error('Error deleting cabang:', error);
                alert('Error deleting cabang: ' + error.message);
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Cabang Management</h2>
                <div className="space-x-2">
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {showCreateForm ? 'Cancel' : 'Add New Cabang'}
                    </button>
                    <button
                        onClick={() => setShowAssignForm(!showAssignForm)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        {showAssignForm ? 'Cancel' : 'Assign Users'}
                    </button>
                </div>
            </div>

            {/* Create Cabang Form */}
            {showCreateForm && (
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="text-lg font-semibold mb-4">Create New Cabang</h3>
                    <form onSubmit={handleCreateCabang} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kode Unit *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.kode_unit}
                                onChange={(e) => setFormData({ ...formData, kode_unit: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., PDM001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Unit *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.nama_unit}
                                onChange={(e) => setFormData({ ...formData, nama_unit: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., PDAM Cabang Pusat"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Alamat
                            </label>
                            <input
                                type="text"
                                value={formData.alamat}
                                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Address"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Telepon
                            </label>
                            <input
                                type="text"
                                value={formData.telepon}
                                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Phone number"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create Cabang
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Assign Users Form */}
            {showAssignForm && (
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="text-lg font-semibold mb-4">Assign Users to Cabang</h3>
                    
                    {/* Single Assignment */}
                    <div className="mb-6">
                        <h4 className="font-medium mb-2">Single Assignment</h4>
                        <form onSubmit={handleAssignUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select User
                                </label>
                                <select
                                    value={assignData.user_id}
                                    onChange={(e) => setAssignData({ ...assignData, user_id: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Choose a user...</option>
                                    {usersWithoutCabang.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.full_name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Cabang
                                </label>
                                <select
                                    value={assignData.cabang_id}
                                    onChange={(e) => setAssignData({ ...assignData, cabang_id: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Choose a cabang...</option>
                                    {cabangData.filter(c => c.is_active).map(cabang => (
                                        <option key={cabang.id} value={cabang.id}>
                                            {cabang.kode_unit} - {cabang.nama_unit}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Assign User
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Bulk Assignment */}
                    <div className="border-t pt-6">
                        <h4 className="font-medium mb-2">Bulk Assignment</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Multiple Users
                                </label>
                                <div className="border border-gray-300 rounded-lg p-2 max-h-32 overflow-y-auto">
                                    {usersWithoutCabang.map(user => (
                                        <div key={user.id} className="flex items-center mb-1">
                                            <input
                                                type="checkbox"
                                                id={`user-${user.id}`}
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedUsers([...selectedUsers, user.id]);
                                                    } else {
                                                        setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                                    }
                                                }}
                                                className="mr-2"
                                            />
                                            <label htmlFor={`user-${user.id}`} className="text-sm">
                                                {user.full_name} ({user.email})
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Cabang for Bulk Assignment
                                </label>
                                <select
                                    value={assignData.cabang_id}
                                    onChange={(e) => setAssignData({ ...assignData, cabang_id: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Choose a cabang...</option>
                                    {cabangData.filter(c => c.is_active).map(cabang => (
                                        <option key={cabang.id} value={cabang.id}>
                                            {cabang.kode_unit} - {cabang.nama_unit}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleBulkAssign}
                                    className="w-full mt-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                                    disabled={selectedUsers.length === 0 || !assignData.cabang_id}
                                >
                                    Bulk Assign ({selectedUsers.length} users)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cabang List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Cabang List ({cabangData.length})</h3>
                </div>

                {cabangData.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        No cabang found. Create your first cabang to get started.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kode Unit
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nama Unit
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Alamat
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Telepon
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Users
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {cabangData.map((cabang) => (
                                    <tr key={cabang.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {cabang.kode_unit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {cabang.nama_unit}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                            {cabang.alamat || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {cabang.telepon || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                {cabang.total_users} users
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                cabang.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {cabang.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleToggleStatus(cabang.id)}
                                                    className={`px-3 py-1 rounded text-xs ${
                                                        cabang.is_active
                                                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    } transition-colors`}
                                                >
                                                    {cabang.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCabang(cabang.id, cabang.nama_unit)}
                                                    className="bg-red-100 text-red-800 px-3 py-1 rounded text-xs hover:bg-red-200 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Users without Cabang */}
            {usersWithoutCabang.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">
                        Users without Cabang ({usersWithoutCabang.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {usersWithoutCabang.map(user => (
                            <div key={user.id} className="text-sm text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                                {user.full_name} ({user.email})
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CabangManagement;
