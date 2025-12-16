import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate();
    const { signIn, user } = useAuth();

    useEffect(() => {
        // Redirect jika sudah login
        if (user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);
    

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signIn(email, password);
            // Navigation akan otomatis via AuthContext
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login gagal. Periksa email dan password Anda.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="min-h-screen p-8 bg-linear-to-r from-gray-200 to-blue-300/70">
            <img src="./logo.png" alt="" className='w-20 h-20' />
                <div className="w-full sm:w-3/4 lg:w-1/2 drop-shadow-lg mx-auto bg-white/50 rounded-4xl px-10 py-20 flex items-center justify-center">
                    <div className="w-full">
                        <h1 className='font-semibold text-2xl text-center'>Sign In</h1>
                        <h5 className="text-gray-500 text-center">Lorem ipsum dolor sit amet.</h5>
                        <div className="border border-gray-300 my-8 w-3/4 mx-auto"></div>
                        {error && (
                            <div className="w-3/4 mx-auto mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleLogin} className="w-3/4 mx-auto">
                            <h1 className="">Email</h1>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder='email@example.com'
                                className='py-2 px-4 border rounded-2xl bg-gray-50 w-full border-gray-400 shadow-md mb-8'
                                required
                            />
                            <h1 className="">Password</h1>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder='Password'
                                className='py-2 px-4 border rounded-2xl bg-gray-50 w-full border-gray-400 shadow-md mb-8'
                                required
                            />
                            <button type="submit" disabled={loading} className='rounded-full w-full p-3 bg-blue-400/70 hover:bg-blue-400 text-white font-medium shadow-md'>{loading ? 'Loading..' : 'Sign In'}</button>
                        </form>
                    </div>
                </div>

            </div>
        </>
    )
}

export default Login
