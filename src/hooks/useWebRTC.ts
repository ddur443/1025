// src/hooks/useWebRTC.ts
import { useEffect, useState, useCallback } from 'react';
import { WebRTCService, WebRTCEvents } from '@/services/webrtc';

interface WebRTCHook {
  webRTC: WebRTCService | null;
  isInitialized: boolean;
  connectedUsers: string[];
  connectionStatus: string;
  startAudio: () => Promise<MediaStream>;
  stopAudio: () => void;
  startScreenShare: () => Promise<MediaStream>;
  stopScreenShare: () => void;
  connectToPeer: (remoteUserId: string) => void;
  disconnectFromPeer: (remoteUserId: string) => void;
  sendData: (data: any) => void;
  on: <K extends keyof WebRTCEvents>(event: K, handler: WebRTCEvents[K]) => void;
  off: <K extends keyof WebRTCEvents>(event: K, handler: WebRTCEvents[K]) => void;
}

export const useWebRTC = (userId: string): WebRTCHook => {
  const [webRTC, setWebRTC] = useState<WebRTCService | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');

  useEffect(() => {
    const service = new WebRTCService(
      userId,
      'ws://localhost:8080'  // 信令服務器地址
    );

    // 基本連接事件
    service.on('signaling-open', () => {
      setConnectionStatus('connected');
    });

    service.on('signaling-close', () => {
      setConnectionStatus('disconnected');
    });

    service.on('user-list', (users: string[]) => {
      setConnectedUsers(users.filter(id => id !== userId));
    });

    // 連接狀態變化
    service.on('connection-state-change', ({ userId, state }) => {
      console.log(`Connection state changed for ${userId}: ${state}`);
    });

    // 錯誤處理
    service.on('error', (error: Error) => {
      console.error('WebRTC Error:', error);
    });

    setWebRTC(service);

    return () => {
      if (service) {
        service.cleanup();
      }
    };
  }, [userId]);

  const startAudio = useCallback(async () => {
    if (!webRTC) {
      throw new Error('WebRTC not initialized');
    }
    try {
      const stream = await webRTC.startAudio();
      return stream;
    } catch (error) {
      console.error('Failed to start audio:', error);
      throw error;
    }
  }, [webRTC]);

  const stopAudio = useCallback(() => {
    if (webRTC) {
      webRTC.stopAudio();
    }
  }, [webRTC]);

  const startScreenShare = useCallback(async () => {
    if (!webRTC) {
      throw new Error('WebRTC not initialized');
    }
    try {
      const stream = await webRTC.startScreenShare();
      return stream;
    } catch (error) {
      console.error('Failed to start screen share:', error);
      throw error;
    }
  }, [webRTC]);

  const stopScreenShare = useCallback(() => {
    if (webRTC) {
      webRTC.stopScreenShare();
    }
  }, [webRTC]);

  const connectToPeer = useCallback((remoteUserId: string) => {
    if (!webRTC) {
      throw new Error('WebRTC not initialized');
    }
    try {
      webRTC.connectToPeer(remoteUserId);
    } catch (error) {
      console.error('Failed to connect to peer:', error);
      throw error;
    }
  }, [webRTC]);

  const disconnectFromPeer = useCallback((remoteUserId: string) => {
    if (webRTC) {
      webRTC.disconnectFromPeer(remoteUserId);
    }
  }, [webRTC]);

  const sendData = useCallback((data: any) => {
    if (!webRTC) {
      throw new Error('WebRTC not initialized');
    }
    try {
      webRTC.sendData(data);
    } catch (error) {
      console.error('Failed to send data:', error);
      throw error;
    }
  }, [webRTC]);

  const on = useCallback(<K extends keyof WebRTCEvents>(
    event: K,
    handler: WebRTCEvents[K]
  ) => {
    if (!webRTC) {
      console.warn('WebRTC not initialized, event listener not added');
      return;
    }
    webRTC.on(event, handler);
  }, [webRTC]);

  const off = useCallback(<K extends keyof WebRTCEvents>(
    event: K,
    handler: WebRTCEvents[K]
  ) => {
    if (webRTC) {
      webRTC.off(event, handler);
    }
  }, [webRTC]);

  return {
    webRTC,
    isInitialized: webRTC !== null,
    connectedUsers,
    connectionStatus,
    startAudio,
    stopAudio,
    startScreenShare,
    stopScreenShare,
    connectToPeer,
    disconnectFromPeer,
    sendData,
    on,
    off
  };
};