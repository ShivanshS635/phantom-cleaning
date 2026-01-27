import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white fixed">
      <h1 className="text-xl font-bold p-5 border-b border-gray-700">
        Phantom Cleaning
      </h1>

      <nav className="p-4 space-y-3">
        <Link to="/dashboard" className="block hover:text-gray-300">
          Dashboard
        </Link>

        <Link to="/employees" className="block hover:text-gray-300">
          Employees
        </Link>

        <Link to="/jobs" className="block hover:text-gray-300">
          Jobs
        </Link>
      </nav>
    </div>
  );
}