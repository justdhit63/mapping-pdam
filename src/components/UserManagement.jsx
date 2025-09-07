import React, { useState, useEffect } from 'react';
import {
    getAllUsers,
    createUser,
    createBulkUsers,
    updateUser,
    deleteUser,
    deleteBulkUsers,
    toggleUserStatus
} from '../services/adminService.js';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Form states
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        position: '',
        phone: '',
        password: ''
    });

    const [bulkUsers, setBulkUsers] = useState('');

    // Load users on component mount
    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        const result = await getAllUsers();
        if (result.error) {
            setError(result.error);
        } else {
            setUsers(result.data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        let result;
        if (editingUser) {
            result = await updateUser(editingUser.id, formData);
        } else {
            result = await createUser(formData);
        }

        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(editingUser ? 'User updated successfully!' : 'User created successfully!');
            resetForm();
            loadUsers();
        }
        setLoading(false);
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Parse bulk users input (CSV-like format)
            const usersArray = bulkUsers.split('\n').filter(line => line.trim()).map(line => {
                const [email, full_name, position, phone, password] = line.split(',').map(item => item.trim());
                return { email, full_name, position, phone, password };
            });

            if (usersArray.length === 0) {
                setError('No valid users to create');
                setLoading(false);
                return;
            }

            const result = await createBulkUsers(usersArray);
            if (result.error) {
                setError(result.error);
            } else {
                setSuccess(`Bulk creation completed! ${result.data.createdUsers.length} users created.`);
                if (result.data.errors.length > 0) {
                    setError(`${result.data.errors.length} errors occurred. Check console for details.`);
                    console.log('Bulk creation errors:', result.data.errors);
                }
                setBulkUsers('');
                setShowBulkModal(false);
                loadUsers();
            }
        } catch (err) {
            setError('Invalid bulk user format');
        }
        setLoading(false);
    };

    const handleDelete = async (userId) => {
        if (!confirm('Are you sure? This will also delete all pelanggan data for this user.')) return;

        setLoading(true);
        const result = await deleteUser(userId);
        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(`User deleted successfully! ${result.data.deletedPelanggan} pelanggan records also removed.`);
            loadUsers();
        }
        setLoading(false);
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.length === 0) {
            setError('No users selected');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${selectedUsers.length} users and all their pelanggan data?`)) return;

        setLoading(true);
        const result = await deleteBulkUsers(selectedUsers);
        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(`Bulk deletion completed! ${result.data.deletedUsers.length} users deleted, ${result.data.totalDeletedPelanggan} pelanggan records removed.`);
            if (result.data.errors.length > 0) {
                setError(`${result.data.errors.length} errors occurred.`);
            }
            setSelectedUsers([]);
            loadUsers();
        }
        setLoading(false);
    };

    const handleToggleStatus = async (userId) => {
        setLoading(true);
        const result = await toggleUserStatus(userId);
        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(result.data.message);
            loadUsers();
        }
        setLoading(false);
    };

    const resetForm = () => {
        setFormData({
            email: '',
            full_name: '',
            position: '',
            phone: '',
            password: ''
        });
        setEditingUser(null);
        setShowAddModal(false);
    };

    const startEdit = (user) => {
        setFormData({
            email: user.email,
            full_name: user.full_name,
            position: user.position || '',
            phone: user.phone || '',
            password: '' // Don't prefill password
        });
        setEditingUser(user);
        setShowAddModal(true);
    };

    const handleSelectUser = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        setSelectedUsers(
            selectedUsers.length === users.length 
                ? [] 
                : users.map(user => user.id)
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <div className="space-x-2">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Add User
                    </button>
                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                        Bulk Add
                    </button>
                    {selectedUsers.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                        >
                            Delete Selected ({selectedUsers.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {success}
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:p-6">
                    {loading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.length === users.length && users.length > 0}
                                                onChange={handleSelectAll}
                                                className="rounded"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Position
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phone
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pelanggan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(user.id)}
                                                    onChange={() => handleSelectUser(user.id)}
                                                    className="rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.full_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.position || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.phone || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.total_pelanggan}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    user.is_active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => startEdit(user)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(user.id)}
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                >
                                                    {user.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                                No users found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            {editingUser ? 'Edit User' : 'Add New User'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Position</label>
                                <input
                                    type="text"
                                    value={formData.position}
                                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Password {editingUser && '(leave blank to keep current)'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : (editingUser ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Add Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-3/4 max-w-2xl shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Bulk Add Users</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Enter user data in CSV format (one user per line):<br/>
                            <code>email,full_name,position,phone,password</code>
                        </p>
                        <form onSubmit={handleBulkSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Users Data</label>
                                <textarea
                                    rows="10"
                                    required
                                    value={bulkUsers}
                                    onChange={(e) => setBulkUsers(e.target.value)}
                                    placeholder="john@example.com,John Doe,Manager,08123456789,password123&#10;jane@example.com,Jane Smith,Staff,08987654321,password456"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowBulkModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create Users'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
