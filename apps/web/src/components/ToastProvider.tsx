import { createContext, useCallback, useContext, useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

type Toast = { id: number; message: string; kind: 'success' | 'error' };
type ToastContextValue = { toast: (message: string, kind?: Toast['kind']) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context.toast;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((message: string, kind: Toast['kind'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, kind }]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((item) => (
          <div key={item.id} className={`toast glass-panel ${item.kind === 'error' ? 'toast-error' : ''}`}>
            {item.kind === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{item.message}</span>
            <button aria-label="Dismiss notification" onClick={() => setToasts((current) => current.filter((entry) => entry.id !== item.id))}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
