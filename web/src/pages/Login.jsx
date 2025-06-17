import React, { useState } from 'react';
import axios from '../utils/axiosInstance';
import useAuth from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import saladImg from '../assets/images/salad.jpg';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/auth/login', { email, password });
      // Optionally persist token if remember me is checked
      login(res.data.token, remember);
      navigate('/inventory');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div
      className="hero min-h-screen bg-primary/80"
      style={{
        backgroundImage: `url(${saladImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="hero-overlay bg-opacity-80 bg-primary"></div>
      <div className="hero-content flex-col">
        <div className="card w-full max-w-md bg-base-100 shadow-xl p-8 rounded-2xl border border-base-200 font-nunito-sans">
          <h1 className="text-3xl font-quicksand font-black text-primary mb-2 text-center tracking-tight">Login to Lunch Box</h1>
          <div className="divider mb-2"></div>
          {error && <div className="alert alert-error font-bold mb-2 py-2">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label font-quicksand font-bold">
                <span className="label-text text-base-content">Email</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input input-primary input-lg rounded-lg w-full font-nunito-sans"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-control">
              <label className="label font-quicksand font-bold">
                <span className="label-text text-base-content">Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-primary input-lg rounded-lg w-full font-nunito-sans"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="form-control flex flex-row items-center mt-2">
              <input
                type="checkbox"
                className="toggle toggle-success mr-2"
                id="remember"
                checked={remember}
                onChange={() => setRemember(!remember)}
              />
              <label htmlFor="remember" className="label-text font-quicksand font-bold cursor-pointer">
                Remember me
              </label>
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full font-quicksand font-black rounded-lg tracking-wide mt-2">
              Log In
            </button>
          </form>
          <div className="mt-4 text-center">
            <span className="font-nunito-sans text-sm text-base-content/80">Don&apos;t have an account? </span>
            <Link to="/register" className="link link-primary font-quicksand font-bold">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;