import { SignalingClient } from '../entities/signaling-client';

export interface WebRtcUser {
    pc: RTCPeerConnection;
    username: string;
    ip: string;
    isHost: boolean;
}

export type SocketEventHandler = (msg: { data: string }) => void;

export interface SignalingClientParams {
    onMessage?: SocketEventHandler;
    onConnect?: SocketEventHandler;
}

export interface PeerCreationParams {
    userName: string;
    me: boolean;
    signalingClient: SignalingClient;
}
