// web/src/pages/ResetPassword.jsx
import { useState } from 'react';
import axios from '../utils/axiosInstance';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('123456'); // prefill for local
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await axios.post('/auth/reset-password', { email, code, newPassword });
      setMsg('Password reset! You can now log in.');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Reset failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <form onSubmit={submit} className="w-full max-w-sm p-6 rounded-xl border shadow space-y-3">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <input className="input input-bordered w-full"
               placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input input-bordered w-full"
               placeholder="Code (123456)" value={code} onChange={e=>setCode(e.target.value)} />
        <input className="input input-bordered w-full"
               type="password" placeholder="New password"
               value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
        <button className="btn btn-primary w-full" type="submit">Reset</button>
        {msg && <div className="text-sm mt-2">{msg}</div>}
      </form>
    </div>
  );
}