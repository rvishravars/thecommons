import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: 'bg-logic-600 border-logic-500',
  error: 'bg-red-600 border-red-500',
  info: 'bg-intuition-600 border-intuition-500',
  warning: 'bg-imagination-600 border-imagination-500',
};

export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const Icon = iconMap[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`flex items-center space-x-3 rounded-lg border-2 ${colorMap[type]} px-4 py-3 shadow-lg animate-slide-in`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
