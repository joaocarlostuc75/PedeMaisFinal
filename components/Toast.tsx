
import React, { useEffect } from 'react';
import { useStore } from '../store';

export const ToastContainer = () => {
  const { notifications, removeNotification } = useStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {notifications.map(note => (
        <Toast key={note.id} {...note} onClose={() => removeNotification(note.id)} />
      ))}
    </div>
  );
};

const Toast = ({ type, message, onClose }: { type: 'success' | 'error' | 'info', message: string, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  return (
    <div className={`${styles[type]} px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 min-w-[300px] animate-bounce-in`}>
      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">
        {icons[type]}
      </div>
      <p className="font-bold text-sm">{message}</p>
      <button onClick={onClose} className="ml-auto text-white/60 hover:text-white">✕</button>
    </div>
  );
};
