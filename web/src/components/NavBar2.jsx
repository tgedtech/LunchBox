import { Link } from 'react-router-dom';

function NavBar() {
    return (
        <div>
        <div className="navbar bg-primary-content shadow-md">
            <div className="flex-1">
                <a className="btn btn-ghost btn-disabled font-black font-quicksand text-xl text-primary">Lunch Box</a>
            </div>
            <div className='flex-none'>
                <button className="btn btn-square btn-ghost">
                    <img src="https://cdn.tged.tech/icons/home.svg" alt="Home" className="w-6 h-6 inline mr-2 text-primary"/>
                </button>
            </div>
        </div>
        </div>
    );
}

export default NavBar;