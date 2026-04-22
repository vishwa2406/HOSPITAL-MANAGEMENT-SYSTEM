import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';

const SocketContext = createContext(undefined);

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function SocketProvider({ children }) {
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

      socketRef.current.on('data_updated', (data) => {
        console.log('Real-time data update received:', data);
        if (data.type === 'appointments') {
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
          queryClient.invalidateQueries({ queryKey: ['doctor-all-appointments'] });
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
          queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
          queryClient.invalidateQueries({ queryKey: ['recent-appointments'] });
          queryClient.invalidateQueries({ queryKey: ['booked-slots'] });
        } else if (data.type === 'payments') {
          queryClient.invalidateQueries({ queryKey: ['payments'] });
        }
      });

      socketRef.current.on('receive_message', (message) => {
        // This can be handled by individual chat components, 
        // but global invalidation is also possible
        queryClient.invalidateQueries({ queryKey: ['chats'] });
      });
    }

    return () => {
      // Keep connection alive while user is logged in
    };
  }, [user, queryClient]);

  const emit = (event, data) => {
    socketRef.current?.emit(event, data);
  };

  const on = (event, callback) => {
    socketRef.current?.on(event, callback);
  };

  const off = (event, callback) => {
    socketRef.current?.off(event, callback);
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, emit, on, off }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
