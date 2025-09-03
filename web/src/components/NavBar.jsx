import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import CoseliLogo from '../assets/images/coseliLogo.svg';

function NavBar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="navbar bg-base-content">
      <div className="flex-1">
        <div className="join join-horizontal">
          <img src={CoseliLogo} alt="coseli Logo" className="h-10 w-10 ml-3 join-item" />
          <h1
            className="text-primary-content font-nunito-sans font-black text-3xl join-item pl-2 cursor-pointer select-none"
            onClick={() => navigate('/inventory')}
          >
            coseli
          </h1>
        </div>
      </div>

      <div className="flex gap-2">
        <input type="text" placeholder="Search" className="input input-bordered w-24 md:w-auto" />
        <div className="dropdown dropdown-end">
          <div tabIndex={0} className="btn btn-primary btn-circle avatar">
            <i className="fa-solid fa-circle-user fa-xl text-primary-content" />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content glass mt-6 p-2 rounded-box w-52 font-nunito-sans font-black"
          >
            <li><Link to="/settings">Settings</Link></li>
            <li><button type="button" onClick={handleLogout}>Logout</button></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NavBar;