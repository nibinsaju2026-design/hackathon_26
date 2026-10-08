import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:8080/api/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [navigate]);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error('Error marking as read', err);
    }
  };

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Notifications</h2>
      
      {notifications.length === 0 ? (
        <div className="bg-gray-800 p-8 text-center rounded-lg border border-gray-700">
          <p className="text-gray-400">You're all caught up!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 rounded-lg border ${notification.read ? 'bg-gray-800 border-gray-700' : 'bg-gray-700 border-blue-500'}`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{notification.type}</h3>
                  <p className="text-gray-300 mt-1">{notification.content}</p>
                </div>
                {!notification.read && (
                  <span className="bg-blue-600 text-xs px-2 py-1 rounded-full">New</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
