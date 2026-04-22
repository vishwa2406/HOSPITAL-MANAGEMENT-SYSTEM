import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket'],
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current.id);
        socketRef.current.emit('register_user', user._id);
      });

      // Global data update listener
      socketRef.current.on('data_updated', (data) => {
        console.log('Real-time data update received:', data);
        if (data.type === 'appointments') {
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        } else if (data.type === 'payments') {
          queryClient.invalidateQueries({ queryKey: ['payments'] });
        }
      });
    }

    return () => {
      // We don't necessarily want to disconnect on unmount of a single component using this hook
      // but if the user logs out, the first check handles it.
    };
  }, [user, queryClient]);

  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return { socket: socketRef.current, emit, on, off };
};
