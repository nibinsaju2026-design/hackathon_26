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
      <div className="min-h-screen bg-background text-white font-sans overflow-x-hidden relative">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <nav className="sticky top-0 z-50 bg-background/50 backdrop-blur-xl border-b border-border">
          <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <Link to="/" className="text-2xl font-display font-bold tracking-tight bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent hover:scale-[1.02] transition-transform">
              PU Marketplace
            </Link>
            <div className="flex gap-2 text-sm font-medium">
              <Link to="/" className="px-4 py-2.5 rounded-lg hover:bg-surface-hover transition-colors">Explore</Link>
              <Link to="/wishlist" className="px-4 py-2.5 rounded-lg hover:bg-surface-hover transition-colors">Wishlist</Link>
              <Link to="/orders" className="px-4 py-2.5 rounded-lg hover:bg-surface-hover transition-colors">Orders</Link>
              <Link to="/notifications" className="px-4 py-2.5 rounded-lg hover:bg-surface-hover transition-colors relative">
                Alerts
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
              </Link>
              <Link to="/dashboard" className="ml-2 px-5 py-2.5 rounded-lg primary-gradient font-semibold">Dashboard</Link>
            </div>
          </div>
        </nav>
        
        <main className="p-6 max-w-7xl mx-auto animate-fade-in">
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
