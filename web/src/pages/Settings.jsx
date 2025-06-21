import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import axios from '../utils/axiosInstance';

const DUMMY_SUBSCRIPTION = {
  type: 'Yearly',
  expiration: 'December 15, 2025',
  lastPaymentDate: '12/14/2024',
  lastPaymentAmount: '$25.00',
  opened: 'June 15, 2023',
  history: [
    { purchase: '12/14/2024', effective: '12/15/2024', amount: '$25.00', status: 'Paid' },
    { purchase: '12/14/2023', effective: '12/15/2023', amount: '$25.00', status: 'Paid' },
    { purchase: '12/14/2022', effective: '12/15/2022', amount: '$25.00', status: 'Paid' },
    { purchase: '12/13/2022', effective: '12/15/2022', amount: '$25.00', status: 'Failed' },
  ],
};

function Settings() {
  const { logout, token } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState({ email: '', createdAt: '' });
  const [emailInput, setEmailInput] = useState('');
  const [emailStatus, setEmailStatus] = useState({ type: '', message: '' });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({
    current: '',
    new1: '',
    new2: '',
  });
  const [pwStatus, setPwStatus] = useState({ type: '', message: '' });
  const [pwLoading, setPwLoading] = useState(false);

  // Fetch user info on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get('/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setEmailInput(res.data.email || '');
      } catch {
        setUser({ email: '', createdAt: '' });
      }
    }
    fetchUser();
  }, [token]);

  // Email Update Handler
  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setEmailStatus({ type: '', message: '' });

    if (!emailInput || !/\S+@\S+\.\S+/.test(emailInput)) {
      setEmailStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    try {
      const res = await axios.patch('/me/email', { email: emailInput }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      setEmailStatus({ type: 'success', message: 'Email updated successfully.' });
    } catch (err) {
      if (err.response?.status === 409) {
        setEmailStatus({ type: 'error', message: 'Email already in use.' });
      } else if (err.response?.status === 400) {
        setEmailStatus({ type: 'error', message: err.response.data.error || 'Invalid email.' });
      } else {
        setEmailStatus({ type: 'error', message: 'Failed to update email.' });
      }
    }
  };

  // Password Modal/Handlers
  const openPasswordModal = () => {
    setShowPasswordModal(true);
    setPwForm({ current: '', new1: '', new2: '' });
    setPwStatus({ type: '', message: '' });
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPwForm({ current: '', new1: '', new2: '' });
    setPwStatus({ type: '', message: '' });
    setPwLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwStatus({ type: '', message: '' });

    if (!pwForm.current || !pwForm.new1 || !pwForm.new2) {
      setPwStatus({ type: 'error', message: 'All fields are required.' });
      return;
    }
    if (pwForm.new1 !== pwForm.new2) {
      setPwStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    if (pwForm.new1.length < 8) {
      setPwStatus({ type: 'error', message: 'Password must be at least 8 characters.' });
      return;
    }

    setPwLoading(true);

    try {
      await axios.post('/me/password', {
        currentPassword: pwForm.current,
        newPassword: pwForm.new1,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPwStatus({ type: 'success', message: 'Password updated successfully.' });
      setPwLoading(false);
      setTimeout(closePasswordModal, 1200);
    } catch (err) {
      setPwLoading(false);
      if (err.response?.status === 403) {
        setPwStatus({ type: 'error', message: 'Incorrect current password.' });
      } else if (err.response?.status === 400) {
        setPwStatus({ type: 'error', message: err.response.data.error || 'Invalid password.' });
      } else {
        setPwStatus({ type: 'error', message: 'Failed to update password.' });
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Absolutely full-width, full-top header */}
      <header className="fixed top-0 left-0 right-0 w-full bg-primary text-primary-content shadow-lg flex items-center justify-between px-8 z-30" style={{ minHeight: '88px' }}>
        <h1 className="text-3xl font-quicksand font-bold">Settings</h1>
        <button
          className="btn btn-soft btn-sm btn-error flex items-center space-x-1"
          onClick={handleLogout}
        >
          <span>Log Out</span>
        </button>
      </header>

      {/* Main content (padding top matches header height) */}
      <div className="flex-1 pt-[100px] pb-24 w-full">
        <div className="flex flex-col md:flex-row gap-6 w-full px-0">
          {/* Left column */}
          <div className="flex flex-col gap-4 w-full md:w-[36rem] max-w-full px-4 md:px-8">
            {/* Account Information Card */}
            <div className="card bg-neutral-content card-lg shadow-sm rounded-xl">
              <div className="card-body">
                <h2 className="card-title font-quicksand font-black">Account Information</h2>
                <div className="pl-2">
                  {/* Email Section */}
                  <form onSubmit={handleEmailUpdate}>
                    <fieldset>
                      <legend className="font-quicksand text-sm">Change Email</legend>
                      <div className="join">
                        <input
                          type="email"
                          placeholder="Email"
                          className="input validator w-full font-nunito-sans join-item rounded-none"
                          required
                          value={emailInput}
                          onChange={e => setEmailInput(e.target.value)}
                          autoComplete="email"
                        />
                        <button
                          type="submit"
                          className="btn btn-primary btn-soft font-nunito-sans font-bold join-item rounded-r-xl rounded-l-none"
                          disabled={emailInput === user.email}
                        >
                          Update Email
                        </button>
                      </div>
                    </fieldset>
                    {emailStatus.message && (
                      <div className={`alert py-1 mt-2 alert-${emailStatus.type}`}>
                        <span>{emailStatus.message}</span>
                      </div>
                    )}
                  </form>
                  {/* Password Section */}
                  <fieldset className="mt-3">
                    <legend className="font-quicksand text-sm">Change Password</legend>
                    <button
                      className="btn btn-primary btn-soft font-nunito-sans font-bold rounded-xl"
                      onClick={openPasswordModal}
                      type="button"
                    >
                      Update Password
                    </button>
                  </fieldset>
                </div>
              </div>
            </div>
            {/* Master Data Update Card */}
            <div className="card bg-neutral-content card-lg shadow-sm rounded-xl">
              <div className="card-body">
                <h2 className="card-title font-quicksand font-black">Master Data Update</h2>
                <div className="flex flex-col gap-3">
                  <Link to="/settings/products" className="btn btn-primary btn-soft font-nunito-sans font-bold rounded-xl">
                    Update Products
                  </Link>
                  <Link to="/settings/categories" className="btn btn-primary btn-soft font-nunito-sans font-bold rounded-xl">
                    Update Categories
                  </Link>
                  <Link to="/settings/locations" className="btn btn-primary btn-soft font-nunito-sans font-bold rounded-xl">
                    Update Locations
                  </Link>
                  <Link to="/settings/units" className="btn btn-primary btn-soft font-nunito-sans font-bold rounded-xl">
                    Update Units
                  </Link>
                  <Link to="/settings/stores" className="btn btn-primary btn-soft font-nunito-sans font-bold rounded-xl">
                    Update Stores
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex-1 min-w-[320px] px-4 md:px-8">
            <div className="card bg-neutral-content card-lg shadow-sm">
              <div className="card-body">
                <h2 className="card-title font-quicksand font-black">Account Status</h2>
                <div className="flex flex-col gap-4">
                  <p className="font-nunito-sans">
                    You opened your account on <b>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : DUMMY_SUBSCRIPTION.opened}</b>.
                  </p>
                  {/* Subscription Details */}
                  <div className="stats bg-base-100 border-base-300 border">
                    <div className="stat">
                      <div className="stat-title font-quicksand">Subscription Type</div>
                      <div className="stat-value font-nunito-sans text-3xl">{DUMMY_SUBSCRIPTION.type}</div>
                      <div className="stat-actions">
                        <button className="btn btn-primary rounded-box btn-xs" disabled>Change Subscription Type</button>
                      </div>
                    </div>
                    <div className="stat">
                      <div className="stat-title font-quicksand">Expiration Date</div>
                      <div className="stat-value font-nunito-sans text-2xl">{DUMMY_SUBSCRIPTION.expiration}</div>
                      <div className="stat-actions">
                        <button className="btn btn-primary btn-soft rounded-box btn-xs" disabled>Extend Subscription</button>
                        <button className="btn btn-primary btn-soft rounded-box btn-xs" disabled>Make Recurring</button>
                      </div>
                    </div>
                    <div className="stat">
                      <div className="stat-title font-quicksand">Last Payment Date</div>
                      <div className="stat-value font-nunito-sans text-2xl">{DUMMY_SUBSCRIPTION.lastPaymentDate}</div>
                      <div className="stat-desc">{DUMMY_SUBSCRIPTION.lastPaymentAmount}</div>
                    </div>
                  </div>
                  {/* Payment History Table */}
                  <table className="table table-pin-rows">
                    <thead className="font-quicksand bg-primary-content text-primary">
                      <tr>
                        <th>Purchase Date</th>
                        <th>Effective Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody className="font-nunito-sans">
                      {DUMMY_SUBSCRIPTION.history.map((row, idx) => (
                        <tr key={idx} className={row.status === 'Failed' ? 'bg-error-content' : (row.status === 'Paid' && idx === 0 ? 'bg-succ' : '')}>
                          <td>{row.purchase}</td>
                          <td>{row.effective}</td>
                          <td>{row.amount}</td>
                          <td className={row.status === 'Failed' ? 'text-error' : 'text-success'}>{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="modal modal-open">
            <div className="modal-box rounded-2xl max-w-sm border border-base-300">
              <h2 className="text-lg font-quicksand font-black mb-2">Change Password</h2>
              <form onSubmit={handlePasswordChange}>
                <label className="label text-xs font-quicksand">Current Password</label>
                <input
                  type="password"
                  className="input input-bordered w-full font-nunito-sans"
                  value={pwForm.current}
                  onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                  autoComplete="current-password"
                  required
                />
                <label className="label text-xs font-quicksand mt-2">New Password</label>
                <input
                  type="password"
                  className="input input-bordered w-full font-nunito-sans"
                  value={pwForm.new1}
                  onChange={e => setPwForm(f => ({ ...f, new1: e.target.value }))}
                  autoComplete="new-password"
                  required
                />
                <label className="label text-xs font-quicksand mt-2">Confirm New Password</label>
                <input
                  type="password"
                  className="input input-bordered w-full font-nunito-sans"
                  value={pwForm.new2}
                  onChange={e => setPwForm(f => ({ ...f, new2: e.target.value }))}
                  autoComplete="new-password"
                  required
                />
                {pwStatus.message && (
                  <div className={`alert py-1 mt-2 alert-${pwStatus.type}`}>
                    <span>{pwStatus.message}</span>
                  </div>
                )}
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    className="btn btn-outline btn-error"
                    type="button"
                    onClick={closePasswordModal}
                    disabled={pwLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className={`btn btn-primary${pwLoading ? " loading" : ""}`}
                    type="submit"
                    disabled={pwLoading}
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>
            <div className="modal-backdrop" onClick={closePasswordModal} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;