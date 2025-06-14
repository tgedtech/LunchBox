import React from 'react';
import LogOutIcon from '../assets/icons/logout.svg?react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function MasterDataHeader({ title, onAdd }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="mb-6 px-2">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-quicksand font-bold text-primary mb-1">{title}</h1>
        <div className="flex items-center space-x-2 font-nunito-sans">
          {onAdd && (
            <button
              className="btn btn-primary btn-sm"
              onClick={onAdd}
            >
              + Add
            </button>
          )}
          <button
            className="btn btn-sm btn-ghost text-base-content hover:text-primary flex items-center space-x-1"
            onClick={handleLogout}
          >
            <LogOutIcon className="w-5 h-5 text-error" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MasterDataHeader;