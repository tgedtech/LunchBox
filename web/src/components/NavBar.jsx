import { Link } from 'react-router-dom';
import HomeIcon from '../assets/icons/home.svg?react';
import ChangePassword from '../assets/icons/changePassword.svg?react';
import Profile from '../assets/icons/person.svg?react';
import Logout from '../assets/icons/logout.svg?react';
import Settings from '../assets/icons/settings.svg?react';
import UserIcon from '../assets/icons/circle-user-regular.svg?react';

function NavBar() {
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
                        <li><a className="justify-between">Profile</a></li>
                        <li><a>Settings</a></li>
                        <li><a>Logout</a></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default NavBar;