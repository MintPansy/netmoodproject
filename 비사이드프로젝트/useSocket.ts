import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '../store/useStore';

interface RealtimeData {
  // define the shape of your realtime data here
  // e.g. id: string; value: number;
}

declare global {
  interface ImportMeta {
    env: {
      VITE_API_WS?: string;
      [key: string]: any;
    };
  }
}

let socket: Socket | null = null;
export function useSocket() {
  const push = useStore((s: { pushRealtimeData: (data: RealtimeData) => void }) => s.pushRealtimeData);
  useEffect(() => {
    if (socket) return;
    socket = io(import.meta.env.VITE_API_WS || 'http://localhost:4000', { transports: ['websocket'] });
    socket.on('connect', () => console.log('socket connected', socket!.id));
    socket.on('emotion:update', (payload: RealtimeData) => { push(payload); });
    socket.on('analysis:done', (_payload: unknown) => { /* may push summary */ });
    socket.on('disconnect', () => console.log('socket disconnected'));
    return () => { if (socket) { socket.disconnect(); socket = null; } };
  }, []);
  return socket;
}