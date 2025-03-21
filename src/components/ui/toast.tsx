import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle2, Info } from "lucide-react";
import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { createPortal } from "react-dom";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: Toast["type"] = "info") => {
      const id = Math.random().toString(36).substring(7);
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto remove after 1 seconds
      setTimeout(() => {
        removeToast(id);
      }, 1000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return {
    ...context,
    toast: (message: string, type: Toast["type"] = "info") =>
      context.addToast(message, type),
  };
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`
              pointer-events-auto min-w-[320px] p-4 rounded-lg shadow-lg flex items-start gap-3
              ${
                toast.type === "error"
                  ? "bg-red-500 text-foreground"
                  : toast.type === "success"
                  ? "bg-green-500 text-foreground"
                  : "bg-blue-500 text-foreground"
              }
            `}
          >
            <div className="flex-shrink-0">
              {toast.type === "error" ? (
                <AlertCircle className="w-5 h-5 text-foreground" />
              ) : toast.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-foreground" />
              ) : (
                <Info className="w-5 h-5 text-foreground" />
              )}
            </div>
            <p className="text-sm flex-1 font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-foreground/80 hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
