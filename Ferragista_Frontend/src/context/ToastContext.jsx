import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const value = useMemo(() => ({
    success: (message) => setToast({ type: 'success', message }),
    error: (message) => setToast({ type: 'error', message }),
    info: (message) => setToast({ type: 'info', message }),
    clear: () => setToast(null),
  }), []);

  const Icon = toast?.type === 'success' ? CheckCircle2 : toast?.type === 'error' ? AlertCircle : Info;
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div id="globalAlert" className={`toast toast-${toast?.type || 'hidden'}`} role="status" aria-live="polite">
        {toast && <><Icon size={18} /><span>{toast.message}</span><button type="button" aria-label="Fechar notificação" onClick={() => setToast(null)}><X size={16} /></button></>}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast deve ser utilizado dentro de ToastProvider.');
  return context;
}
