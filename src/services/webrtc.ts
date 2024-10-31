import { EventEmitter } from 'events';

interface PeerConnection {
  peerConnection: RTCPeerConnection;
  dataChannel: RTCDataChannel;
}

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'register' | 'user-list';
  payload: any;
  from: string;
  to: string;
}

// 在原有的 WebRTCEvents 介面中添加或修改：
export interface WebRTCEvents {
  'signaling-open': () => void;
  'signaling-close': () => void;
  'user-list': (users: string[]) => void;
  'peer-connected': (peerId: string) => void;
  'peer-disconnected': (peerId: string) => void;
  'remote-track': (data: { userId: string; track: MediaStreamTrack; streams: readonly MediaStream[] }) => void;
  'connection-state-change': (data: { userId: string; state: RTCPeerConnectionState }) => void;
  'data-channel-open': () => void;
  'data-channel-close': () => void;
  'data': (data: any) => void;  // 使用通用的 data 事件
  'screenShare': (stream: MediaStream) => void;
  'screenShareStop': () => void;
  'meetingLog': (data: LogEntry) => void;
  'error': (error: Error) => void;
  'ai-suggestion': (data: AISuggestion) => void; // 新增 AI 建議事件
}

// 添加新的介面定義
export interface CanvasData {
  type: 'drawing' | 'cursor' | 'sync';
  payload: DrawingData | CursorData | SyncData;
}

export interface CursorData {
  userId: string;
  x: number;
  y: number;
}

export interface SyncData {
  version: number;
  data: string;
  timestamp: number;
}

export interface CanvasState {
  version: number;
  data: string;
  timestamp: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawingData {
  type: 'drawing';
  points: Point[];
  color: string;
  width: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'join' | 'leave' | 'share' | 'message' | 'decision';
  user: string;
  content: string;
}

export interface AISuggestion {
  id: string;
  content: string;
  timestamp: number;
}

export class WebRTCService extends EventEmitter {
  private stream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private peerConnections: Map<string, PeerConnection> = new Map();
  private userId: string;
  private signalingSocket: WebSocket | null = null;
  private iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' }
  ];

  constructor(userId: string, signalingUrl: string) {
    super();
    this.userId = userId;
    this.initializeSignaling(signalingUrl);
  }

  private initializeSignaling(url: string) {
    this.signalingSocket = new WebSocket(url);
    
    this.signalingSocket.onopen = () => {
      this.emit('signaling-open');
      this.sendSignalingMessage({
        type: 'register',
        payload: { userId: this.userId },
        from: this.userId,
        to: 'server'
      });
    };

    this.signalingSocket.onmessage = async (event) => {
      const message: SignalingMessage = JSON.parse(event.data);
      await this.handleSignalingMessage(message);
    };

    this.signalingSocket.onclose = () => {
      this.emit('signaling-close');
      setTimeout(() => this.initializeSignaling(url), 5000);
    };

    this.signalingSocket.onerror = (error) => {
      this.emit('error', new Error(`WebSocket error: ${error.message}`));
    };
  }

  private async handleSignalingMessage(message: SignalingMessage) {
    switch (message.type) {
      case 'offer':
        await this.handleOffer(message);
        break;
      case 'answer':
        await this.handleAnswer(message);
        break;
      case 'ice-candidate':
        await this.handleIceCandidate(message);
        break;
      case 'user-list':
        this.emit('user-list', message.payload);
        break;
    }
  }

  private async createPeerConnection(remoteUserId: string): Promise<PeerConnection> {
    const peerConnection = new RTCPeerConnection({ iceServers: this.iceServers });
    const dataChannel = peerConnection.createDataChannel('data');

    this.setupPeerConnectionHandlers(peerConnection, remoteUserId);
    this.setupDataChannelHandlers(dataChannel);

    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.stream!);
      });
    }

    const connection: PeerConnection = { peerConnection, dataChannel };
    this.peerConnections.set(remoteUserId, connection);

    return connection;
  }

  private setupPeerConnectionHandlers(peerConnection: RTCPeerConnection, remoteUserId: string) {
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'ice-candidate',
          payload: event.candidate,
          from: this.userId,
          to: remoteUserId
        });
      }
    };

    peerConnection.ontrack = (event) => {
      this.emit('remote-track', {
        userId: remoteUserId,
        track: event.track,
        streams: event.streams
      });
    };

    peerConnection.onconnectionstatechange = () => {
      this.emit('connection-state-change', {
        userId: remoteUserId,
        state: peerConnection.connectionState
      });
    };
  }

  private setupDataChannelHandlers(dataChannel: RTCDataChannel) {
    dataChannel.onopen = () => {
      this.emit('data-channel-open');
    };

    dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit('data', data);
      } catch (error) {
        console.error('Error parsing data channel message:', error);
      }
    };

    dataChannel.onclose = () => {
      this.emit('data-channel-close');
    };
  }

  private async handleOffer(message: SignalingMessage) {
    const { from: remoteUserId, payload: offer } = message;
    const connection = await this.createPeerConnection(remoteUserId);
    
    await connection.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await connection.peerConnection.createAnswer();
    await connection.peerConnection.setLocalDescription(answer);

    this.sendSignalingMessage({
      type: 'answer',
      payload: answer,
      from: this.userId,
      to: remoteUserId
    });
  }

  private async handleAnswer(message: SignalingMessage) {
    const { from: remoteUserId, payload: answer } = message;
    const connection = this.peerConnections.get(remoteUserId);
    
    if (connection) {
      await connection.peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    }
  }

  private async handleIceCandidate(message: SignalingMessage) {
    const { from: remoteUserId, payload: candidate } = message;
    const connection = this.peerConnections.get(remoteUserId);
    
    if (connection) {
      await connection.peerConnection.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    }
  }

  private sendSignalingMessage(message: SignalingMessage) {
    if (this.signalingSocket?.readyState === WebSocket.OPEN) {
      this.signalingSocket.send(JSON.stringify(message));
    }
  }

  async startAudio(): Promise<MediaStream> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      this.peerConnections.forEach(({ peerConnection }) => {
        if (this.stream) {
          this.stream.getTracks().forEach(track => {
            peerConnection.addTrack(track, this.stream!);
          });
        }
      });

      return this.stream;
    } catch (error) {
      console.error('Error starting audio:', error);
      throw error;
    }
  }

  async startScreenShare(): Promise<MediaStream> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });
      this.emit('screenShare', this.screenStream);
      return this.screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      this.emit('error', new Error('Failed to start screen share'));
      throw error;
    }
  }

  stopScreenShare(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
      this.emit('screenShareStop');
    }
  }

  stopAudio() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  async connectToPeer(remoteUserId: string) {
    const connection = await this.createPeerConnection(remoteUserId);
    const offer = await connection.peerConnection.createOffer();
    await connection.peerConnection.setLocalDescription(offer);

    this.sendSignalingMessage({
      type: 'offer',
      payload: offer,
      from: this.userId,
      to: remoteUserId
    });
  }

  disconnectFromPeer(remoteUserId: string) {
    const connection = this.peerConnections.get(remoteUserId);
    if (connection) {
      connection.peerConnection.close();
      this.peerConnections.delete(remoteUserId);
    }
  }

  sendData(data: any) {
    const message = JSON.stringify(data);
    this.peerConnections.forEach(({ dataChannel }) => {
      if (dataChannel.readyState === 'open') {
        dataChannel.send(message);
      }
    });
  }

  // 新增方法來處理 AI 建議
  handleAISuggestion(data: AISuggestion) {
    this.emit('ai-suggestion', data);
  }

  cleanup() {
    this.stopAudio();
    this.stopScreenShare();
    this.peerConnections.forEach(({ peerConnection }) => {
      peerConnection.close();
    });
    this.peerConnections.clear();
    this.signalingSocket?.close();
  }

  on<K extends keyof WebRTCEvents>(event: K, listener: WebRTCEvents[K]): this {
    return super.on(event, listener);
  }

  off<K extends keyof WebRTCEvents>(event: K, listener: WebRTCEvents[K]): this {
    return super.off(event, listener);
  }
}
