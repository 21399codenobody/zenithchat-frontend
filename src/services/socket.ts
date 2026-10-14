import { io, Socket } from 'socket.io-client';
import { getStoredToken } from '@/utils';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        const token = getStoredToken();
        socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            autoConnect: false
        });
    }
    return socket;
};

export const connectSocket = () => {
    const s = getSocket();
    const token = getStoredToken();
    if (token) {
        s.auth = { token };
        if (!s.connected) s.connect();
    }
};

export const disconnectSocket = () => {
    if (socket && socket.connected) {
        socket.disconnect();
        socket = null;
    }
};