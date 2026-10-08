import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import ListingDetail from './pages/ListingDetail';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Notifications from './pages/Notifications';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        <nav className="p-4 border-b border-gray-800 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-400">PU Marketplace</Link>
          <div className="flex gap-4 text-sm font-medium">
            <Link to="/" className="hover:text-blue-300">Explore</Link>
            <Link to="/wishlist" className="hover:text-blue-300">Wishlist</Link>
            <Link to="/orders" className="hover:text-blue-300">Orders</Link>
            <Link to="/notifications" className="hover:text-blue-300">Alerts</Link>
            <Link to="/dashboard" className="hover:text-blue-300">Dashboard</Link>
          </div>
        </nav>
        <main className="p-4 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
