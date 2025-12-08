import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * WebSocket 연결을 관리하는 Custom Hook
 * 싱글톤 패턴으로 단일 연결 유지
 */
let globalSocket: Socket | null = null;

export const useSocket = (): Socket | null => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 이미 연결이 있으면 재사용
    if (globalSocket && globalSocket.connected) {
      socketRef.current = globalSocket;
      return;
    }

    // 새 연결 생성
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';
    const socket = io(wsUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    globalSocket = socket;
    socketRef.current = socket;

    return () => {
      // 컴포넌트 언마운트 시 연결 유지 (다른 컴포넌트가 사용할 수 있음)
      // 완전히 종료하려면: socket.disconnect();
    };
  }, []);

  return socketRef.current;
};

/**
 * Socket 연결 완전 종료 (앱 종료 시 사용)
 */
export const disconnectSocket = () => {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
  }
};

