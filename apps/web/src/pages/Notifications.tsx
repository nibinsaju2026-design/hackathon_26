import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { api } from '../lib/api';
import type { NotificationItem } from '../lib/types';
import useRequireAuth from '../lib/useRequireAuth';
import { useToast } from '../components/ToastProvider';
import { EmptyState, PageHeading } from '../components/UI';

export default function Notifications() {
  const user = useRequireAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    setLoading(true);
    try { setNotifications(await api<NotificationItem[]>('/api/notifications', { auth: true })); setError(''); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load notifications.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const markRead = async (notification: NotificationItem) => {
    if (notification.read) return;
    try {
      await api(`/api/notifications/${notification.id}/read`, { method: 'PATCH', auth: true });
      setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, read: true } : item));
    } catch (err) { toast(err instanceof Error ? err.message : 'Could not update notification.', 'error'); }
  };

  if (!user) return null;
  return (
    <div>
      <PageHeading eyebrow="Stay in the loop" title="Notifications" description="A heads-up when something needs your attention." />
      {loading ? <div className="glass-panel p-8 muted animate-pulse">Loading notifications…</div> : error ? <EmptyState title="Notifications unavailable" description={error} action={<button className="button-secondary" onClick={() => void load()}>Try again</button>} /> : notifications.length === 0 ? <EmptyState title="You're all caught up" description="New offers and marketplace updates will appear here." /> : <div className="grid gap-3">{notifications.map((notification) => (
        <button key={notification.id} type="button" className={`notice-row glass-panel text-left ${notification.read ? '' : 'notice-unread'}`} onClick={() => void markRead(notification)}>
          <span className="feature-icon !mb-0"><Bell size={17} /></span>
          <span className="flex-1"><strong className="block text-sm">{notification.type}</strong><span className="block muted text-xs mt-1">{notification.content}</span><span className="block muted text-[10px] mt-2">{new Date(notification.createdAt).toLocaleString('en-IN')}</span></span>
          {notification.read ? <span className="muted text-[10px]">Read</span> : <span className="verified-badge"><Check size={13} /> New</span>}
        </button>
      ))}</div>}
    </div>
  );
}
