import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {}
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded-lg shadow-lg text-sm border ${
              toast.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/60 text-emerald-100"
                : toast.type === "error"
                ? "bg-rose-500/10 border-rose-500/60 text-rose-100"
                : "bg-slate-700/90 border-slate-500 text-slate-100"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
