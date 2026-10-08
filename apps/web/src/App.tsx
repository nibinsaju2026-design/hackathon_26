import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ToastProvider from './components/ToastProvider';
import Home from './pages/Home';
import Browse from './pages/Browse';
import ListingDetail from './pages/ListingDetail';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Notifications from './pages/Notifications';
import PostListing from './pages/PostListing';
import Profile from './pages/Profile';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/post" element={<PostListing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ToastProvider>
  );
}
