import React, { createContext, useContext, useEffect, ReactNode, useState, useRef } from 'react';
import { ServerMessage } from './types';

interface WebSocketContextType {
    ws: WebSocket | null,
    isReady: boolean;
    message: ServerMessage | undefined;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    const [message, setMessage] = useState();
    const ws = useRef<WebSocket | null>(null);
    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8080');

        ws.current.onopen = () => {
            console.log('Connected to the polling server.');
            setIsReady(true);
        };

        ws.current.onmessage = (event) => {
            setMessage(event.data);
        };

        ws.current.onclose = () => {
            console.log('WebSocket closed');
            setIsReady(false);
        };

        return () => {
            ws.current?.close(); // Close the socket properly
            console.log('WebSocket connection closed');
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ ws: ws.current, isReady, message: message }}>
            {children}
        </WebSocketContext.Provider>
    );
};

const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }

    return context;
};

export { WebSocketProvider, useWebSocket };
