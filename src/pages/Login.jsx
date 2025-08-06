import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();

    useEffect(() => {
      const checkSession = async () => {
        const {data: {session}} = await supabase.auth.getSession();
        if (session) navigate('/dashboard', {replace: true});
      };
    
      checkSession();
    }, [navigate]);
    

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            alert('Login Gagal' + error.message);
        } else {
            alert('Login Berhasil!');
            navigate('/dashboard');
        }
        setLoading(false);
    }

    return (
        <>
            <div className="h-screen grid grid-cols-2 items-center">
                <div className="bg-blue-300 w-full h-full">Foto</div>
                <div className="bg-white w-full h-full p-10 flex items-center justify-center">
                    <div className="">
                        <h1 className='font-semibold text-2xl'>Sign In</h1>
                        <h5 className="text-gray-500 mb-8">Lorem, ipsum dolor sit amet consectetur adipisicing.</h5>
                        <form onSubmit={handleLogin} className="">
                            <h1 className="">Email</h1>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder='email@example.com'
                                className='py-2 px-4 border rounded-md w-full border-gray-400 shadow-md mb-8'
                                required
                            />
                            <h1 className="">Password</h1>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder='Password'
                                className='py-2 px-4 border rounded-md w-full border-gray-400 shadow-md mb-8'
                                required
                            />
                            <button type="submit" disabled={loading} className='rounded-lg py-2 px-4 bg-blue-400 text-white font-medium w-1/2'>{loading ? 'Loading..' : 'Sign In'}</button>
                        </form>
                    </div>
                </div>

            </div>
        </>
    )
}

export default Login
