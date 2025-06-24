import { Link } from 'react-router-dom';
import UserIcon from '../assets/icons/circle-user-regular.svg?react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function NavBar() {

    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleGoSettings = () => {
        navigate('/settings');
    };
    return (
        <div className="navbar bg-primary">
            <div className="flex-1">
                <a className="btn btn-ghost font-quicksand text-primary-content text-2xl font-bold">LunchBox</a>
            </div>
            <div className="flex gap-2">
                <input type="text" placeholder="Search" className="input input-bordered w-24 md:w-auto" />
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} className="btn btn-info btn-circle avatar">
                        <UserIcon className="w-6 h-6 text-info-content" />
                    </div>
                    <ul tabIndex={0} className="menu menu-compact dropdown-content glass mt-6 p-2 rounded-box w-52 font-nunito-sans font-black">
                        <li>
                            <Link to="/settings">Settings</Link>
                        </li>
                        <li>
                            <button type="button" onClick={handleLogout}>Logout</button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default NavBar;