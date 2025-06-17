import React, { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import saladImg from '../assets/images/salad.jpg';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('/auth/register', form);
      setSuccess('Account created. You may now log in.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        'Registration failed. Email may already be in use.'
      );
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
          <h1 className="text-3xl font-quicksand font-black text-primary mb-2 text-center tracking-tight">Create an Account</h1>
          <div className="divider mb-2"></div>
          {error && <div className="alert alert-error font-bold mb-2 py-2">{error}</div>}
          {success && <div className="alert alert-success font-bold mb-2 py-2">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label font-quicksand font-bold">
                <span className="label-text text-base-content">Name (optional)</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                className="input input-primary input-lg rounded-lg w-full font-nunito-sans"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
            <div className="form-control">
              <label className="label font-quicksand font-bold">
                <span className="label-text text-base-content">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="input input-primary input-lg rounded-lg w-full font-nunito-sans"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-control">
              <label className="label font-quicksand font-bold">
                <span className="label-text text-base-content">Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                className="input input-primary input-lg rounded-lg w-full font-nunito-sans"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full font-quicksand font-black rounded-lg tracking-wide">
              Register
            </button>
          </form>
          <div className="mt-4 text-center">
            <span className="font-nunito-sans text-sm text-base-content/80">Already have an account? </span>
            <Link to="/login" className="link link-primary font-quicksand font-bold">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;