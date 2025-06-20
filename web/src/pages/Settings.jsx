import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MasterDataHeader from '../components/MasterDataHeader';
import useAuth from '../hooks/useAuth'; // Assumes you have this for user context
import axios from '../utils/axiosInstance';

function Settings() {
  const { user, refreshUser } = useAuth(); // adapt as needed
  const [showPwd, setShowPwd] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  // Change Password State
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  // Change Email State
  const [emailNew, setEmailNew] = useState('');
  const [emailPwd, setEmailPwd] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  // Password change handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');
    if (!pwdCurrent || !pwdNew || !pwdConfirm) {
      setPwdError('All fields are required.');
      return;
    }
    if (pwdNew !== pwdConfirm) {
      setPwdError('New passwords do not match.');
      return;
    }
    try {
      await axios.post('/auth/change-password', {
        oldPassword: pwdCurrent,
        newPassword: pwdNew,
      });
      setPwdSuccess('Password updated.');
      setPwdCurrent('');
      setPwdNew('');
      setPwdConfirm('');
    } catch (err) {
      setPwdError(err?.response?.data?.message || 'Failed to change password.');
    }
  };

  // Email change handler
  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');
    if (!emailNew || !emailPwd) {
      setEmailError('All fields are required.');
      return;
    }
    try {
      await axios.post('/auth/change-email', {
        newEmail: emailNew,
        password: emailPwd,
      });
      setEmailSuccess('Email updated. Please verify your new address.');
      setEmailNew('');
      setEmailPwd('');
      refreshUser?.(); // Optional, update user context
    } catch (err) {
      setEmailError(err?.response?.data?.message || 'Failed to change email.');
    }
  };

  return (
    <div className="p-4 pb-24">
      <MasterDataHeader title="Settings" />

      <div className="space-y-4">

        {/* Master Data Section */}
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-2">Master Data</h2>
          <div className="flex flex-col space-y-2">
            <Link to="/settings/products" className="link link-primary">Manage Products</Link>
            <Link to="/settings/categories" className="link link-primary">Manage Categories</Link>
            <Link to="/settings/locations" className="link link-primary">Manage Locations</Link>
            <Link to="/settings/units" className="link link-primary">Manage Units</Link>
            <Link to="/settings/stores" className="link link-primary">Manage Stores</Link>
          </div>
        </div>

        {/* User Settings Section */}
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-2">User Settings</h2>

          {/* Show current email */}
          <div className="mb-4">
            <span className="font-bold">Current Email: </span>
            <span>{user?.email || <span className="text-gray-400">Not set</span>}</span>
          </div>

          {/* Change Email Accordion */}
          <details className="collapse mb-2" open={showEmail}>
            <summary
              className="collapse-title font-quicksand font-bold cursor-pointer"
              onClick={() => setShowEmail(!showEmail)}
            >
              Change Email
            </summary>
            <div className="collapse-content">
              <form className="space-y-2" onSubmit={handleChangeEmail}>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  placeholder="New Email Address"
                  value={emailNew}
                  onChange={e => setEmailNew(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="Current Password"
                  value={emailPwd}
                  onChange={e => setEmailPwd(e.target.value)}
                  required
                />
                {emailError && <div className="alert alert-error py-1">{emailError}</div>}
                {emailSuccess && <div className="alert alert-success py-1">{emailSuccess}</div>}
                <div className="flex justify-end">
                  <button className="btn btn-primary" type="submit">
                    Change Email
                  </button>
                </div>
              </form>
            </div>
          </details>

          {/* Change Password Accordion */}
          <details className="collapse" open={showPwd}>
            <summary
              className="collapse-title font-quicksand font-bold cursor-pointer"
              onClick={() => setShowPwd(!showPwd)}
            >
              Change Password
            </summary>
            <div className="collapse-content">
              <form className="space-y-2" onSubmit={handleChangePassword}>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="Current Password"
                  value={pwdCurrent}
                  onChange={e => setPwdCurrent(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="New Password"
                  value={pwdNew}
                  onChange={e => setPwdNew(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="Confirm New Password"
                  value={pwdConfirm}
                  onChange={e => setPwdConfirm(e.target.value)}
                  required
                />
                {pwdError && <div className="alert alert-error py-1">{pwdError}</div>}
                {pwdSuccess && <div className="alert alert-success py-1">{pwdSuccess}</div>}
                <div className="flex justify-end">
                  <button className="btn btn-primary" type="submit">
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

export default Settings;