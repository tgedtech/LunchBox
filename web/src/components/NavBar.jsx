import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <div className="navbar bg-base-200 mb-4 shadow">
      <div className="flex-1 px-4 text-xl font-bold">Lunchbox</div>
      <div className="flex-none space-x-4 px-4">
        <Link to="/" className="btn btn-ghost">Home</Link>
        <Link to="/inventory" className="btn btn-ghost">Inventory</Link>
        <Link to="/shopping-list" className="btn btn-ghost">Shopping List</Link>
        <Link to="/recipes" className="btn btn-ghost">Recipes</Link>
      </div>
    </div>
  );
}

export default NavBar;