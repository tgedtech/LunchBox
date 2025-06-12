import { Link } from 'react-router-dom';
import HomeIcon from '../assets/icons/home.svg?react';
import ChangePassword from '../assets/icons/changePassword.svg?react';
import Profile from '../assets/icons/person.svg?react';
import Logout from '../assets/icons/logout.svg?react';
import Settings from '../assets/icons/settings.svg?react';

function NavBar() {
    return (
        <div className="navbar bg-primary-content shadow-md">
            <div className="flex-1">
                <a className="btn btn-ghost btn-disabled font-black font-quicksand text-xl text-primary">Lunch Box</a>
            </div>
            <div className='flex-none font-quicksand'>
                <button className="btn btn-ghost">
                    <HomeIcon className="w-6 h-6 text-secondary" />
                    <span className="ml-2 font-black text-primary">Home</span>
                </button>
                <button className="btn btn-ghost">
                    <ChangePassword className="w-6 h-6 text-secondary" />
                    <span className="ml-2 font-black text-primary">Change Password</span>
                </button>
                <button className="btn btn-ghost">
                    <Profile className="w-6 h-6 text-secondary" />
                    <span className="ml-2 font-black text-primary">Profile</span>
                </button>
                <button className="btn btn-ghost">
                    <Logout className="w-6 h-6 text-secondary" />
                    <span className="ml-2 font-black text-primary">Logout</span>
                </button>
                <button className="btn btn-ghost">
                    <Settings className="w-6 h-6 text-secondary" />
                    <span className="ml-2 font-black text-primary">Settings</span>
                </button>
            </div>
        </div>
    );
}

export default NavBar;